import logging
import os
import sys
from datetime import datetime


class Logger:
    """
    VaultDB Logger
    Structured logging with support for console and file output.

    Usage:
        logger = Logger(name="vaultdb")
        logger.info("Database started")
        logger.error("Connection failed", extra={"host": "localhost"})
    """

    LEVELS = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL,
    }

    def __init__(self, name: str = "vaultdb", level: str = "INFO", log_file: str = None):
        self.name = name
        self._logger = logging.getLogger(name)
        self._logger.setLevel(self.LEVELS.get(level.upper(), logging.INFO))

        # Avoid duplicate handlers
        if not self._logger.handlers:
            self._add_console_handler()
            if log_file:
                self._add_file_handler(log_file)

    def _formatter(self) -> logging.Formatter:
        return logging.Formatter(
            fmt="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

    def _add_console_handler(self) -> None:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(self._formatter())
        self._logger.addHandler(handler)

    def _add_file_handler(self, log_file: str) -> None:
        os.makedirs(os.path.dirname(log_file), exist_ok=True) if os.path.dirname(log_file) else None
        handler = logging.FileHandler(log_file)
        handler.setFormatter(self._formatter())
        self._logger.addHandler(handler)
        print(f"[Logger] Logging to file: {log_file}")

    def _format_msg(self, message: str, extra: dict = None) -> str:
        if extra:
            extra_str = " | ".join(f"{k}={v}" for k, v in extra.items())
            return f"{message} | {extra_str}"
        return message

    def debug(self, message: str, extra: dict = None) -> None:
        self._logger.debug(self._format_msg(message, extra))

    def info(self, message: str, extra: dict = None) -> None:
        self._logger.info(self._format_msg(message, extra))

    def warning(self, message: str, extra: dict = None) -> None:
        self._logger.warning(self._format_msg(message, extra))

    def error(self, message: str, extra: dict = None) -> None:
        self._logger.error(self._format_msg(message, extra))

    def critical(self, message: str, extra: dict = None) -> None:
        self._logger.critical(self._format_msg(message, extra))

    def set_level(self, level: str) -> None:
        self._logger.setLevel(self.LEVELS.get(level.upper(), logging.INFO))

    def __repr__(self) -> str:
        return f"<Logger name={self.name} level={logging.getLevelName(self._logger.level)}>"
