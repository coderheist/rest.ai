/**
 * Utility functions for extracting and formatting candidate information
 */

/**
 * Extract candidate name from various data sources
 * Handles cases where candidateName might contain entire resume text
 */
export const extractCandidateName = (candidate) => {
  // Try to get name from structured data first
  if (candidate?.personalInfo?.fullName) {
    return candidate.personalInfo.fullName;
  }
  
  // If candidateName exists but seems to be full resume text (too long), extract just the name
  if (candidate?.candidateName) {
    const text = candidate.candidateName.trim();
    
    // If it's short enough, it's probably just a name
    if (text.length <= 50 && !text.includes('\n')) {
      return text;
    }
    
    // For longer text, extract the name intelligently
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // First, try to find a name-like pattern
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      
      // Skip lines that are clearly not names
      if (line.includes('http') || 
          line.includes('www.') || 
          line.includes('@') ||
          line.match(/^\d+$/) ||
          line.length > 100 ||
          line.includes('SUMMARY') ||
          line.includes('EDUCATION') ||
          line.includes('EXPERIENCE') ||
          line.includes('PROJECT')) {
        continue;
      }
      
      // Look for a name pattern: 2-3 words, reasonable length
      const words = line.split(/\s+/).filter(w => w.length > 0);
      
      // Name is likely 2-4 words at the start
      if (words.length >= 2 && words.length <= 4) {
        const potentialName = words.slice(0, 3).join(' ');
        // Check if it looks like a name (not all caps, not too long)
        if (potentialName.length < 50) {
          return potentialName;
        }
      }
    }
    
    // Last resort: take first 2-3 words from first line
    const firstWords = lines[0]?.split(/\s+/).slice(0, 2).join(' ') || 'Candidate';
    return firstWords.length < 50 ? firstWords : 'Candidate';
  }
  
  return 'Unknown';
};

/**
 * Extract candidate email from various data sources
 */
export const extractCandidateEmail = (candidate) => {
  if (candidate?.personalInfo?.email) {
    return candidate.personalInfo.email;
  }
  
  // Try to extract email from resume text if it exists
  if (candidate?.candidateName) {
    const emailMatch = candidate.candidateName.match(/[\w.-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0] : 'No email';
  }
  
  if (candidate?.email) {
    return candidate.email;
  }
  
  return 'No email';
};

/**
 * Get candidate initials for avatar
 */
export const getCandidateInitials = (candidate) => {
  const name = extractCandidateName(candidate);
  if (name === 'Unknown' || name === 'Candidate') {
    return 'U';
  }
  
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

/**
 * Extract phone number from candidate data
 */
export const extractCandidatePhone = (candidate) => {
  if (candidate?.personalInfo?.phone) {
    return candidate.personalInfo.phone;
  }
  
  // Try to extract phone from resume text
  if (candidate?.candidateName) {
    const phoneMatch = candidate.candidateName.match(/[\d\s\-\+\(\)]{10,}/);
    return phoneMatch ? phoneMatch[0].trim() : null;
  }
  
  return null;
};
