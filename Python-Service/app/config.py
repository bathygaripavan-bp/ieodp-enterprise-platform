from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    service_name: str = "ieodp-python-service"
    log_level: str = "INFO"

settings = Settings()
