import logging
import os


def setup_logging(log_dir=None, log_file="TwitterTask.log"):
    if not log_dir:
        log_dir = os.path.join('worker', 'twitter', "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file_path = os.path.join(log_dir, log_file)

    # Create a file handler with UTF-8 encoding
    file_handler = logging.FileHandler(log_file_path, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"))

    # Create a stream handler (stdout)
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"))

    # Configure the root logger
    logging.basicConfig(level=logging.INFO, handlers=[
                        file_handler, stream_handler])

    # Set logging levels for other modules
    logging.getLogger("httpx").setLevel(logging.CRITICAL)
    logging.getLogger("pymongo").setLevel(logging.CRITICAL)
    logging.getLogger("httpcore").setLevel(logging.CRITICAL)
