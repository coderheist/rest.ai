import InterviewKit from '../models/InterviewKit.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Match from '../models/Match.js';
import { incrementUsage } from './usageService.js';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_GEMINI = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here';
const USE_OPENAI = !USE_GEMINI && OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';

class InterviewService {
  /**
   * Generate interview kit for a candidate
   */
  async generateInterviewKit(jobId, resumeId, tenantId, userId) {
    try {
      // Check if kit already exists
      const existingKit = await InterviewKit.findOne({ jobId, resumeId, tenantId });
      if (existingKit) {
        return existingKit;
      }

      // Fetch job, resume, and match
      const job = await Job.findById(jobId);
      const resume = await Resume.findById(resumeId);
      const match = await Match.findOne({ jobId, resumeId, tenantId });

      if (!job || !resume) {
        throw new Error('Job or Resume not found');
      }

      // Create initial kit record
      const kit = new InterviewKit({
        tenantId,
        jobId,
        resumeId,
        matchId: match?._id,
        generatedBy: userId,
        generationStatus: 'generating'
      });
      await kit.save();

      // Generate questions asynchronously
      this.generateQuestionsAsync(kit._id, job, resume, match).catch(err => {
        console.error('Error generating questions:', err);
      });

      return kit;
    } catch (error) {
      throw new Error(`Failed to generate interview kit: ${error.message}`);
    }
  }

  /**
   * Generate questions asynchronously using LLM
   */
  async generateQuestionsAsync(kitId, job, resume, match) {
    try {
      const kit = await InterviewKit.findById(kitId);
      
      if (!USE_GEMINI && !USE_OPENAI) {
        // Use template-based generation
        const questions = this.generateTemplateQuestions(job, resume, match);
        kit.technicalQuestions = questions.technical;
        kit.behavioralQuestions = questions.behavioral;
        kit.situationalQuestions = questions.situational;
        kit.evaluationRubric = questions.rubric;
        kit.interviewStructure = questions.structure;
        kit.redFlags = questions.redFlags;
        kit.greenFlags = questions.greenFlags;
        kit.focusAreas = questions.focusAreas;
        kit.generationStatus = 'completed';
        kit.llmModel = 'template-based';
        await kit.save();
        return;
      }

      // Build prompt
      const prompt = this.buildInterviewPrompt(job, resume, match);

      // Call LLM
      let response;
      if (USE_GEMINI) {
        response = await this.callGemini(prompt);
        kit.llmModel = 'gemini-1.5-flash';
      } else if (USE_OPENAI) {
        response = await this.callOpenAI(prompt);
        kit.llmModel = 'gpt-3.5-turbo';
      }

      // Parse response
      const questions = this.parseQuestionsResponse(response);

      // Update kit
      kit.technicalQuestions = questions.technical;
      kit.behavioralQuestions = questions.behavioral;
      kit.situationalQuestions = questions.situational;
      kit.evaluationRubric = questions.rubric;
      kit.interviewStructure = questions.structure;
      kit.redFlags = questions.redFlags;
      kit.greenFlags = questions.greenFlags;
      kit.focusAreas = questions.focusAreas;
      kit.interviewerNotes = questions.interviewerNotes;
      kit.generationStatus = 'completed';
      
      await kit.save();

      // Track usage
      await incrementUsage(kit.tenantId, 'llmCalls', 1);
      await incrementUsage(kit.tenantId, 'interviewKitsGenerated', 1);

    } catch (error) {
      const kit = await InterviewKit.findById(kitId);
      kit.generationStatus = 'failed';
      kit.generationError = error.message;
      await kit.save();
      throw error;
    }
  }

  /**
   * Build interview generation prompt
   */
  buildInterviewPrompt(job, resume, match) {
    const matchInfo = match ? `\nMATCH SCORE: ${match.overallScore}/100
Strengths: ${match.strengths?.join(', ') || 'None'}
Concerns: ${match.concerns?.join(', ') || 'None'}` : '';

    return `You are an expert technical recruiter. Generate a comprehensive interview kit for the following candidate-job pairing.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company || 'Company'}
Description: ${job.description}
Required Skills: ${job.requiredSkills?.join(', ') || 'Not specified'}
Experience: ${job.experienceYears?.min || 0}-${job.experienceYears?.max || 10} years
Responsibilities: ${job.responsibilities?.join(', ') || 'Not specified'}

CANDIDATE PROFILE:
Name: ${resume.personalInfo?.fullName || 'Candidate'}
Skills: ${resume.skills?.technical?.join(', ') || 'Not listed'}
Experience: ${resume.experience?.length || 0} positions
Education: ${resume.education?.map(e => `${e.degree} in ${e.field}`).join(', ') || 'Not listed'}
${matchInfo}

TASK: Generate a complete interview kit with ONLY a valid JSON object (no markdown, no code blocks):

{
  "technical": [
    {
      "question": "detailed technical question",
      "category": "coding|system_design|algorithms|database|architecture|tools|other",
      "difficulty": "easy|medium|hard",
      "skillsAssessed": ["skill1", "skill2"],
      "expectedAnswer": "what you're looking for in the answer",
      "evaluationCriteria": ["criterion1", "criterion2"],
      "timeEstimate": 15
    }
  ],
  "behavioral": [
    {
      "question": "behavioral question using STAR framework",
      "category": "leadership|teamwork|problem_solving|communication|adaptability|conflict_resolution|other",
      "competency": "specific competency being assessed",
      "expectedAnswer": "ideal answer characteristics",
      "evaluationCriteria": ["criterion1", "criterion2"],
      "starFramework": {
        "situation": "what situation to look for",
        "task": "what task they handled",
        "action": "actions they should describe",
        "result": "results to highlight"
      }
    }
  ],
  "situational": [
    {
      "scenario": "realistic work scenario",
      "question": "how would they handle it",
      "expectedApproach": "ideal approach",
      "evaluationPoints": ["point1", "point2"]
    }
  ],
  "rubric": {
    "technicalSkills": {
      "weight": 40,
      "criteria": ["criterion1", "criterion2"]
    },
    "problemSolving": {
      "weight": 30,
      "criteria": ["criterion1", "criterion2"]
    },
    "communication": {
      "weight": 15,
      "criteria": ["criterion1", "criterion2"]
    },
    "cultureFit": {
      "weight": 15,
      "criteria": ["criterion1", "criterion2"]
    }
  },
  "structure": {
    "duration": 60,
    "sections": [
      {"name": "Introduction", "duration": 5, "description": "brief intro"},
      {"name": "Technical Deep Dive", "duration": 30, "description": "assess skills"},
      {"name": "Behavioral Questions", "duration": 20, "description": "culture fit"},
      {"name": "Q&A", "duration": 5, "description": "candidate questions"}
    ]
  },
  "redFlags": ["red flag to watch for"],
  "greenFlags": ["positive signal to look for"],
  "focusAreas": ["key area to probe"],
  "interviewerNotes": "2-3 sentence guidance for interviewer"
}

Guidelines:
- Generate 5-7 technical questions tailored to the role and candidate's background
- Generate 4-5 behavioral questions using STAR framework
- Generate 2-3 situational questions for problem-solving assessment
- Focus on areas where the candidate is strong (to confirm) and weak (to assess)
- Make questions specific to the job requirements
- Provide actionable evaluation criteria
- Return ONLY the JSON object`;
  }

  /**
   * Template-based question generation (fallback)
   */
  generateTemplateQuestions(job, resume, match) {
    const skills = job.requiredSkills || [];
    
    return {
      technical: [
        {
          question: `Describe your experience with ${skills[0] || 'the primary technology'} and how you've applied it in production environments.`,
          category: 'tools',
          difficulty: 'medium',
          skillsAssessed: [skills[0]],
          expectedAnswer: 'Look for specific examples, depth of knowledge, and production experience',
          evaluationCriteria: ['Depth of knowledge', 'Practical application', 'Problem-solving approach'],
          timeEstimate: 15
        },
        {
          question: `Walk me through how you would design a ${job.title.toLowerCase()} solution for ${job.description.substring(0, 50)}...`,
          category: 'system_design',
          difficulty: 'medium',
          skillsAssessed: skills.slice(0, 3),
          expectedAnswer: 'Should demonstrate architectural thinking and trade-off analysis',
          evaluationCriteria: ['System thinking', 'Scalability considerations', 'Communication clarity'],
          timeEstimate: 20
        },
        {
          question: 'Tell me about a challenging technical problem you solved recently. What was your approach?',
          category: 'problem_solving',
          difficulty: 'medium',
          skillsAssessed: ['Problem Solving', 'Technical Skills'],
          expectedAnswer: 'Clear problem statement, systematic approach, measurable outcome',
          evaluationCriteria: ['Problem complexity', 'Solution quality', 'Learning mindset'],
          timeEstimate: 15
        }
      ],
      behavioral: [
        {
          question: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?',
          category: 'teamwork',
          competency: 'Collaboration',
          expectedAnswer: 'Professional approach, focus on solutions, positive outcome',
          evaluationCriteria: ['Emotional intelligence', 'Conflict resolution', 'Team orientation'],
          starFramework: {
            situation: 'Team conflict situation',
            task: 'Their role in resolving it',
            action: 'Specific steps taken',
            result: 'Outcome and learning'
          }
        },
        {
          question: 'Describe a situation where you had to learn a new technology quickly to meet a deadline.',
          category: 'adaptability',
          competency: 'Learning Agility',
          expectedAnswer: 'Self-directed learning, resourcefulness, successful delivery',
          evaluationCriteria: ['Learning speed', 'Resource utilization', 'Delivery quality'],
          starFramework: {
            situation: 'Tight deadline with knowledge gap',
            task: 'Learning requirement',
            action: 'Learning strategy',
            result: 'Successful application'
          }
        }
      ],
      situational: [
        {
          scenario: `You're working on a critical feature for ${job.company || 'the company'} when you discover a significant bug in production. The team lead is unavailable.`,
          question: 'How would you handle this situation?',
          expectedApproach: 'Assess impact, contain issue, communicate to stakeholders, implement fix, document',
          evaluationPoints: ['Decision making', 'Communication', 'Technical judgment', 'Ownership']
        }
      ],
      rubric: {
        technicalSkills: {
          weight: 40,
          criteria: ['Technical depth', 'Problem-solving ability', 'Code quality mindset']
        },
        problemSolving: {
          weight: 30,
          criteria: ['Analytical thinking', 'Systematic approach', 'Learning from failure']
        },
        communication: {
          weight: 15,
          criteria: ['Clear explanation', 'Active listening', 'Collaborative attitude']
        },
        cultureFit: {
          weight: 15,
          criteria: ['Team orientation', 'Growth mindset', 'Alignment with values']
        }
      },
      structure: {
        duration: 60,
        sections: [
          { name: 'Introduction', duration: 5, description: 'Build rapport, explain format' },
          { name: 'Technical Assessment', duration: 30, description: 'Evaluate core skills' },
          { name: 'Behavioral Questions', duration: 20, description: 'Assess culture fit' },
          { name: 'Candidate Questions', duration: 5, description: 'Address their questions' }
        ]
      },
      redFlags: [
        'Lack of specific examples',
        'Blaming others for failures',
        'Unwillingness to learn new things',
        'Poor communication skills'
      ],
      greenFlags: [
        'Concrete examples with metrics',
        'Takes ownership of mistakes',
        'Shows curiosity and learning',
        'Clear, structured thinking'
      ],
      focusAreas: [
        `Depth of ${skills[0] || 'core'} skills`,
        'Problem-solving methodology',
        'Team collaboration experience',
        'Growth mindset indicators'
      ]
    };
  }

  /**
   * Call Gemini API
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
        temperature: 0.4,
        maxOutputTokens: 4096,
      }
    }, {
      timeout: 45000
    });

    return response.data.candidates[0].content.parts[0].text.trim();
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo-16k',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical recruiter. Respond only with valid JSON, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4096
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Parse LLM response
   */
  parseQuestionsResponse(responseText) {
    try {
      let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      if (!parsed.technical || !parsed.behavioral) {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse questions response:', error.message);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Get interview kit by ID
   */
  async getInterviewKit(kitId, tenantId) {
    try {
      const kit = await InterviewKit.findOne({ _id: kitId, tenantId })
        .populate('jobId', 'title company')
        .populate('resumeId', 'fileName personalInfo')
        .populate('matchId', 'overallScore recommendation');
      
      if (kit) {
        await kit.incrementViews();
      }

      return kit;
    } catch (error) {
      throw new Error(`Failed to get interview kit: ${error.message}`);
    }
  }

  /**
   * Get interview kits by job
   */
  async getKitsByJob(jobId, tenantId) {
    try {
      return await InterviewKit.findByJob(jobId, tenantId);
    } catch (error) {
      throw new Error(`Failed to get interview kits: ${error.message}`);
    }
  }

  /**
   * Get interview kits by resume
   */
  async getKitsByResume(resumeId, tenantId) {
    try {
      return await InterviewKit.findByResume(resumeId, tenantId);
    } catch (error) {
      throw new Error(`Failed to get interview kits: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStats(tenantId) {
    try {
      return await InterviewKit.getStats(tenantId);
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Delete interview kit
   */
  async deleteKit(kitId, tenantId) {
    try {
      const kit = await InterviewKit.findOne({ _id: kitId, tenantId });
      if (!kit) {
        throw new Error('Interview kit not found');
      }
      await kit.deleteOne();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete interview kit: ${error.message}`);
    }
  }
}

export default new InterviewService();
