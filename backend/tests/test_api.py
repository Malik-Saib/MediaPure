import pytest
from fastapi.testclient import TestClient

from app.main import app
from tests import fixtures


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_clean_download_delete(client):
    r = client.post("/api/v1/clean", content=fixtures.jpeg(),
                    headers={"Content-Type": "image/jpeg", "X-File-Name": "My%20Photo%20%E2%9C%A8.jpg"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["after"]["field_count"] == 0 and body["pixels_identical"]
    assert body["file_name"] == "My Photo-clean.jpg"
    assert r.headers["cache-control"] == "no-store"
    d = client.get(body["download_url"])
    assert d.status_code == 200 and d.content[:2] == b"\xff\xd8"
    assert b"Jane" not in d.content
    z = client.post("/api/v1/files/zip", json={"tokens": [body["token"]]})
    assert z.status_code == 200 and z.content[:2] == b"PK"
    assert client.delete(body["download_url"]).status_code == 204
    assert client.get(body["download_url"]).status_code == 404


def test_scan_only(client):
    r = client.post("/api/v1/scan", content=fixtures.png(), headers={"Content-Type": "image/png"})
    assert r.status_code == 200
    assert r.json()["report"]["field_count"] > 3


def test_rejects_bad_type_and_fake_image(client):
    assert client.post("/api/v1/clean", content=b"x" * 100, headers={"Content-Type": "text/html"}).status_code == 415
    r = client.post("/api/v1/clean", content=b"GIF89a" + b"x" * 100, headers={"Content-Type": "image/png"})
    assert r.status_code == 422


def test_path_traversal_token(client):
    assert client.get("/api/v1/files/..%2F..%2Fetc%2Fpasswd").status_code == 404


def test_contact_and_admin(client):
    r = client.post("/api/v1/contact", json={"name": "Ali", "email": "ali@example.com", "topic": "Support",
                                              "message": "Hello, testing the contact form."})
    assert r.status_code == 201
    assert client.post("/api/v1/contact", json={"name": "A", "email": "bad", "message": "short"}).status_code == 422
    assert client.get("/api/v1/admin/overview").status_code == 401
    assert client.post("/api/v1/admin/login", json={"username": "admin", "password": "nope"}).status_code == 401
    tok = client.post("/api/v1/admin/login", json={"username": "admin", "password": "test-password-123"}).json()["token"]
    h = {"Authorization": f"Bearer {tok}"}
    ov = client.get("/api/v1/admin/overview", headers=h).json()
    assert ov["totals"]["cleaned"] >= 1 and ov["totals"]["unread_messages"] >= 1
    msgs = client.get("/api/v1/admin/messages", headers=h).json()
    assert msgs[0]["email"] == "ali@example.com"
    assert client.patch(f"/api/v1/admin/messages/{msgs[0]['id']}", json={"is_read": True}, headers=h).status_code == 200


def test_rate_limit(client):
    from app.security import limiter
    codes = [client.post("/api/v1/contact", json={"name": "Bot", "email": "b@example.com",
                                                   "message": "spam spam spam spam"}).status_code for _ in range(8)]
    assert 429 in codes
    limiter._hits.clear()
