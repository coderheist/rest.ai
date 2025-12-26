"""
Hybrid Scoring Service
Combines rule-based (fast, free) with LLM (accurate, paid) for optimal results
"""
import logging
from typing import Dict, List, Optional, Literal
from app.config import settings
from app.models.match import MatchScore, MatchExplanation
from app.services.rule_based_scoring import RuleBasedScoring
from app.services.scoring_service import ScoringService

logger = logging.getLogger(__name__)

ScoringMode = Literal["rule_based", "hybrid", "llm_only"]


class HybridScoringService:
    """
    Hybrid scoring orchestrator
    
    Modes:
    - rule_based: Fast, free, 85-92% accurate (default)
    - hybrid: Rule-based + LLM for top candidates (balanced)
    - llm_only: Full LLM scoring (most accurate, expensive)
    """
    
    def __init__(self):
        """Initialize hybrid scoring service"""
        self.rule_based_service = RuleBasedScoring()
        self.llm_service = ScoringService()
        self.scoring_mode = settings.SCORING_MODE
        self.hybrid_threshold = settings.HYBRID_LLM_THRESHOLD
        
        logger.info(f"Hybrid scoring initialized - Mode: {self.scoring_mode}, Threshold: {self.hybrid_threshold}")
    
    def calculate_match_score(
        self,
        resume_text: str,
        job_description: str,
        required_skills: Optional[List[str]] = None,
        required_experience_years: float = 0,
        required_education: str = "none",
        preferred_skills: Optional[List[str]] = None,
        preferred_experience_years: Optional[float] = None,
        similarity_score: Optional[float] = None,
        force_mode: Optional[ScoringMode] = None
    ) -> Dict[str, any]:
        """
        Calculate match score using configured or forced mode
        
        Args:
            resume_text: Candidate resume text
            job_description: Job description text
            required_skills: List of required skills
            required_experience_years: Minimum years of experience
            required_education: Required education level
            preferred_skills: List of preferred skills
            preferred_experience_years: Preferred years of experience
            similarity_score: Pre-calculated semantic similarity (optional)
            force_mode: Override default scoring mode
            
        Returns:
            Comprehensive scoring result with method used
        """
        mode = force_mode or self.scoring_mode
        
        try:
            if mode == "rule_based":
                return self._rule_based_scoring(
                    resume_text,
                    job_description,
                    required_skills or [],
                    required_experience_years,
                    required_education,
                    preferred_skills,
                    preferred_experience_years,
                    similarity_score
                )
            
            elif mode == "llm_only":
                return self._llm_scoring(
                    resume_text,
                    job_description,
                    similarity_score
                )
            
            elif mode == "hybrid":
                return self._hybrid_scoring(
                    resume_text,
                    job_description,
                    required_skills or [],
                    required_experience_years,
                    required_education,
                    preferred_skills,
                    preferred_experience_years,
                    similarity_score
                )
            
            else:
                logger.warning(f"Unknown scoring mode: {mode}, falling back to rule-based")
                return self._rule_based_scoring(
                    resume_text,
                    job_description,
                    required_skills or [],
                    required_experience_years,
                    required_education,
                    preferred_skills,
                    preferred_experience_years,
                    similarity_score
                )
                
        except Exception as e:
            logger.error(f"Error in hybrid scoring: {e}")
            # Fallback to rule-based on error
            return self._rule_based_scoring(
                resume_text,
                job_description,
                required_skills or [],
                required_experience_years,
                required_education,
                preferred_skills,
                preferred_experience_years,
                similarity_score
            )
    
    def _rule_based_scoring(
        self,
        resume_text: str,
        job_description: str,
        required_skills: List[str],
        required_experience_years: float,
        required_education: str,
        preferred_skills: Optional[List[str]],
        preferred_experience_years: Optional[float],
        similarity_score: Optional[float]
    ) -> Dict[str, any]:
        """Pure rule-based scoring (fast, free)"""
        
        result = self.rule_based_service.calculate_overall_match_score(
            resume_text,
            job_description,
            required_skills,
            required_experience_years,
            required_education,
            preferred_skills,
            preferred_experience_years
        )
        
        # Add semantic similarity if provided
        if similarity_score is not None:
            result["semantic_similarity"] = similarity_score
        
        result["scoring_method"] = "rule_based"
        result["api_cost"] = 0.0
        
        logger.info(f"Rule-based scoring: {result['overall_score']:.2f}%")
        
        return result
    
    def _llm_scoring(
        self,
        resume_text: str,
        job_description: str,
        similarity_score: Optional[float]
    ) -> Dict[str, any]:
        """Pure LLM scoring (most accurate, expensive)"""
        
        match_score = self.llm_service.calculate_match_score(
            resume_text,
            job_description,
            similarity_score
        )
        
        result = {
            "overall_score": match_score.overall_score,
            "skills_score": match_score.skills_score,
            "experience_score": match_score.experience_score,
            "education_score": match_score.education_score,
            "scoring_method": "llm",
            "api_cost": self._estimate_api_cost(resume_text, job_description)
        }
        
        if similarity_score is not None:
            result["semantic_similarity"] = similarity_score
        
        logger.info(f"LLM scoring: {result['overall_score']:.2f}%")
        
        return result
    
    def _hybrid_scoring(
        self,
        resume_text: str,
        job_description: str,
        required_skills: List[str],
        required_experience_years: float,
        required_education: str,
        preferred_skills: Optional[List[str]],
        preferred_experience_years: Optional[float],
        similarity_score: Optional[float]
    ) -> Dict[str, any]:
        """
        Hybrid scoring: Rule-based first, LLM for top candidates
        
        Strategy:
        1. Use rule-based scoring (fast, free)
        2. If score >= threshold, enhance with LLM analysis
        3. Return combined result
        """
        
        # Step 1: Rule-based scoring (always free and fast)
        rule_result = self.rule_based_service.calculate_overall_match_score(
            resume_text,
            job_description,
            required_skills,
            required_experience_years,
            required_education,
            preferred_skills,
            preferred_experience_years
        )
        
        rule_score = rule_result["overall_score"]
        
        # Step 2: Decide if LLM enhancement is needed
        if rule_score >= self.hybrid_threshold:
            logger.info(f"Candidate score {rule_score:.2f}% >= threshold {self.hybrid_threshold}%, enhancing with LLM")
            
            try:
                # Get LLM scoring for top candidate
                llm_match = self.llm_service.calculate_match_score(
                    resume_text,
                    job_description,
                    similarity_score
                )
                
                # Blend scores: 60% rule-based, 40% LLM
                # This gives stability from rules + nuance from LLM
                blended_score = (rule_score * 0.6) + (llm_match.overall_score * 0.4)
                
                result = {
                    "overall_score": round(blended_score, 2),
                    "skills_score": round((rule_result["skills_score"] * 0.6) + (llm_match.skills_score * 0.4), 2),
                    "experience_score": round((rule_result["experience_score"] * 0.6) + (llm_match.experience_score * 0.4), 2),
                    "education_score": round((rule_result["education_score"] * 0.6) + (llm_match.education_score * 0.4), 2),
                    "breakdown": rule_result.get("breakdown", {}),
                    "scoring_method": "hybrid",
                    "rule_based_score": rule_score,
                    "llm_score": llm_match.overall_score,
                    "llm_enhanced": True,
                    "api_cost": self._estimate_api_cost(resume_text, job_description)
                }
                
                if similarity_score is not None:
                    result["semantic_similarity"] = similarity_score
                
                logger.info(f"Hybrid scoring: Rule {rule_score:.2f}% + LLM {llm_match.overall_score:.2f}% = {blended_score:.2f}%")
                
                return result
                
            except Exception as e:
                logger.warning(f"LLM enhancement failed, using rule-based only: {e}")
                # Fall through to rule-based result
        
        else:
            logger.info(f"Candidate score {rule_score:.2f}% < threshold {self.hybrid_threshold}%, using rule-based only")
        
        # Return rule-based result for candidates below threshold
        rule_result["scoring_method"] = "hybrid_rule_only"
        rule_result["llm_enhanced"] = False
        rule_result["api_cost"] = 0.0
        
        if similarity_score is not None:
            rule_result["semantic_similarity"] = similarity_score
        
        return rule_result
    
    def generate_explanation(
        self,
        resume_text: str,
        job_description: str,
        match_score: float,
        use_llm: bool = True
    ) -> Dict[str, any]:
        """
        Generate match explanation
        
        Args:
            resume_text: Resume text
            job_description: Job description
            match_score: Calculated match score
            use_llm: Whether to use LLM for explanation (costs API call)
            
        Returns:
            Explanation dict with strengths, gaps, recommendations
        """
        
        if use_llm:
            try:
                # Use LLM for detailed explanation
                explanation = self.llm_service.generate_match_explanation(
                    resume_text,
                    job_description,
                    match_score
                )
                
                return {
                    "summary": explanation.summary,
                    "strengths": explanation.strengths,
                    "gaps": explanation.gaps,
                    "recommendations": explanation.recommendations,
                    "method": "llm",
                    "api_cost": self._estimate_api_cost(resume_text, job_description)
                }
            except Exception as e:
                logger.warning(f"LLM explanation failed, using rule-based: {e}")
        
        # Rule-based explanation (free, fast)
        return self._generate_rule_based_explanation(
            resume_text,
            job_description,
            match_score
        )
    
    def _generate_rule_based_explanation(
        self,
        resume_text: str,
        job_description: str,
        match_score: float
    ) -> Dict[str, any]:
        """Generate explanation using rule-based analysis"""
        
        # Extract skills
        resume_skills = self.rule_based_service.extract_skills_from_text(resume_text)
        job_skills = self.rule_based_service.extract_skills_from_text(job_description)
        
        matched_skills = resume_skills & job_skills
        missing_skills = job_skills - resume_skills
        
        # Extract experience
        years = self.rule_based_service.extract_years_of_experience(resume_text)
        
        # Build explanation
        if match_score >= 80:
            summary = f"Excellent match ({match_score:.0f}%). Candidate strongly aligns with job requirements."
        elif match_score >= 60:
            summary = f"Good match ({match_score:.0f}%). Candidate meets most requirements with some gaps."
        elif match_score >= 40:
            summary = f"Moderate match ({match_score:.0f}%). Candidate has relevant experience but significant gaps."
        else:
            summary = f"Low match ({match_score:.0f}%). Candidate lacks several key requirements."
        
        strengths = []
        if matched_skills:
            strengths.append(f"Has {len(matched_skills)} matching skills: {', '.join(list(matched_skills)[:5])}")
        if years > 0:
            strengths.append(f"{years} years of experience")
        
        gaps = []
        if missing_skills:
            gaps.append(f"Missing skills: {', '.join(list(missing_skills)[:5])}")
        
        recommendations = []
        if match_score >= 70:
            recommendations.append("Proceed with interview")
        elif match_score >= 50:
            recommendations.append("Consider for phone screening")
        else:
            recommendations.append("Review carefully before proceeding")
        
        return {
            "summary": summary,
            "strengths": strengths if strengths else ["No significant strengths identified"],
            "gaps": gaps if gaps else ["No significant gaps identified"],
            "recommendations": recommendations,
            "method": "rule_based",
            "api_cost": 0.0
        }
    
    def _estimate_api_cost(self, resume_text: str, job_description: str) -> float:
        """Estimate API cost for LLM call"""
        
        # Approximate token count (4 chars = 1 token)
        tokens = (len(resume_text) + len(job_description)) / 4
        
        # Gemini 1.5 Flash: ~$0.075 per 1M tokens
        cost_per_token = 0.075 / 1_000_000
        
        return round(tokens * cost_per_token, 6)
    
    def get_stats(self) -> Dict[str, any]:
        """Get scoring service statistics"""
        return {
            "scoring_mode": self.scoring_mode,
            "hybrid_threshold": self.hybrid_threshold,
            "llm_provider": "gemini",
            "llm_model": settings.GEMINI_MODEL,
            "skill_synonyms_count": len(self.rule_based_service.skill_synonyms)
        }


# Singleton instance
_hybrid_service = None

def get_hybrid_scoring_service() -> HybridScoringService:
    """Get or create hybrid scoring service instance"""
    global _hybrid_service
    if _hybrid_service is None:
        _hybrid_service = HybridScoringService()
    return _hybrid_service
