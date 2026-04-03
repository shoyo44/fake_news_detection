from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    cf_account_id: str = ""
    cf_api_token: str = ""
    cf_llm_model: str = "@cf/meta/llama-3.1-8b-instruct"
    cf_embed_model: str = "@cf/baai/bge-base-en-v1.5"
    tavily_api_key: str = ""

    @property
    def cf_base_url(self) -> str:
        return f"https://api.cloudflare.com/client/v4/accounts/{self.cf_account_id}/ai/run"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
