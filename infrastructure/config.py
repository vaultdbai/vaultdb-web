import os
import json


class Config:
    """
    VaultDB Configuration Manager
    Loads settings from environment variables or a config.json file.
    Environment variables always take priority over the config file.

    Usage:
        config = Config()
        config.get("DB_HOST", default="localhost")

    Or load from file:
        config = Config(config_file="config.json")
    """

    # Default settings for VaultDB
    DEFAULTS = {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "vaultdb",
        "DB_USER": "admin",
        "DB_PASSWORD": "",
        "DATA_DIR": "./data",
        "LOG_LEVEL": "INFO",
        "MAX_CONNECTIONS": "10",
        "ENVIRONMENT": "development",
    }

    def __init__(self, config_file: str = None):
        self._config = dict(self.DEFAULTS)

        # Load from file if provided
        if config_file and os.path.exists(config_file):
            self._load_from_file(config_file)

        # Environment variables override everything
        self._load_from_env()

    def _load_from_file(self, path: str) -> None:
        """Load config from a JSON file."""
        try:
            with open(path, "r") as f:
                file_config = json.load(f)
                self._config.update(file_config)
                print(f"[Config] Loaded from {path}")
        except (json.JSONDecodeError, IOError) as e:
            print(f"[Config] Warning: Could not load {path}: {e}")

    def _load_from_env(self) -> None:
        """Override config with environment variables."""
        for key in self._config:
            env_val = os.environ.get(key)
            if env_val is not None:
                self._config[key] = env_val

    def get(self, key: str, default=None):
        """Get a config value by key."""
        return self._config.get(key, default)

    def get_int(self, key: str, default: int = 0) -> int:
        """Get a config value as integer."""
        try:
            return int(self.get(key, default))
        except (ValueError, TypeError):
            return default

    def get_bool(self, key: str, default: bool = False) -> bool:
        """Get a config value as boolean."""
        val = self.get(key, str(default)).lower()
        return val in ("true", "1", "yes")

    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.get("ENVIRONMENT", "development").lower() == "production"

    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.get("ENVIRONMENT", "development").lower() == "development"

    def all(self) -> dict:
        """Return all config values (masks password)."""
        safe = dict(self._config)
        if "DB_PASSWORD" in safe and safe["DB_PASSWORD"]:
            safe["DB_PASSWORD"] = "****"
        return safe

    def __repr__(self) -> str:
        return f"<Config env={self.get('ENVIRONMENT')} db={self.get('DB_NAME')}>"
