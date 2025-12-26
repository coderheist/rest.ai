"""
Rule-Based Scoring Service
Fast, free, and accurate scoring without LLM API calls
"""
import logging
import re
from typing import Dict, List, Set, Optional, Tuple
from datetime import datetime
from app.models.match import MatchScore, MatchExplanation, SkillMatch

logger = logging.getLogger(__name__)


# Comprehensive skill synonyms dictionary
SKILL_SYNONYMS = {
    # Programming Languages
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'es2020'],
    'typescript': ['ts', 'typescript'],
    'python': ['python', 'python3', 'py'],
    'java': ['java', 'java8', 'java11', 'java17', 'jdk'],
    'c++': ['c++', 'cpp', 'cplusplus'],
    'c#': ['c#', 'csharp', 'c sharp'],
    'ruby': ['ruby', 'rb'],
    'go': ['go', 'golang'],
    'rust': ['rust', 'rust-lang'],
    'php': ['php', 'php7', 'php8'],
    'swift': ['swift', 'swift5'],
    'kotlin': ['kotlin', 'kt'],
    
    # Frontend Frameworks
    'react': ['react', 'reactjs', 'react.js', 'react js'],
    'angular': ['angular', 'angularjs', 'angular2', 'angular.js'],
    'vue': ['vue', 'vuejs', 'vue.js', 'vue js'],
    'nextjs': ['next', 'nextjs', 'next.js', 'next js'],
    'svelte': ['svelte', 'sveltejs'],
    
    # Backend Frameworks
    'nodejs': ['node', 'nodejs', 'node.js', 'node js'],
    'express': ['express', 'expressjs', 'express.js'],
    'django': ['django'],
    'flask': ['flask'],
    'spring': ['spring', 'spring boot', 'springboot'],
    'fastapi': ['fastapi', 'fast api'],
    
    # Databases
    'mongodb': ['mongodb', 'mongo', 'mongo db'],
    'postgresql': ['postgresql', 'postgres', 'psql'],
    'mysql': ['mysql', 'my sql'],
    'redis': ['redis'],
    'elasticsearch': ['elasticsearch', 'elastic search', 'es'],
    
    # Cloud & DevOps
    'aws': ['aws', 'amazon web services'],
    'azure': ['azure', 'microsoft azure'],
    'gcp': ['gcp', 'google cloud', 'google cloud platform'],
    'docker': ['docker', 'containerization'],
    'kubernetes': ['kubernetes', 'k8s'],
    'terraform': ['terraform'],
    'jenkins': ['jenkins'],
    
    # Testing
    'jest': ['jest'],
    'pytest': ['pytest', 'py.test'],
    'junit': ['junit'],
    'selenium': ['selenium'],
    
    # Other Skills
    'git': ['git', 'github', 'gitlab', 'version control'],
    'agile': ['agile', 'scrum', 'kanban'],
    'restapi': ['rest', 'restful', 'rest api', 'restful api'],
    'graphql': ['graphql', 'graph ql'],
    'microservices': ['microservices', 'micro services'],
    'machine learning': ['ml', 'machine learning', 'deep learning'],
    'artificial intelligence': ['ai', 'artificial intelligence'],
}

# Education degree equivalencies
DEGREE_LEVELS = {
    'phd': ['phd', 'ph.d', 'doctorate', 'doctoral', 'doctor of philosophy'],
    'masters': ['masters', 'master', "master's", 'ms', 'm.s', 'mba', 'm.b.a', 'ma', 'm.a'],
    'bachelors': ['bachelors', 'bachelor', "bachelor's", 'bs', 'b.s', 'ba', 'b.a', 'btech', 'b.tech', 'be', 'b.e'],
    'associates': ['associates', 'associate', "associate's", 'as', 'a.s', 'aa', 'a.a'],
    'diploma': ['diploma', 'certificate'],
}

# Job title patterns for experience matching
SENIORITY_KEYWORDS = {
    'senior': ['senior', 'sr', 'lead', 'principal', 'staff', 'expert'],
    'mid': ['mid-level', 'intermediate', 'professional'],
    'junior': ['junior', 'jr', 'entry-level', 'entry level', 'associate', 'trainee'],
}


class RuleBasedScoring:
    """Fast rule-based scoring without LLM"""
    
    def __init__(self):
        """Initialize rule-based scoring"""
        self.skill_index = self._build_skill_index()
        logger.info("Rule-based scoring initialized")
    
    def _build_skill_index(self) -> Dict[str, str]:
        """Build reverse index for quick skill lookup"""
        index = {}
        for canonical, synonyms in SKILL_SYNONYMS.items():
            for synonym in synonyms:
                index[synonym.lower()] = canonical
        return index
    
    def calculate_match_score(
        self,
        resume_text: str,
        job_description: str,
        similarity_score: Optional[float] = None
    ) -> MatchScore:
        """
        Calculate match score using rule-based logic
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            similarity_score: Pre-calculated similarity score (optional)
            
        Returns:
            MatchScore object with detailed breakdown
        """
        try:
            # Extract information
            resume_skills = self._extract_skills(resume_text)
            job_skills = self._extract_skills(job_description)
            
            resume_experience = self._extract_years_of_experience(resume_text)
            required_experience = self._extract_years_of_experience(job_description)
            
            resume_education = self._extract_education_level(resume_text)
            required_education = self._extract_education_level(job_description)
            
            # Calculate component scores
            skills_score = self._calculate_skills_score(resume_skills, job_skills)
            experience_score = self._calculate_experience_score(resume_experience, required_experience)
            education_score = self._calculate_education_score(resume_education, required_education)
            
            # Calculate overall score with weights
            overall_score = (
                skills_score * 0.50 +      # Skills: 50%
                experience_score * 0.30 +   # Experience: 30%
                education_score * 0.20      # Education: 20%
            )
            
            # Boost with semantic similarity if available
            if similarity_score is not None:
                semantic_boost = similarity_score * 100 * 0.15  # 15% weight
                overall_score = overall_score * 0.85 + semantic_boost
            
            # Cap at 100
            overall_score = min(overall_score, 100.0)
            
            logger.info(f"Rule-based scores - Overall: {overall_score:.1f}, Skills: {skills_score:.1f}, "
                       f"Experience: {experience_score:.1f}, Education: {education_score:.1f}")
            
            return MatchScore(
                overall_score=round(overall_score, 2),
                skills_score=round(skills_score, 2),
                experience_score=round(experience_score, 2),
                education_score=round(education_score, 2)
            )
            
        except Exception as e:
            logger.error(f"Error in rule-based scoring: {e}")
            # Return moderate default scores
            return MatchScore(
                overall_score=50.0,
                skills_score=50.0,
                experience_score=50.0,
                education_score=50.0
            )
    
    def calculate_overall_match_score(
        self,
        resume_text: str,
        job_description: str,
        required_skills: List[str],
        required_experience_years: float = 0,
        required_education: str = "none",
        preferred_skills: Optional[List[str]] = None,
        preferred_experience_years: Optional[float] = None
    ) -> Dict[str, any]:
        """
        Calculate comprehensive match score with detailed breakdown
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            required_skills: List of required skills
            required_experience_years: Minimum years of experience
            required_education: Required education level
            preferred_skills: List of preferred skills
            preferred_experience_years: Preferred years of experience
            
        Returns:
            Dict with scores and breakdown
        """
        try:
            # Extract information
            resume_skills = self._extract_skills(resume_text)
            job_skills = self._extract_skills(job_description)
            
            # Add explicitly provided skills
            if required_skills:
                for skill in required_skills:
                    canonical = self.skill_index.get(skill.lower().strip(), skill.lower().strip())
                    job_skills.add(canonical)
            
            if preferred_skills:
                for skill in preferred_skills:
                    canonical = self.skill_index.get(skill.lower().strip(), skill.lower().strip())
                    job_skills.add(canonical)
            
            resume_experience = self._extract_years_of_experience(resume_text)
            resume_education = self._extract_education_level(resume_text)
            
            # Override with explicit requirements if provided
            req_exp_years = required_experience_years if required_experience_years > 0 else self._extract_years_of_experience(job_description)
            req_edu = required_education if required_education != "none" else self._extract_education_level(job_description)
            
            # Calculate component scores
            skills_score = self._calculate_skills_score(resume_skills, job_skills)
            experience_score = self._calculate_experience_score(resume_experience, req_exp_years)
            education_score = self._calculate_education_score(resume_education, req_edu)
            
            # Calculate overall score with weights
            overall_score = (
                skills_score * 0.50 +      # Skills: 50%
                experience_score * 0.30 +   # Experience: 30%
                education_score * 0.20      # Education: 20%
            )
            
            # Cap at 100
            overall_score = min(overall_score, 100.0)
            
            # Build detailed breakdown
            matched_skills = resume_skills.intersection(job_skills)
            missing_skills = job_skills - resume_skills
            
            breakdown = {
                "skills": {
                    "required_matched": list(matched_skills),
                    "required_missing": list(missing_skills),
                    "total_resume_skills": list(resume_skills),
                    "match_percentage": (len(matched_skills) / len(job_skills) * 100) if job_skills else 100
                },
                "experience": {
                    "resume_years": resume_experience,
                    "required_years": req_exp_years,
                    "meets_requirement": resume_experience >= req_exp_years
                },
                "education": {
                    "resume_level": resume_education,
                    "required_level": req_edu,
                    "meets_requirement": self._education_meets_requirement(resume_education, req_edu)
                }
            }
            
            logger.info(f"Overall match score - Overall: {overall_score:.1f}, Skills: {skills_score:.1f}, "
                       f"Experience: {experience_score:.1f}, Education: {education_score:.1f}")
            
            return {
                "overall_score": round(overall_score, 2),
                "skills_score": round(skills_score, 2),
                "experience_score": round(experience_score, 2),
                "education_score": round(education_score, 2),
                "breakdown": breakdown
            }
            
        except Exception as e:
            logger.error(f"Error in calculate_overall_match_score: {e}")
            # Return moderate default scores
            return {
                "overall_score": 50.0,
                "skills_score": 50.0,
                "experience_score": 50.0,
                "education_score": 50.0,
                "breakdown": {}
            }
    
    def _education_meets_requirement(self, resume_level: str, required_level: str) -> bool:
        """Check if education meets requirement"""
        education_rank = {
            'phd': 5,
            'masters': 4,
            'bachelors': 3,
            'associates': 2,
            'diploma': 1,
            'none': 0
        }
        
        resume_rank = education_rank.get(resume_level, 0)
        required_rank = education_rank.get(required_level, 0)
        
        return resume_rank >= required_rank
    
    def _extract_skills(self, text: str) -> Set[str]:
        """Extract and normalize skills from text"""
        text_lower = text.lower()
        found_skills = set()
        
        # Check each skill synonym
        for canonical, synonyms in SKILL_SYNONYMS.items():
            for synonym in synonyms:
                # Use word boundary matching to avoid partial matches
                pattern = r'\b' + re.escape(synonym) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.add(canonical)
                    break  # Found this skill, move to next
        
        return found_skills
    
    def extract_skills_from_text(self, text: str) -> Set[str]:
        """Public method to extract skills from text"""
        return self._extract_skills(text)
    
    def extract_years_of_experience(self, text: str) -> float:
        """Public method to extract years of experience"""
        return self._extract_years_of_experience(text)
    
    def _calculate_skills_score(self, resume_skills: Set[str], job_skills: Set[str]) -> float:
        """Calculate skills match score"""
        if not job_skills:
            return 85.0  # No specific skills required
        
        if not resume_skills:
            return 20.0  # No skills found in resume
        
        # Calculate overlap
        matched_skills = resume_skills.intersection(job_skills)
        match_rate = len(matched_skills) / len(job_skills)
        
        # Calculate score with bonus for extra skills
        base_score = match_rate * 100
        
        # Bonus for having more skills than required (up to 10 points)
        extra_skills = len(resume_skills) - len(job_skills)
        bonus = min(extra_skills * 2, 10) if extra_skills > 0 else 0
        
        score = min(base_score + bonus, 100.0)
        
        logger.debug(f"Skills: {len(matched_skills)}/{len(job_skills)} matched, "
                    f"{len(resume_skills)} total resume skills, score: {score:.1f}")
        
        return score
    
    def _extract_years_of_experience(self, text: str) -> float:
        """Extract years of experience from text"""
        text_lower = text.lower()
        
        # Pattern 1: "X years of experience"
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience',
            r'(\d+)\+?\s*(?:years?|yrs?)\s+in',
            r'experience\s*[:\-]\s*(\d+)\+?\s*(?:years?|yrs?)',
            r'minimum\s+(\d+)\+?\s*(?:years?|yrs?)',
            r'at least\s+(\d+)\+?\s*(?:years?|yrs?)',
        ]
        
        max_years = 0.0
        for pattern in patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                try:
                    years = float(match.group(1))
                    max_years = max(max_years, years)
                except (ValueError, IndexError):
                    continue
        
        # Pattern 2: Extract from date ranges (2019-2023 = 4 years)
        date_pattern = r'(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|19\d{2}|present|current)'
        date_matches = re.finditer(date_pattern, text_lower)
        
        total_years_from_dates = 0.0
        current_year = datetime.now().year
        
        for match in date_matches:
            try:
                start_year = int(match.group(1))
                end_str = match.group(2)
                
                if end_str in ['present', 'current']:
                    end_year = current_year
                else:
                    end_year = int(end_str)
                
                years = max(0, end_year - start_year)
                total_years_from_dates += years
            except (ValueError, IndexError):
                continue
        
        # Use the maximum of explicit years or calculated years
        return max(max_years, total_years_from_dates)
    
    def _calculate_experience_score(self, resume_years: float, required_years: float) -> float:
        """Calculate experience match score"""
        if required_years == 0:
            return 80.0  # No specific requirement
        
        if resume_years == 0:
            return 30.0  # No experience found
        
        # Calculate match percentage
        if resume_years >= required_years:
            # Has required experience or more
            ratio = required_years / resume_years
            score = 85 + (15 * ratio)  # 85-100 range
        else:
            # Less than required
            ratio = resume_years / required_years
            score = ratio * 85  # 0-85 range
        
        score = min(score, 100.0)
        
        logger.debug(f"Experience: {resume_years:.1f} years vs {required_years:.1f} required, score: {score:.1f}")
        
        return score
    
    def _extract_education_level(self, text: str) -> str:
        """Extract highest education level from text"""
        text_lower = text.lower()
        
        # Check from highest to lowest
        for level, keywords in DEGREE_LEVELS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return level
        
        return 'none'
    
    def _calculate_education_score(self, resume_level: str, required_level: str) -> float:
        """Calculate education match score"""
        # Education hierarchy
        education_rank = {
            'phd': 5,
            'masters': 4,
            'bachelors': 3,
            'associates': 2,
            'diploma': 1,
            'none': 0
        }
        
        resume_rank = education_rank.get(resume_level, 0)
        required_rank = education_rank.get(required_level, 0)
        
        if required_rank == 0:
            return 80.0  # No specific requirement
        
        if resume_rank == 0:
            return 40.0  # No education found
        
        if resume_rank >= required_rank:
            # Meets or exceeds requirement
            return 100.0
        else:
            # Below requirement
            gap = required_rank - resume_rank
            score = max(40.0, 100.0 - (gap * 20))
            return score
    
    def generate_match_explanation(
        self,
        resume_text: str,
        job_description: str,
        match_score: MatchScore,
        resume_skills: Optional[Set[str]] = None,
        job_skills: Optional[Set[str]] = None
    ) -> MatchExplanation:
        """
        Generate rule-based explanation for match score
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            match_score: Calculated match score
            resume_skills: Pre-extracted resume skills (optional)
            job_skills: Pre-extracted job skills (optional)
            
        Returns:
            MatchExplanation object
        """
        try:
            # Extract if not provided
            if resume_skills is None:
                resume_skills = self._extract_skills(resume_text)
            if job_skills is None:
                job_skills = self._extract_skills(job_description)
            
            # Analyze strengths and weaknesses
            matched_skills = resume_skills.intersection(job_skills)
            missing_skills = job_skills - resume_skills
            extra_skills = resume_skills - job_skills
            
            resume_years = self._extract_years_of_experience(resume_text)
            required_years = self._extract_years_of_experience(job_description)
            
            resume_edu = self._extract_education_level(resume_text)
            required_edu = self._extract_education_level(job_description)
            
            # Build strengths
            strengths = []
            if match_score.skills_score >= 80:
                strengths.append(f"Strong skills match: {len(matched_skills)}/{len(job_skills)} required skills present")
            if match_score.experience_score >= 80:
                strengths.append(f"Relevant experience: {resume_years:.0f}+ years in the field")
            if match_score.education_score >= 90:
                strengths.append(f"Excellent education qualification: {resume_edu.title()} degree")
            if extra_skills:
                strengths.append(f"Additional valuable skills: {', '.join(list(extra_skills)[:3])}")
            if not strengths:
                strengths.append("Candidate shows basic qualifications for the role")
            
            # Build weaknesses
            weaknesses = []
            if missing_skills:
                missing_list = ', '.join(list(missing_skills)[:5])
                weaknesses.append(f"Missing key skills: {missing_list}")
            if required_years > 0 and resume_years < required_years:
                gap = required_years - resume_years
                weaknesses.append(f"Experience gap: {gap:.0f} years below requirement")
            if match_score.education_score < 70:
                weaknesses.append(f"Education level ({resume_edu}) may not meet requirement ({required_edu})")
            if match_score.overall_score < 60:
                weaknesses.append("Overall match score suggests limited qualification")
            if not weaknesses:
                weaknesses.append("No significant gaps identified")
            
            # Build recommendations
            recommendations = []
            if missing_skills:
                recommendations.append(f"Consider candidates with: {', '.join(list(missing_skills)[:3])}")
            if resume_years < required_years:
                recommendations.append("Evaluate candidate's learning ability and growth potential")
            if match_score.overall_score >= 75:
                recommendations.append("Strong candidate - recommend for interview")
            elif match_score.overall_score >= 60:
                recommendations.append("Moderate fit - consider for screening call")
            else:
                recommendations.append("Review other candidates with stronger matches")
            
            # Build summary
            if match_score.overall_score >= 80:
                summary = f"Excellent match ({match_score.overall_score:.0f}%) - Strong candidate for this position"
            elif match_score.overall_score >= 65:
                summary = f"Good match ({match_score.overall_score:.0f}%) - Candidate meets most requirements"
            elif match_score.overall_score >= 50:
                summary = f"Moderate match ({match_score.overall_score:.0f}%) - Some gaps in qualifications"
            else:
                summary = f"Limited match ({match_score.overall_score:.0f}%) - Significant gaps in requirements"
            
            return MatchExplanation(
                strengths=strengths[:5],
                weaknesses=weaknesses[:5],
                recommendations=recommendations[:3],
                summary=summary
            )
            
        except Exception as e:
            logger.error(f"Error generating rule-based explanation: {e}")
            return MatchExplanation(
                strengths=["Profile reviewed"],
                weaknesses=["Detailed analysis pending"],
                recommendations=["Manual review recommended"],
                summary=f"Match score: {match_score.overall_score:.1f}%"
            )
    
    def analyze_skill_overlap(
        self,
        resume_skills: List[str],
        job_skills: List[str]
    ) -> List[SkillMatch]:
        """
        Analyze skill overlap with synonym matching
        
        Args:
            resume_skills: Skills from resume
            job_skills: Required skills from job
            
        Returns:
            List of SkillMatch objects
        """
        # Normalize skills
        resume_normalized = set()
        for skill in resume_skills:
            canonical = self.skill_index.get(skill.lower().strip())
            if canonical:
                resume_normalized.add(canonical)
            else:
                resume_normalized.add(skill.lower().strip())
        
        skill_matches = []
        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            canonical = self.skill_index.get(job_skill_lower, job_skill_lower)
            
            matched = canonical in resume_normalized
            
            skill_matches.append(SkillMatch(
                skill=job_skill,
                matched=matched,
                category='technical' if matched else None
            ))
        
        return skill_matches


# Global instance
rule_based_scoring = RuleBasedScoring()
