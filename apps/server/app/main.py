from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.api import admin, billing, documents, messages, plans, search, usage
from app.config import get_settings
from app.db.pool import close_pool, create_pool
from app.services.indexer import Indexer
from app.services.parser_client import ParserClient
from app.services.storage import create_storage_client


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="AskPDF Backend")

    allow_origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.app_base_url.rstrip("/"),
    }
    allow_origins.update(settings.cors_allow_origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=sorted(allow_origins),
        allow_origin_regex=r"^http://(localhost|127\\.0\\.0\\.1):3000$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup() -> None:
        app.state.settings = settings
        app.state.supabase_jwks = None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(settings.supabase_jwks_url)
                response.raise_for_status()
                payload = response.json()
                app.state.supabase_jwks = payload.get("keys", [])
        except Exception:
            app.state.supabase_jwks = None
        app.state.parser_client = ParserClient(
            base_url=settings.parser_api_base_url,
            api_key=settings.parser_api_key,
            api_prefix=settings.parser_api_prefix,
        )
        app.state.db_pool = await create_pool(settings.database_url)
        storage_client = create_storage_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
            settings.supabase_bucket,
        )
        app.state.storage_client = storage_client
        app.state.indexer = Indexer(app.state.parser_client, storage_client)

    @app.on_event("shutdown")
    async def shutdown() -> None:
        parser_client: ParserClient | None = getattr(app.state, "parser_client", None)
        if parser_client is not None:
            await parser_client.close()
        await close_pool(getattr(app.state, "db_pool", None))

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(documents.router)
    app.include_router(search.router)
    app.include_router(usage.router)
    app.include_router(plans.router)
    app.include_router(billing.router)
    app.include_router(messages.router)
    app.include_router(admin.router)

    return app


app = create_app()
