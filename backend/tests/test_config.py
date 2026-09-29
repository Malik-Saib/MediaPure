from app.config import Settings


def test_render_postgres_url_uses_asyncpg_driver():
    settings = Settings(database_url="postgresql://user:password@db.example/media")
    assert settings.database_url == "postgresql+asyncpg://user:password@db.example/media"


def test_postgres_url_with_legacy_scheme_uses_asyncpg_driver():
    settings = Settings(database_url="postgres://user:password@db.example/media")
    assert settings.database_url == "postgresql+asyncpg://user:password@db.example/media"
