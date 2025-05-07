import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging format
log_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Configure file handler
file_handler = RotatingFileHandler(
    log_dir / "app.log",
    maxBytes=10485760,  # 10MB
    backupCount=5
)
file_handler.setFormatter(log_format)

# Configure console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(log_format)

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(file_handler)
root_logger.addHandler(console_handler)

# Configure specific loggers
loggers = {
    'app': logging.getLogger('app'),
    'api': logging.getLogger('app.api'),
    'services': logging.getLogger('app.services'),
    'db': logging.getLogger('app.db'),
}

# Set log levels for specific loggers
for logger in loggers.values():
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name."""
    return logging.getLogger(f"app.{name}") 