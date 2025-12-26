"""
Text processing utilities
"""
import re
from typing import List, Optional


def clean_text(text: str) -> str:
    """
    Clean and normalize text
    
    Args:
        text: Input text
        
    Returns:
        Cleaned text
    """
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def extract_email(text: str) -> Optional[str]:
    """
    Extract email address from text
    
    Args:
        text: Input text
        
    Returns:
        Email address or None
    """
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """
    Extract phone number from text
    
    Args:
        text: Input text
        
    Returns:
        Phone number or None
    """
    # Pattern for various phone formats
    patterns = [
        r'\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}',
        r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    
    return None


def extract_urls(text: str) -> List[str]:
    """
    Extract URLs from text
    
    Args:
        text: Input text
        
    Returns:
        List of URLs
    """
    pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(pattern, text)


def truncate_text(text: str, max_length: int = 1000, suffix: str = "...") -> str:
    """
    Truncate text to maximum length
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """
    Split text into overlapping chunks
    
    Args:
        text: Input text
        chunk_size: Size of each chunk
        overlap: Overlap between chunks
        
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    
    return chunks


def normalize_whitespace(text: str) -> str:
    """Normalize whitespace in text"""
    return ' '.join(text.split())


def remove_urls(text: str) -> str:
    """Remove URLs from text"""
    pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.sub(pattern, '', text)


def extract_sections(text: str, section_headers: List[str]) -> dict:
    """
    Extract sections from resume text based on headers
    
    Args:
        text: Resume text
        section_headers: List of section headers to look for
        
    Returns:
        Dictionary of sections
    """
    sections = {}
    text_lower = text.lower()
    
    for header in section_headers:
        pattern = rf'\b{re.escape(header.lower())}\b'
        match = re.search(pattern, text_lower)
        if match:
            start_pos = match.start()
            # Find next section or end of text
            next_pos = len(text)
            for other_header in section_headers:
                if other_header != header:
                    other_pattern = rf'\b{re.escape(other_header.lower())}\b'
                    other_match = re.search(other_pattern, text_lower[start_pos + len(header):])
                    if other_match:
                        next_pos = min(next_pos, start_pos + len(header) + other_match.start())
            
            sections[header] = text[start_pos:next_pos].strip()
    
    return sections
