"""
Interview API Routes
Handles interview kit generation endpoints
"""
from fastapi import APIRouter, HTTPException
import logging
import time

from app.services.interview_service import interview_service
from app.models.interview import (
    GenerateInterviewKitRequest,
    GenerateInterviewKitResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=GenerateInterviewKitResponse)
async def generate_interview_kit(request: GenerateInterviewKitRequest):
    """
    Generate interview kit
    
    Args:
        request: Interview kit generation request
        
    Returns:
        Generated interview kit
    """
    start_time = time.time()
    
    try:
        interview_kit = interview_service.generate_interview_kit(
            job_description=request.job_description,
            resume_text=request.resume_text,
            job_title=request.job_title,
            candidate_name=request.candidate_name,
            num_questions=request.num_questions,
            focus_areas=request.focus_areas
        )
        
        generation_time = time.time() - start_time
        
        return GenerateInterviewKitResponse(
            success=True,
            interview_kit=interview_kit,
            generation_time=generation_time
        )
        
    except Exception as e:
        logger.error(f"Error generating interview kit: {e}")
        return GenerateInterviewKitResponse(
            success=False,
            error=str(e)
        )


@router.post("/generate-questions")
async def generate_specific_questions(
    job_description: str,
    resume_text: str,
    job_title: str,
    num_questions: int = 5,
    category: str = "technical"
):
    """
    Generate specific category of questions
    
    Args:
        job_description: Job description
        resume_text: Resume text
        job_title: Job title
        num_questions: Number of questions
        category: Question category
        
    Returns:
        List of questions
    """
    try:
        # Generate full kit and filter
        interview_kit = interview_service.generate_interview_kit(
            job_description=job_description,
            resume_text=resume_text,
            job_title=job_title,
            num_questions=num_questions,
            focus_areas=[category]
        )
        
        # Filter questions by category if needed
        filtered_questions = [
            q for q in interview_kit.questions
            if category == "all" or q.category.value == category
        ]
        
        return {
            "success": True,
            "questions": [q.dict() for q in filtered_questions[:num_questions]],
            "count": len(filtered_questions[:num_questions])
        }
        
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def interview_health():
    """Health check for interview service"""
    from app.config import settings
    
    llm_available = interview_service.model is not None
    
    return {
        "status": "healthy",
        "service": "interview",
        "llm_provider": "gemini",
        "llm_available": llm_available
    }
