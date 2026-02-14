from dataclasses import dataclass
import os

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    parser_api_base_url: str
    parser_api_key: str
    parser_api_prefix: str
    database_url: str
    supabase_url: str
    supabase_service_role_key: str
    supabase_bucket: str
    supabase_jwt_secret: str
    supabase_jwt_aud: str
    supabase_jwks_url: str
    chat_model_fast: str | None
    chat_model_standard: str | None
    chat_model_think: str | None
    rag_top_k: int
    rag_min_k: int
    rag_score_threshold: float
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_plus_price_id: str
    app_base_url: str
    admin_user_ids: list[str]
    max_concurrent_uploads: int


def _require_env(name: str) -> str:
    value = os.getenv(name, "")
    if not value:
        raise ValueError(f"{name} is required")
    return value


def get_settings() -> Settings:
    base_url = _require_env("PARSER_API_BASE_URL").rstrip("/")
    api_key = _require_env("PARSER_API_KEY")
    parser_api_prefix = os.getenv("PARSER_API_PREFIX", "").strip()
    database_url = _require_env("DATABASE_URL")
    supabase_url = _require_env("SUPABASE_URL").rstrip("/") + "/"
    supabase_service_role_key = _require_env("SUPABASE_SERVICE_ROLE_KEY")
    supabase_bucket = os.getenv("SUPABASE_BUCKET", "pdfs")
    supabase_jwt_secret = _require_env("SUPABASE_JWT_SECRET")
    supabase_jwt_aud = os.getenv("SUPABASE_JWT_AUD", "authenticated")
    supabase_jwks_url = os.getenv(
        "SUPABASE_JWKS_URL",
        f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json",
    )
    chat_model_fast = os.getenv("CHAT_MODEL_FAST", "").strip() or None
    chat_model_standard = os.getenv("CHAT_MODEL_STANDARD", "").strip() or None
    chat_model_think = os.getenv("CHAT_MODEL_THINK", "").strip() or None
    rag_top_k = int(os.getenv("RAG_TOP_K", "5") or "5")
    rag_min_k = int(os.getenv("RAG_MIN_K", "2") or "2")
    rag_score_threshold = float(os.getenv("RAG_SCORE_THRESHOLD", "0.2") or "0.2")
    stripe_secret_key = _require_env("STRIPE_SECRET_KEY")
    stripe_webhook_secret = _require_env("STRIPE_WEBHOOK_SECRET")
    stripe_plus_price_id = _require_env("STRIPE_PLUS_PRICE_ID")
    app_base_url = _require_env("APP_BASE_URL").rstrip("/")
    admin_user_ids_raw = os.getenv("ADMIN_USER_IDS", "")
    admin_user_ids = [
        item.strip()
        for item in admin_user_ids_raw.split(",")
        if item.strip()
    ]
    max_concurrent_uploads = int(os.getenv("MAX_CONCURRENT_UPLOADS", "2") or "2")

    return Settings(
        parser_api_base_url=base_url,
        parser_api_key=api_key,
        parser_api_prefix=parser_api_prefix,
        database_url=database_url,
        supabase_url=supabase_url,
        supabase_service_role_key=supabase_service_role_key,
        supabase_bucket=supabase_bucket,
        supabase_jwt_secret=supabase_jwt_secret,
        supabase_jwt_aud=supabase_jwt_aud,
        supabase_jwks_url=supabase_jwks_url,
        chat_model_fast=chat_model_fast,
        chat_model_standard=chat_model_standard,
        chat_model_think=chat_model_think,
        rag_top_k=rag_top_k,
        rag_min_k=rag_min_k,
        rag_score_threshold=rag_score_threshold,
        stripe_secret_key=stripe_secret_key,
        stripe_webhook_secret=stripe_webhook_secret,
        stripe_plus_price_id=stripe_plus_price_id,
        app_base_url=app_base_url,
        admin_user_ids=admin_user_ids,
        max_concurrent_uploads=max_concurrent_uploads,
    )
