from fastapi import FastAPI

from app.config import get_settings
from app.services.parser_client import ParserClient


def create_app() -> FastAPI:
    app = FastAPI(title="AskPDF Backend")

    @app.on_event("startup")
    async def startup() -> None:
        settings = get_settings()
        app.state.parser_client = ParserClient(
            base_url=settings.parser_api_base_url,
            api_key=settings.parser_api_key,
        )

    @app.on_event("shutdown")
    async def shutdown() -> None:
        client: ParserClient | None = getattr(app.state, "parser_client", None)
        if client is not None:
            await client.close()

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
