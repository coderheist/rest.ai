/**
 * Job Post Generation Service
 * Generates platform-specific job posts using Gemini AI
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_GEMINI = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here';

class JobPostService {
  /**
   * Generate job posts for multiple platforms
   */
  async generateJobPosts(job) {
    if (!USE_GEMINI) {
      console.log('⚠️ No Gemini API key, using fallback posts');
      return {
        success: false,
        posts: this.generateFallbackPosts(job)
      };
    }

    try {
      const platforms = ['linkedin', 'naukri', 'indeed', 'twitter'];
      const posts = {};

      console.log('🚀 Generating posts for job:', job.title);

      // Generate posts for each platform in parallel
      const results = await Promise.all(
        platforms.map(platform => this.generatePostForPlatform(job, platform))
      );

      platforms.forEach((platform, index) => {
        posts[platform] = results[index];
        console.log(`✅ Generated ${platform} post:`, results[index]);
      });

      console.log('📦 Final posts object:', posts);

      return {
        success: true,
        posts
      };
    } catch (error) {
      console.error('Error generating job posts:', error);
      return {
        success: false,
        error: error.message,
        posts: this.generateFallbackPosts(job)
      };
    }
  }

  /**
   * Generate post for specific platform
   */
  async generatePostForPlatform(job, platform) {
    const prompt = this.createPrompt(job, platform);
    
    try {
      const response = await this.callGemini(prompt);
      
      return {
        content: response,
        platform: platform,
        characterCount: response.length,
        hashtags: this.extractHashtags(response),
        generatedAt: new Date()
      };
    } catch (error) {
      console.error(`Error generating ${platform} post:`, error);
      return this.getFallbackPost(job, platform);
    }
  }

  /**
   * Create platform-specific prompt
   */
  createPrompt(job, platform) {
    const baseInfo = `
Job Title: ${job.title}
Department: ${job.department || 'Not specified'}
Location: ${job.location?.city || 'Remote'}, ${job.location?.state || ''}, ${job.location?.country || ''}
Type: ${job.type || 'Full-time'}
Experience Level: ${job.experienceLevel || 'Mid-level'}
Salary Range: ${job.salary?.min && job.salary?.max ? `$${job.salary.min} - $${job.salary.max}` : 'Competitive'}

Description: ${job.description}

Key Responsibilities:
${job.responsibilities?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Not specified'}

Required Skills:
${job.skills?.required?.join(', ') || 'Not specified'}

Preferred Skills:
${job.skills?.preferred?.join(', ') || 'None'}

Benefits:
${job.benefits?.join(', ') || 'Competitive benefits package'}
`;

    const prompts = {
      linkedin: `Create an engaging LinkedIn job post with the following requirements:

${baseInfo}

Format Requirements:
- Start with an attention-grabbing hook (1-2 sentences)
- Use emojis appropriately (2-3 max)
- Write in a professional yet friendly tone
- Include 3-5 bullet points for key responsibilities
- Highlight company culture or unique selling points
- Add a strong call-to-action
- Include 5-7 relevant hashtags (e.g., #Hiring #TechJobs #Remote)
- Keep it between 500-800 characters
- Use line breaks for readability

Generate ONLY the post content, no additional explanation.`,

      naukri: `Create a detailed Naukri.com job post with the following requirements:

${baseInfo}

Format Requirements:
- Use formal, professional language
- Clear section headings
- Detailed role description (2-3 paragraphs)
- List key responsibilities (5-7 points)
- Clearly state required qualifications
- Mention preferred qualifications separately
- Include experience requirements
- Specify skills needed
- Mention benefits and perks
- Add application instructions
- Keep it structured and easy to scan
- Length: 800-1200 characters

Generate ONLY the post content, no additional explanation.`,

      indeed: `Create a concise Indeed job post with the following requirements:

${baseInfo}

Format Requirements:
- Start with a brief company overview (1-2 sentences)
- Clear, direct language
- List 3-4 core responsibilities
- State essential qualifications only
- Highlight top 2-3 benefits
- Include salary range if available
- Add clear application CTA
- Keep it scannable with bullet points
- Length: 400-600 characters
- No hashtags needed

Generate ONLY the post content, no additional explanation.`,

      twitter: `Create a short Twitter/X job post with the following requirements:

${baseInfo}

Format Requirements:
- Ultra-concise (under 280 characters)
- Include job title and key requirement
- Add 1 compelling benefit
- Use 1-2 emojis
- Include 2-3 hashtags
- Strong call-to-action
- Link placeholder: [Apply Here]
- Engaging and attention-grabbing

Generate ONLY the tweet content, no additional explanation.`
    };

    return prompts[platform] || prompts.linkedin;
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from Gemini');
    }

    return generatedText.trim();
  }

  /**
   * Extract hashtags from generated content
   */
  extractHashtags(content) {
    const hashtagRegex = /#[\w]+/g;
    const matches = content.match(hashtagRegex);
    return matches || [];
  }

  /**
   * Generate fallback posts when AI is not available
   */
  generateFallbackPosts(job) {
    return {
      linkedin: this.getFallbackPost(job, 'linkedin'),
      naukri: this.getFallbackPost(job, 'naukri'),
      indeed: this.getFallbackPost(job, 'indeed'),
      twitter: this.getFallbackPost(job, 'twitter')
    };
  }

  /**
   * Get fallback post for platform
   */
  getFallbackPost(job, platform) {
    const location = job.location?.city || 'Remote';
    const skills = job.skills?.required?.slice(0, 3).join(', ') || 'Various skills';

    const templates = {
      linkedin: {
        content: `🚀 We're Hiring: ${job.title}!

We're looking for a talented ${job.title} to join our team in ${location}.

Key Responsibilities:
${job.responsibilities?.slice(0, 3).map(r => `• ${r}`).join('\n') || '• Lead key initiatives\n• Drive innovation\n• Collaborate with teams'}

Required Skills: ${skills}

Interested? Apply now!

#Hiring #Jobs #${job.title.replace(/\s+/g, '')} #TechCareers #NowHiring`,
        platform: 'linkedin',
        characterCount: 0,
        hashtags: ['#Hiring', '#Jobs', '#TechCareers', '#NowHiring'],
        generatedAt: new Date()
      },

      naukri: {
        content: `Job Title: ${job.title}

Location: ${location}
Experience: ${job.experienceLevel || '2-5 years'}
Employment Type: ${job.type || 'Full-time'}

Job Description:
We are seeking a qualified ${job.title} to join our growing team. The ideal candidate will have strong technical skills and a passion for innovation.

Key Responsibilities:
${job.responsibilities?.map((r, i) => `${i + 1}. ${r}`).join('\n') || '1. Lead technical projects\n2. Collaborate with team members\n3. Drive innovation'}

Required Skills:
${job.skills?.required?.join(', ') || 'Not specified'}

Preferred Skills:
${job.skills?.preferred?.join(', ') || 'None'}

Benefits:
${job.benefits?.join(', ') || 'Competitive salary, Health insurance, Professional development'}

To Apply:
Submit your resume and cover letter through our careers portal.`,
        platform: 'naukri',
        characterCount: 0,
        hashtags: [],
        generatedAt: new Date()
      },

      indeed: {
        content: `${job.title} - ${location}

About the Role:
We're seeking a ${job.title} to contribute to our team's success.

Responsibilities:
${job.responsibilities?.slice(0, 3).map(r => `• ${r}`).join('\n') || '• Lead projects\n• Collaborate effectively\n• Drive results'}

Requirements:
• ${skills}
• Strong communication skills
• Team player

Benefits:
${job.benefits?.slice(0, 2).join(', ') || 'Competitive salary, Benefits package'}

Apply today to join our team!`,
        platform: 'indeed',
        characterCount: 0,
        hashtags: [],
        generatedAt: new Date()
      },

      twitter: {
        content: `🎯 Hiring: ${job.title} | ${location}
${skills.split(',')[0]} required
💰 Competitive salary
Apply: [Link]
#Hiring #Jobs #TechJobs`,
        platform: 'twitter',
        characterCount: 0,
        hashtags: ['#Hiring', '#Jobs', '#TechJobs'],
        generatedAt: new Date()
      }
    };

    const post = templates[platform];
    post.characterCount = post.content.length;
    return post;
  }
}

export default new JobPostService();
