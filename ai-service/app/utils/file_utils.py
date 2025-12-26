"""
File handling utilities
"""
import os
import shutil
from pathlib import Path
from typing import BinaryIO, Optional
import logging

logger = logging.getLogger(__name__)


def save_uploaded_file(file: BinaryIO, filename: str, directory: Path) -> Path:
    """
    Save uploaded file to specified directory
    
    Args:
        file: File object
        filename: Name of the file
        directory: Directory to save file
        
    Returns:
        Path to saved file
    """
    directory.mkdir(parents=True, exist_ok=True)
    file_path = directory / filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file, buffer)
        logger.info(f"File saved: {file_path}")
        return file_path
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise


def delete_file(file_path: Path) -> bool:
    """
    Delete a file safely
    
    Args:
        file_path: Path to file
        
    Returns:
        True if deleted, False otherwise
    """
    try:
        if file_path.exists():
            file_path.unlink()
            logger.info(f"File deleted: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return False


def cleanup_temp_files(directory: Path, older_than_hours: int = 24):
    """
    Clean up temporary files older than specified hours
    
    Args:
        directory: Directory to clean
        older_than_hours: Delete files older than this many hours
    """
    import time
    
    if not directory.exists():
        return
    
    current_time = time.time()
    cutoff_time = current_time - (older_than_hours * 3600)
    
    deleted_count = 0
    for file_path in directory.iterdir():
        if file_path.is_file():
            file_age = file_path.stat().st_mtime
            if file_age < cutoff_time:
                try:
                    file_path.unlink()
                    deleted_count += 1
                except Exception as e:
                    logger.error(f"Error deleting {file_path}: {e}")
    
    if deleted_count > 0:
        logger.info(f"Cleaned up {deleted_count} temporary files")


def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase"""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check if file has allowed extension"""
    ext = get_file_extension(filename)
    return ext in allowed_extensions
