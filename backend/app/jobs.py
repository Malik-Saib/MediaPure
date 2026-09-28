"""In-process job store for work too heavy to finish inside one request.

Video cleaning can run for a minute on a large file. Holding an HTTP connection open
for that long means proxy read timeouts, no real progress reporting and a request the
browser cannot retry. So uploads return a job token immediately and the browser polls.

Jobs live in this process, like the rate limiter and the temp-file index. Run the API
as one process with several threads (the shipped Docker and systemd units do); see
DEPLOYMENT.md for what to swap in when scaling to more than one box.
"""
from __future__ import annotations

import asyncio
import logging
import secrets
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

log = logging.getLogger("aimr.jobs")

# Ordered so a client can render a progress bar without knowing the pipeline.
PHASES = ("queued", "analyzing", "cleaning", "verifying", "done")
PHASE_INDEX = {name: i for i, name in enumerate(PHASES)}

TERMINAL = {"done", "error", "cancelled"}


@dataclass
class Job:
    id: str
    kind: str                                  # "video"
    visitor: str
    file_name: str
    file_size: int
    state: str = "queued"
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    finished_at: float | None = None
    result: dict[str, Any] | None = None
    error: str | None = None
    workdir: Path | None = None
    source: Path | None = None
    token: str | None = None
    task: asyncio.Task | None = None

    @property
    def done(self) -> bool:
        return self.state in TERMINAL

    def set_state(self, state: str) -> None:
        self.state = state
        self.updated_at = time.time()
        if state in TERMINAL:
            self.finished_at = self.updated_at

    def progress(self) -> float:
        """Coarse fraction for the progress bar; the phase name carries the detail."""
        if self.state == "done":
            return 1.0
        return round(PHASE_INDEX.get(self.state, 0) / (len(PHASES) - 1), 3)

    def as_dict(self) -> dict:
        body = {
            "job_id": self.id,
            "kind": self.kind,
            "state": self.state,
            "phase": self.state,
            "progress": self.progress(),
            "file_name": self.file_name,
            "file_size": self.file_size,
            "created_at": round(self.created_at, 3),
            "elapsed_ms": round((time.time() - self.created_at) * 1000),
        }
        if self.error:
            body["error"] = self.error
        if self.result:
            body.update(self.result)
        return body


class JobStore:
    def __init__(self, *, max_pending: int, ttl_seconds: int):
        self._jobs: dict[str, Job] = {}
        self.max_pending = max_pending
        self.ttl_seconds = ttl_seconds

    def pending(self) -> int:
        return sum(1 for j in self._jobs.values() if not j.done)

    def has_room(self) -> bool:
        return self.pending() < self.max_pending

    def create(self, *, kind: str, visitor: str, file_name: str, file_size: int) -> Job:
        job = Job(id=secrets.token_urlsafe(24), kind=kind, visitor=visitor,
                  file_name=file_name, file_size=file_size)
        self._jobs[job.id] = job
        return job

    def get(self, job_id: str) -> Job | None:
        job = self._jobs.get(job_id)
        if job is None:
            return None
        if job.done and job.finished_at and time.time() - job.finished_at > self.ttl_seconds:
            self.drop(job_id)
            return None
        return job

    def drop(self, job_id: str) -> Job | None:
        return self._jobs.pop(job_id, None)

    def stats(self) -> dict:
        states: dict[str, int] = {}
        for j in self._jobs.values():
            states[j.state] = states.get(j.state, 0) + 1
        return {"tracked": len(self._jobs), "pending": self.pending(), "states": states}

    def expired(self) -> list[Job]:
        now = time.time()
        out = []
        for job in list(self._jobs.values()):
            if job.done and job.finished_at and now - job.finished_at > self.ttl_seconds:
                out.append(self._jobs.pop(job.id))
            elif not job.done and now - job.created_at > self.ttl_seconds * 2:
                # A job that never reached a terminal state (process restart, cancelled
                # task) must not keep its staged upload alive for ever.
                log.warning("dropping stalled job %s in state %s", job.id[:8], job.state)
                out.append(self._jobs.pop(job.id))
        return out
