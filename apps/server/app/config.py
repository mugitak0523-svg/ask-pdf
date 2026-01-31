from dataclasses import dataclass
import os

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    parser_api_base_url: str
    parser_api_key: str


def get_settings() -> Settings:
    base_url = os.getenv("PARSER_API_BASE_URL", "").rstrip("/")
    api_key = os.getenv("PARSER_API_KEY", "")
    if not base_url:
        raise ValueError("PARSER_API_BASE_URL is required")
    if not api_key:
        raise ValueError("PARSER_API_KEY is required")
    return Settings(parser_api_base_url=base_url, parser_api_key=api_key)
