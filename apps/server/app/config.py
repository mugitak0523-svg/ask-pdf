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
    supabase_url = _require_env("SUPABASE_URL")
    supabase_service_role_key = _require_env("SUPABASE_SERVICE_ROLE_KEY")
    supabase_bucket = os.getenv("SUPABASE_BUCKET", "pdfs")
    supabase_jwt_secret = _require_env("SUPABASE_JWT_SECRET")
    supabase_jwt_aud = os.getenv("SUPABASE_JWT_AUD", "authenticated")
    supabase_jwks_url = os.getenv(
        "SUPABASE_JWKS_URL",
        f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json",
    )

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
    )
