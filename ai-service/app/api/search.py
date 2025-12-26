"""
Search API Routes
Handles semantic search and candidate ranking endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from app.services.search_service import search_service
from app.models.match import RankCandidatesRequest, RankCandidatesResponse
from app.models.common import TextInput

logger = logging.getLogger(__name__)
router = APIRouter()


class AddResumeRequest(BaseModel):
    """Request model for adding resume to index"""
    resume_id: str
    resume_text: str


@router.post("/similarity")
async def search_similar_resumes(
    job_description: str,
    top_k: int = 10
):
    """
    Find similar resumes to job description
    
    Args:
        job_description: Job description text
        top_k: Number of top results
        
    Returns:
        List of similar resumes
    """
    try:
        results = search_service.search_similar_resumes(job_description, top_k)
        
        return {
            "success": True,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error searching resumes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rank-candidates", response_model=RankCandidatesResponse)
async def rank_candidates(request: RankCandidatesRequest):
    """
    Rank candidates against job description
    
    Args:
        request: Rank candidates request
        
    Returns:
        Ranked list of candidates
    """
    try:
        ranked = search_service.rank_candidates(
            request.job_description,
            request.resumes,
            request.top_n
        )
        
        return RankCandidatesResponse(
            success=True,
            ranked_candidates=ranked,
            total_candidates=len(ranked)
        )
        
    except Exception as e:
        logger.error(f"Error ranking candidates: {e}")
        return RankCandidatesResponse(
            success=False,
            ranked_candidates=[],
            total_candidates=0,
            error=str(e)
        )


@router.get("/vector-stats")
async def get_vector_stats():
    """Get vector store statistics"""
    return search_service.get_stats()


@router.post("/add-resume")
async def add_resume_to_index(request: AddResumeRequest):
    """
    Add resume to search index
    
    Args:
        request: Add resume request with resume_id and resume_text
        
    Returns:
        Success response
    """
    try:
        search_service.add_resume(request.resume_id, request.resume_text)
        
        return {
            "success": True,
            "message": f"Resume {request.resume_id} added to index",
            "total_resumes": len(search_service.resume_ids)
        }
        
    except Exception as e:
        logger.error(f"Error adding resume to index: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-index")
async def save_index():
    """Save vector index to disk"""
    try:
        search_service.save_index()
        return {"success": True, "message": "Index saved"}
    except Exception as e:
        logger.error(f"Error saving index: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def search_health():
    """Health check for search service"""
    return {
        "status": "healthy",
        "service": "search",
        "index_loaded": search_service.index is not None,
        "total_resumes": len(search_service.resume_ids)
    }
