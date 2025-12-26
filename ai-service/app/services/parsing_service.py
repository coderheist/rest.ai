"""
Resume and Document Parsing Service
Handles PDF, DOCX parsing and text extraction
"""
import logging
from pathlib import Path
from typing import Optional, List, Dict
import pdfplumber
import fitz  # PyMuPDF
from docx import Document
import spacy
import re

from app.models.resume import ParsedResume, Skill, Experience, Education
from app.utils.text_utils import clean_text, extract_email, extract_phone

logger = logging.getLogger(__name__)


class ParsingService:
    """Service for parsing resumes and extracting information"""
    
    def __init__(self):
        """Initialize parsing service"""
        try:
            # Load spaCy model
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except OSError:
            logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Common skill keywords
        self.skill_keywords = {
            'programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'kotlin', 'swift'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'asp.net'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'cassandra', 'dynamodb'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
            'data': ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop'],
            'tools': ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'vscode', 'intellij'],
            'soft_skills': ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'creative']
        }
    
    def extract_text_from_pdf(self, file_path: Path) -> str:
        """
        Extract text from PDF file
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        text = ""
        
        try:
            # Try pdfplumber first
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            if text.strip():
                logger.info(f"Extracted {len(text)} characters from PDF using pdfplumber")
                return clean_text(text)
            
            # Fallback to PyMuPDF
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
            
            logger.info(f"Extracted {len(text)} characters from PDF using PyMuPDF")
            return clean_text(text)
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise
    
    def extract_text_from_docx(self, file_path: Path) -> str:
        """
        Extract text from DOCX file
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Extracted text
        """
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            logger.info(f"Extracted {len(text)} characters from DOCX")
            return clean_text(text)
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            raise
    
    def extract_skills(self, text: str) -> List[Skill]:
        """
        Extract skills from text
        
        Args:
            text: Input text
            
        Returns:
            List of extracted skills
        """
        skills = []
        text_lower = text.lower()
        
        for category, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if re.search(rf'\b{re.escape(keyword)}\b', text_lower):
                    skills.append(Skill(
                        name=keyword.title(),
                        category=category,
                        confidence=0.8
                    ))
        
        # Remove duplicates
        unique_skills = {}
        for skill in skills:
            if skill.name not in unique_skills:
                unique_skills[skill.name] = skill
        
        return list(unique_skills.values())
    
    def extract_experience(self, text: str) -> List[Experience]:
        """
        Extract work experience from text
        
        Args:
            text: Input text
            
        Returns:
            List of experience entries
        """
        experiences = []
        
        # Simple pattern matching for experience sections
        # This is a basic implementation - can be enhanced with ML
        experience_section = self._find_section(text, ['experience', 'work history', 'employment'])
        
        if experience_section:
            # Split by common delimiters
            entries = re.split(r'\n(?=[A-Z][a-z]+ \d{4})', experience_section)
            
            for entry in entries:
                if len(entry.strip()) > 20:
                    experience = Experience(
                        description=entry.strip()
                    )
                    experiences.append(experience)
        
        return experiences
    
    def extract_education(self, text: str) -> List[Education]:
        """
        Extract education from text
        
        Args:
            text: Input text
            
        Returns:
            List of education entries
        """
        educations = []
        
        education_section = self._find_section(text, ['education', 'academic', 'qualifications'])
        
        if education_section:
            # Look for degree patterns
            degree_patterns = [
                r'(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)',
                r'(Associate|Doctorate)'
            ]
            
            for pattern in degree_patterns:
                matches = re.finditer(pattern, education_section, re.IGNORECASE)
                for match in matches:
                    # Extract context around match
                    start = max(0, match.start() - 50)
                    end = min(len(education_section), match.end() + 100)
                    context = education_section[start:end].strip()
                    
                    education = Education(
                        degree=match.group(0)
                    )
                    educations.append(education)
        
        return educations
    
    def _find_section(self, text: str, headers: List[str]) -> Optional[str]:
        """
        Find section in text by headers
        
        Args:
            text: Input text
            headers: Possible section headers
            
        Returns:
            Section text or None
        """
        text_lower = text.lower()
        
        for header in headers:
            pattern = rf'\b{re.escape(header)}\b.*?(?=\n[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:|\Z)'
            match = re.search(pattern, text_lower, re.DOTALL)
            if match:
                start = match.start()
                # Find next section
                end = len(text)
                next_section = re.search(r'\n[A-Z][A-Z\s]+:', text[start + len(header):])
                if next_section:
                    end = start + len(header) + next_section.start()
                
                return text[start:end]
        
        return None
    
    def parse_resume(self, text: str, extract_all: bool = True) -> ParsedResume:
        """
        Parse resume text and extract structured information
        
        Args:
            text: Resume text
            extract_all: Extract all fields
            
        Returns:
            ParsedResume object
        """
        parsed = ParsedResume(raw_text=text)
        
        # Extract contact info
        parsed.email = extract_email(text)
        parsed.phone = extract_phone(text)
        
        # Extract name (first line often contains name)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if lines:
            parsed.name = lines[0]
        
        # Count sections found in resume
        sections_found = 0
        text_lower = text.lower()
        section_keywords = [
            ['experience', 'work history', 'employment', 'professional experience'],
            ['education', 'academic', 'qualifications'],
            ['skill', 'technical skills', 'core competencies'],
            ['summary', 'objective', 'profile', 'about'],
            ['project', 'portfolio'],
            ['certification', 'licenses'],
            ['award', 'achievement', 'honor']
        ]
        
        for keyword_group in section_keywords:
            if any(keyword in text_lower for keyword in keyword_group):
                sections_found += 1
        
        parsed.sections_found = sections_found
        
        if extract_all:
            # Extract skills
            parsed.skills = self.extract_skills(text)
            
            # Extract experience
            parsed.experience = self.extract_experience(text)
            
            # Extract education
            parsed.education = self.extract_education(text)
        
        return parsed


# Global instance
parsing_service = ParsingService()
