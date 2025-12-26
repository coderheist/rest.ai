"""
Scoring API Routes
Handles match scoring and explanation endpoints with hybrid scoring support
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from app.config import settings
from app.services.hybrid_scoring import get_hybrid_scoring_service
from app.services.embedding_service import embedding_service
from app.services.scoring_service import scoring_service
from app.models.match import MatchRequest, MatchResponse, CandidateMatch

logger = logging.getLogger(__name__)
router = APIRouter()

# Get hybrid scoring service instance
hybrid_service = get_hybrid_scoring_service()


@router.post("/match", response_model=MatchResponse)
async def calculate_match(
    request: MatchRequest,
    scoring_mode: Optional[str] = Query(None, description="Override scoring mode: rule_based, hybrid, or llm_only")
):
    """
    Calculate match score between resume and job using hybrid scoring
    
    Scoring modes:
    - rule_based: Fast, free, 85-92% accurate (default for high volume)
    - hybrid: Rule-based + LLM for top candidates (balanced, cost-effective)
    - llm_only: Full LLM scoring (most accurate, expensive)
    
    Args:
        request: Match request with resume and job details
        scoring_mode: Override default scoring mode
        
    Returns:
        Match result with score, breakdown, and optional explanation
    """
    try:
        # Calculate semantic similarity
        resume_embedding = embedding_service.generate_embedding(request.resume_text)
        job_embedding = embedding_service.generate_embedding(request.job_description)
        similarity_score = embedding_service.compute_similarity(resume_embedding, job_embedding)
        
        # Calculate match score using hybrid service
        match_result = hybrid_service.calculate_match_score(
            resume_text=request.resume_text,
            job_description=request.job_description,
            required_skills=getattr(request, 'required_skills', None),
            required_experience_years=getattr(request, 'required_experience_years', 0),
            required_education=getattr(request, 'required_education', 'none'),
            preferred_skills=getattr(request, 'preferred_skills', None),
            preferred_experience_years=getattr(request, 'preferred_experience_years', None),
            similarity_score=similarity_score,
            force_mode=scoring_mode
        )
        
        # Generate explanation if requested
        explanation = None
        if request.include_explanation:
            explanation = hybrid_service.generate_explanation(
                request.resume_text,
                request.job_description,
                match_result['overall_score'],
                use_llm=(scoring_mode == "llm_only" or match_result.get('llm_enhanced', False))
            )
        
        # Create match score object
        from app.models.match import MatchScore
        match_score = MatchScore(
            overall_score=match_result['overall_score'],
            skills_score=match_result['skills_score'],
            experience_score=match_result['experience_score'],
            education_score=match_result['education_score']
        )
        
        # Create candidate match
        candidate_match = CandidateMatch(
            resume_id=request.resume_id or "unknown",
            job_id=request.job_id or "unknown",
            score=match_score,
            explanation=explanation,
            similarity_score=similarity_score,
            matched_skills=match_result.get('breakdown', {}).get('skills', {}).get('required_matched', []),
            missing_skills=match_result.get('breakdown', {}).get('skills', {}).get('required_missing', [])
        )
        
        # Add metadata about scoring method and cost
        metadata = {
            "scoring_method": match_result.get('scoring_method', 'unknown'),
            "llm_enhanced": match_result.get('llm_enhanced', False),
            "api_cost": match_result.get('api_cost', 0.0)
        }
        
        logger.info(f"Match calculated: {match_result['overall_score']:.2f}% using {match_result['scoring_method']}")
        
        return MatchResponse(
            success=True,
            match=candidate_match,
            metadata=metadata
        )
        
    except Exception as e:
        logger.error(f"Error calculating match: {e}")
        return MatchResponse(
            success=False,
            error=str(e)
        )


@router.post("/explain")
async def explain_match(
    resume_text: str,
    job_description: str,
    overall_score: float
):
    """
    Generate explanation for a match score
    
    Args:
        resume_text: Resume text
        job_description: Job description
        overall_score: Overall match score
        
    Returns:
        Match explanation
    """
    try:
        from app.models.match import MatchScore
        
        match_score = MatchScore(
            overall_score=overall_score,
            skills_score=overall_score,
            experience_score=overall_score,
            education_score=overall_score
        )
        
        explanation = scoring_service.generate_match_explanation(
            resume_text,
            job_description,
            match_score
        )
        
        return {
            "success": True,
            "explanation": explanation.dict()
        }
        
    except Exception as e:
        logger.error(f"Error generating explanation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skill-overlap")
async def analyze_skill_overlap(
    resume_skills: list[str],
    job_skills: list[str]
):
    """
    Analyze skill overlap between resume and job
    
    Args:
        resume_skills: Skills from resume
        job_skills: Required skills from job
        
    Returns:
        Skill match analysis
    """
    try:
        skill_matches = scoring_service.analyze_skill_overlap(
            resume_skills,
            job_skills
        )
        
        matched_count = sum(1 for sm in skill_matches if sm.matched)
        
        return {
            "success": True,
            "skill_matches": [sm.dict() for sm in skill_matches],
            "total_required": len(job_skills),
            "matched": matched_count,
            "missing": len(job_skills) - matched_count,
            "match_percentage": (matched_count / len(job_skills) * 100) if job_skills else 0
        }
        
    except Exception as e:
        logger.error(f"Error analyzing skill overlap: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def scoring_health():
    """Health check for hybrid scoring service"""
    from app.config import settings
    
    stats = hybrid_service.get_stats()
    
    return {
        "status": "healthy",
        "service": "hybrid_scoring",
        "scoring_mode": stats['scoring_mode'],
        "hybrid_threshold": stats['hybrid_threshold'],
        "llm_provider": stats['llm_provider'],
        "llm_model": stats['llm_model'],
        "skill_synonyms": stats['skill_synonyms_count']
    }


@router.get("/stats")
async def scoring_stats():
    """Get scoring service statistics and configuration"""
    return hybrid_service.get_stats()


@router.post("/batch")
async def batch_score_candidates(
    resumes: list[dict],
    job_description: str,
    required_skills: Optional[list[str]] = None,
    scoring_mode: Optional[str] = Query("hybrid", description="Scoring mode for batch processing")
):
    """
    Batch score multiple candidates against a job
    
    Optimized for high-volume processing:
    - Uses rule-based by default for speed
    - Can use hybrid to enhance top candidates only
    - Returns results sorted by score
    
    Args:
        resumes: List of resume objects with 'id' and 'text'
        job_description: Job description text
        required_skills: List of required skills
        scoring_mode: Scoring mode (rule_based recommended for batch)
        
    Returns:
        Sorted list of candidates with scores
    """
    try:
        results = []
        
        for resume in resumes:
            try:
                match_result = hybrid_service.calculate_match_score(
                    resume_text=resume.get('text', ''),
                    job_description=job_description,
                    required_skills=required_skills or [],
                    force_mode=scoring_mode
                )
                
                results.append({
                    "resume_id": resume.get('id', 'unknown'),
                    "score": match_result['overall_score'],
                    "skills_score": match_result['skills_score'],
                    "experience_score": match_result['experience_score'],
                    "education_score": match_result['education_score'],
                    "scoring_method": match_result['scoring_method'],
                    "api_cost": match_result.get('api_cost', 0.0)
                })
                
            except Exception as e:
                logger.warning(f"Error scoring resume {resume.get('id')}: {e}")
                continue
        
        # Sort by score descending
        results.sort(key=lambda x: x['score'], reverse=True)
        
        # Calculate total cost
        total_cost = sum(r['api_cost'] for r in results)
        
        return {
            "success": True,
            "total_candidates": len(resumes),
            "scored_candidates": len(results),
            "results": results,
            "total_api_cost": round(total_cost, 6),
            "scoring_mode": scoring_mode
        }
        
    except Exception as e:
        logger.error(f"Error in batch scoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))
