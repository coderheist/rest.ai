"""
Scoring Service
Handles match scoring and explanation using Gemini LLM
"""
import logging
from typing import Dict, List, Optional
import google.generativeai as genai

from app.config import settings
from app.models.match import MatchScore, MatchExplanation, SkillMatch

logger = logging.getLogger(__name__)


class ScoringService:
    """Service for scoring candidate-job matches"""
    
    def __init__(self):
        """Initialize scoring service with Gemini"""
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"Initialized Gemini model: {settings.GEMINI_MODEL}")
        else:
            logger.warning("Gemini API key not provided")
            self.model = None
    
    def calculate_match_score(
        self,
        resume_text: str,
        job_description: str,
        similarity_score: Optional[float] = None
    ) -> MatchScore:
        """
        Calculate detailed match score
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            similarity_score: Semantic similarity score (optional)
            
        Returns:
            MatchScore object with breakdown
        """
        try:
            # Use LLM to analyze match
            prompt = f"""
Analyze the match between this resume and job description. Provide scores (0-100) for:
1. Skills Match
2. Experience Match
3. Education Match
4. Overall Match

Resume:
{resume_text[:2000]}

Job Description:
{job_description[:2000]}

Return ONLY a JSON object with this format:
{{
  "skills_score": <number>,
  "experience_score": <number>,
  "education_score": <number>,
  "overall_score": <number>
}}
"""
            
            response = self._call_llm(prompt)
            
            # Parse response
            import json
            import re
            
            # Extract JSON from response
            json_match = re.search(r'\{[^{}]*\}', response)
            if json_match:
                scores = json.loads(json_match.group())
                return MatchScore(
                    overall_score=scores.get('overall_score', 50.0),
                    skills_score=scores.get('skills_score', 50.0),
                    experience_score=scores.get('experience_score', 50.0),
                    education_score=scores.get('education_score', 50.0)
                )
            
            # Fallback: use similarity score if available
            if similarity_score is not None:
                base_score = similarity_score * 100
                return MatchScore(
                    overall_score=base_score,
                    skills_score=base_score,
                    experience_score=base_score,
                    education_score=base_score
                )
            
            # Default scores
            return MatchScore(
                overall_score=50.0,
                skills_score=50.0,
                experience_score=50.0,
                education_score=50.0
            )
            
        except Exception as e:
            logger.error(f"Error calculating match score: {e}")
            # Return default scores on error
            return MatchScore(
                overall_score=50.0,
                skills_score=50.0,
                experience_score=50.0,
                education_score=50.0
            )
    
    def generate_match_explanation(
        self,
        resume_text: str,
        job_description: str,
        match_score: MatchScore
    ) -> MatchExplanation:
        """
        Generate explanation for match score
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            match_score: Calculated match score
            
        Returns:
            MatchExplanation object
        """
        try:
            prompt = f"""
Based on this resume and job description, provide:
1. Top 3-5 strengths (why candidate is a good fit)
2. Top 3-5 weaknesses (what's missing or doesn't match)
3. 2-3 recommendations for the candidate

Resume:
{resume_text[:2000]}

Job Description:
{job_description[:2000]}

Match Score: {match_score.overall_score:.1f}%

Format your response as JSON:
{{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "summary": "Brief 1-2 sentence summary"
}}
"""
            
            response = self._call_llm(prompt)
            
            # Parse response
            import json
            import re
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                data = json.loads(json_match.group())
                return MatchExplanation(
                    strengths=data.get('strengths', []),
                    weaknesses=data.get('weaknesses', []),
                    recommendations=data.get('recommendations', []),
                    summary=data.get('summary', 'Match analysis completed')
                )
            
            # Fallback explanation
            return MatchExplanation(
                strengths=["Candidate profile reviewed"],
                weaknesses=["Detailed analysis pending"],
                recommendations=["Review detailed requirements"],
                summary=f"Overall match score: {match_score.overall_score:.1f}%"
            )
            
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return MatchExplanation(
                strengths=["Profile under review"],
                weaknesses=["Analysis incomplete"],
                recommendations=["Manual review recommended"],
                summary="Automated analysis unavailable"
            )
    
    def analyze_skill_overlap(
        self,
        resume_skills: List[str],
        job_skills: List[str]
    ) -> List[SkillMatch]:
        """
        Analyze skill overlap between resume and job
        
        Args:
            resume_skills: Skills from resume
            job_skills: Required skills from job
            
        Returns:
            List of SkillMatch objects
        """
        skill_matches = []
        
        # Normalize skills
        resume_skills_lower = [s.lower().strip() for s in resume_skills]
        
        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            matched = job_skill_lower in resume_skills_lower
            
            skill_matches.append(SkillMatch(
                skill=job_skill,
                matched=matched,
                category=None
            ))
        
        return skill_matches
    
    def _call_llm(self, prompt: str) -> str:
        """
        Call Gemini LLM
        
        Args:
            prompt: Prompt text
            
        Returns:
            LLM response text
        """
        try:
            if self.model:
                response = self.model.generate_content(prompt)
                return response.text
            else:
                raise RuntimeError("Gemini model not configured")
        except Exception as e:
            logger.error(f"Error calling Gemini LLM: {e}")
            raise


# Global instance
scoring_service = ScoringService()
