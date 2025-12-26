"""
Parsing API Routes
Handles resume and document parsing endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import logging
import time

from app.config import settings
from app.services.parsing_service import parsing_service
from app.models.resume import (
    ResumeParseResponse,
    ParsedResume,
    SkillExtractionRequest,
    SkillExtractionResponse
)
from app.utils.file_utils import save_uploaded_file, delete_file, get_file_extension

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/pdf", response_model=ResumeParseResponse)
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parse PDF resume
    
    Args:
        file: PDF file upload
        
    Returns:
        Parsed resume data
    """
    start_time = time.time()
    temp_file = None
    
    try:
        # Validate file type
        if get_file_extension(file.filename) != '.pdf':
            raise HTTPException(status_code=400, detail="File must be PDF")
        
        # Save uploaded file
        temp_file = save_uploaded_file(
            file.file,
            file.filename,
            settings.TEMP_DIR
        )
        
        # Extract text
        text = parsing_service.extract_text_from_pdf(temp_file)
        
        # Parse resume
        parsed_resume = parsing_service.parse_resume(text)
        
        processing_time = time.time() - start_time
        
        return ResumeParseResponse(
            success=True,
            resume=parsed_resume,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        return ResumeParseResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup temp file
        if temp_file:
            delete_file(temp_file)


@router.post("/docx", response_model=ResumeParseResponse)
async def parse_docx(file: UploadFile = File(...)):
    """
    Parse DOCX resume
    
    Args:
        file: DOCX file upload
        
    Returns:
        Parsed resume data
    """
    start_time = time.time()
    temp_file = None
    
    try:
        # Validate file type
        if get_file_extension(file.filename) != '.docx':
            raise HTTPException(status_code=400, detail="File must be DOCX")
        
        # Save uploaded file
        temp_file = save_uploaded_file(
            file.file,
            file.filename,
            settings.TEMP_DIR
        )
        
        # Extract text
        text = parsing_service.extract_text_from_docx(temp_file)
        
        # Parse resume
        parsed_resume = parsing_service.parse_resume(text)
        
        processing_time = time.time() - start_time
        
        return ResumeParseResponse(
            success=True,
            resume=parsed_resume,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error parsing DOCX: {e}")
        return ResumeParseResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup temp file
        if temp_file:
            delete_file(temp_file)


@router.post("/extract-skills", response_model=SkillExtractionResponse)
async def extract_skills(request: SkillExtractionRequest):
    """
    Extract skills from text
    
    Args:
        request: Skill extraction request
        
    Returns:
        Extracted skills
    """
    try:
        skills = parsing_service.extract_skills(request.text)
        
        return SkillExtractionResponse(
            success=True,
            skills=skills,
            count=len(skills)
        )
        
    except Exception as e:
        logger.error(f"Error extracting skills: {e}")
        return SkillExtractionResponse(
            success=False,
            skills=[],
            count=0
        )


@router.get("/health")
async def parsing_health():
    """Health check for parsing service"""
    return {
        "status": "healthy",
        "service": "parsing",
        "spacy_loaded": parsing_service.nlp is not None
    }
