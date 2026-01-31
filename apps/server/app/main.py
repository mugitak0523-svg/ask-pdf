from fastapi import FastAPI

from app.api import documents, search
from app.config import get_settings
from app.db.pool import close_pool, create_pool
from app.services.indexer import Indexer
from app.services.parser_client import ParserClient
from app.services.storage import create_storage_client


def create_app() -> FastAPI:
    app = FastAPI(title="AskPDF Backend")

    @app.on_event("startup")
    async def startup() -> None:
        settings = get_settings()
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

    return app


app = create_app()
