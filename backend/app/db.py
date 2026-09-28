import logging
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings


log = logging.getLogger("aimr.db")


class Base(DeclarativeBase):
    pass


_settings = get_settings()
engine = create_async_engine(_settings.database_url, pool_pre_ping=True,
                             **({} if _settings.database_url.startswith("sqlite") else
                                {"pool_size": 10, "max_overflow": 10}))
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


# Columns added after the first release. `create_all` only creates missing tables, so a
# database from an earlier version needs them added explicitly. Each entry is additive
# and has a default, so older rows stay valid and a rollback keeps working.
ADDED_COLUMNS: dict[str, dict[str, str]] = {
    "processing_jobs": {"media": "VARCHAR(8) DEFAULT 'image'"},
}


def _add_missing_columns(conn) -> None:
    from sqlalchemy import inspect as sa_inspect, text

    inspector = sa_inspect(conn)
    existing_tables = set(inspector.get_table_names())
    for table, columns in ADDED_COLUMNS.items():
        if table not in existing_tables:
            continue  # create_all just built it with every column present
        have = {c["name"] for c in inspector.get_columns(table)}
        for name, ddl in columns.items():
            if name in have:
                continue
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
            log.info("added column %s.%s", table, name)


async def init_db() -> None:
    from . import models  # noqa: F401 - register tables

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_add_missing_columns)
