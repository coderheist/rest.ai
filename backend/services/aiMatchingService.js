import axios from 'axios';

/**
 * AI Service for LLM-based resume matching
 * Uses Google Gemini API (free tier) or OpenAI API
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_GEMINI = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here';
const USE_OPENAI = !USE_GEMINI && OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';

class AIMatchingService {
  /**
   * Calculate AI-based match score using LLM
   */
  async calculateAIMatch(jobData, resumeData) {
    // If no API key configured, fall back to rule-based
    if (!USE_GEMINI && !USE_OPENAI) {
      console.warn('No LLM API key configured. Using rule-based matching.');
      return null;
    }

    try {
      const prompt = this.buildMatchingPrompt(jobData, resumeData);
      
      let response;
      if (USE_GEMINI) {
        response = await this.callGemini(prompt);
      } else if (USE_OPENAI) {
        response = await this.callOpenAI(prompt);
      }

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI matching failed:', error.message);
      return null; // Fall back to rule-based
    }
  }

  /**
   * Build prompt for LLM
   */
  buildMatchingPrompt(job, resume) {
    return `You are an expert recruiter analyzing candidate-job fit. Analyze the following job and resume, then provide a detailed match assessment.

JOB DETAILS:
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requiredSkills?.join(', ') || 'Not specified'}
Experience Required: ${job.experienceYears?.min || 0}-${job.experienceYears?.max || 10} years
Education: ${job.educationLevel || 'Not specified'}
Qualifications: ${job.qualifications?.join(', ') || 'Not specified'}
Responsibilities: ${job.responsibilities?.join(', ') || 'Not specified'}

CANDIDATE RESUME:
Name: ${resume.personalInfo?.fullName || 'Unknown'}
Email: ${resume.personalInfo?.email || 'N/A'}
Skills:
- Technical: ${resume.skills?.technical?.join(', ') || 'None listed'}
- Soft Skills: ${resume.skills?.soft?.join(', ') || 'None listed'}
- Tools: ${resume.skills?.tools?.join(', ') || 'None listed'}
- Languages: ${resume.skills?.languages?.join(', ') || 'None listed'}

Work Experience:
${this.formatExperience(resume.experience)}

Education:
${this.formatEducation(resume.education)}

TASK: Analyze this candidate-job match and respond with ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "overallScore": <number 0-100>,
  "skillMatch": {
    "score": <number 0-100>,
    "matchedSkills": [{"skill": "skill name", "confidence": <0-1>, "source": "exact|semantic|inferred"}],
    "missingSkills": ["skill1", "skill2"],
    "additionalSkills": ["skill1", "skill2"]
  },
  "experienceMatch": {
    "score": <number 0-100>,
    "requiredYears": "${job.experienceYears?.min || 0}-${job.experienceYears?.max || 10}",
    "candidateYears": <number>,
    "relevant": <boolean>,
    "details": "brief explanation"
  },
  "educationMatch": {
    "score": <number 0-100>,
    "meets": <boolean>,
    "details": "brief explanation"
  },
  "semanticSimilarity": <number 0-1>,
  "strengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendation": "strong_match|good_match|potential_match|weak_match|not_recommended",
  "reasoning": "2-3 sentence overall assessment"
}

Important: 
- Be objective and fair
- Consider both hard skills and soft skills
- Account for transferable skills
- Weight: Skills 50%, Experience 30%, Education 20%
- Return ONLY the JSON object, no additional text`;
  }

  /**
   * Format experience for prompt
   */
  formatExperience(experience) {
    if (!experience || experience.length === 0) {
      return 'No experience listed';
    }

    return experience.map(exp => {
      const duration = exp.current 
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;
      return `- ${exp.position} at ${exp.company} (${duration})\n  ${exp.description || 'No description'}`;
    }).join('\n');
  }

  /**
   * Format education for prompt
   */
  formatEducation(education) {
    if (!education || education.length === 0) {
      return 'No education listed';
    }

    return education.map(edu => 
      `- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationYear || 'In progress'})`
    ).join('\n');
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    }, {
      timeout: 30000
    });

    const text = response.data.candidates[0].content.parts[0].text;
    return text.trim();
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter. Respond only with valid JSON, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Parse AI response
   */
  parseAIResponse(responseText) {
    try {
      // Remove markdown code blocks if present
      let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON if wrapped in text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      // Validate required fields
      if (
        typeof parsed.overallScore !== 'number' ||
        !parsed.skillMatch ||
        !parsed.experienceMatch ||
        !parsed.educationMatch
      ) {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      console.error('Response was:', responseText);
      throw new Error('Failed to parse AI response');
    }
  }
}

export default new AIMatchingService();
