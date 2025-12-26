"""
Interview Service
Generates interview kits using Gemini LLM
"""
import logging
from typing import List, Dict, Optional
import google.generativeai as genai
import json
import re

from app.config import settings
from app.models.interview import (
    InterviewKit,
    InterviewQuestion,
    QuestionCategory,
    QuestionDifficulty
)

logger = logging.getLogger(__name__)


class InterviewService:
    """Service for generating interview kits"""
    
    def __init__(self):
        """Initialize interview service with Gemini"""
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"Initialized Gemini for interview generation")
        else:
            logger.warning("Gemini API key not provided")
            self.model = None
    
    def generate_interview_kit(
        self,
        job_description: str,
        resume_text: str,
        job_title: str,
        candidate_name: Optional[str] = None,
        num_questions: int = 10,
        focus_areas: Optional[List[str]] = None
    ) -> InterviewKit:
        """
        Generate interview kit with questions
        
        Args:
            job_description: Job description text
            resume_text: Candidate resume text
            job_title: Job title
            candidate_name: Candidate name (optional)
            num_questions: Number of questions to generate
            focus_areas: Specific areas to focus on (optional)
            
        Returns:
            InterviewKit object
        """
        try:
            # Build prompt
            prompt = self._build_interview_prompt(
                job_description,
                resume_text,
                job_title,
                num_questions,
                focus_areas
            )
            
            # Call LLM
            response = self._call_llm(prompt)
            
            # Parse response
            interview_kit = self._parse_interview_response(
                response,
                job_title,
                candidate_name
            )
            
            logger.info(f"Generated interview kit with {len(interview_kit.questions)} questions")
            return interview_kit
            
        except Exception as e:
            logger.error(f"Error generating interview kit: {e}")
            # Return fallback kit
            return self._create_fallback_kit(job_title, candidate_name)
    
    def _build_interview_prompt(
        self,
        job_description: str,
        resume_text: str,
        job_title: str,
        num_questions: int,
        focus_areas: Optional[List[str]]
    ) -> str:
        """Build prompt for interview kit generation"""
        
        focus_text = ""
        if focus_areas:
            focus_text = f"\nFocus areas: {', '.join(focus_areas)}"
        
        prompt = f"""
Generate {num_questions} interview questions for a {job_title} position.

Job Description:
{job_description[:2000]}

Candidate Resume:
{resume_text[:2000]}
{focus_text}

Generate questions that:
1. Test technical skills mentioned in the job description
2. Assess behavioral competencies
3. Explore gaps between job requirements and candidate experience
4. Include situational questions
5. Mix difficulty levels (easy, medium, hard)

Return a JSON array with this structure:
[
  {{
    "question": "Interview question text",
    "category": "technical|behavioral|situational|cultural|general",
    "difficulty": "easy|medium|hard",
    "expected_answer": "Brief outline of a good answer",
    "evaluation_criteria": ["criterion1", "criterion2"],
    "follow_up_questions": ["follow-up1", "follow-up2"]
  }}
]

Also include:
- key_areas_to_assess: ["area1", "area2", ...]
- recommended_duration: <number in minutes>

Format everything as a JSON object:
{{
  "questions": [...],
  "key_areas_to_assess": [...],
  "recommended_duration": <number>
}}
"""
        return prompt
    
    def _parse_interview_response(
        self,
        response: str,
        job_title: str,
        candidate_name: Optional[str]
    ) -> InterviewKit:
        """Parse LLM response into InterviewKit"""
        
        try:
            # Extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', response)
            if not json_match:
                raise ValueError("No JSON found in response")
            
            data = json.loads(json_match.group())
            
            # Parse questions
            questions = []
            for q_data in data.get('questions', []):
                try:
                    question = InterviewQuestion(
                        question=q_data.get('question', ''),
                        category=QuestionCategory(q_data.get('category', 'general')),
                        difficulty=QuestionDifficulty(q_data.get('difficulty', 'medium')),
                        expected_answer=q_data.get('expected_answer'),
                        evaluation_criteria=q_data.get('evaluation_criteria', []),
                        follow_up_questions=q_data.get('follow_up_questions', [])
                    )
                    questions.append(question)
                except Exception as e:
                    logger.warning(f"Error parsing question: {e}")
                    continue
            
            # Create interview kit
            return InterviewKit(
                job_title=job_title,
                candidate_name=candidate_name,
                questions=questions,
                key_areas_to_assess=data.get('key_areas_to_assess', []),
                recommended_duration=data.get('recommended_duration', 60),
                notes="Generated by AI"
            )
            
        except Exception as e:
            logger.error(f"Error parsing interview response: {e}")
            return self._create_fallback_kit(job_title, candidate_name)
    
    def _create_fallback_kit(
        self,
        job_title: str,
        candidate_name: Optional[str]
    ) -> InterviewKit:
        """Create fallback interview kit if generation fails"""
        
        fallback_questions = [
            InterviewQuestion(
                question="Can you tell me about your relevant experience for this role?",
                category=QuestionCategory.GENERAL,
                difficulty=QuestionDifficulty.EASY,
                expected_answer="Candidate should highlight relevant experience",
                evaluation_criteria=["Relevance", "Clarity", "Depth"],
                follow_up_questions=["What was your biggest achievement?"]
            ),
            InterviewQuestion(
                question="Describe a challenging project you worked on and how you overcame obstacles.",
                category=QuestionCategory.BEHAVIORAL,
                difficulty=QuestionDifficulty.MEDIUM,
                expected_answer="Should use STAR method",
                evaluation_criteria=["Problem-solving", "Resilience", "Results"],
                follow_up_questions=["What would you do differently?"]
            ),
            InterviewQuestion(
                question="How do you stay current with industry trends and technologies?",
                category=QuestionCategory.GENERAL,
                difficulty=QuestionDifficulty.EASY,
                expected_answer="Should mention learning habits",
                evaluation_criteria=["Curiosity", "Commitment to learning"],
                follow_up_questions=["What have you learned recently?"]
            )
        ]
        
        return InterviewKit(
            job_title=job_title,
            candidate_name=candidate_name,
            questions=fallback_questions,
            key_areas_to_assess=["Experience", "Problem-solving", "Communication"],
            recommended_duration=45,
            notes="Fallback questions - AI generation unavailable"
        )
    
    def _call_llm(self, prompt: str) -> str:
        """Call Gemini LLM"""
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
interview_service = InterviewService()
