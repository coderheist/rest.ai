import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Match from '../models/Match.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import Review from '../models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF report for a candidate match
 */
export const generateCandidatePDF = async (matchId, tenantId) => {
  // Fetch match with populated data
  const match = await Match.findOne({ _id: matchId, tenantId })
    .populate('jobId')
    .populate('resumeId')
    .lean();

  if (!match) {
    throw new Error('Match not found');
  }

  // Fetch reviews for this match
  const reviews = await Review.find({ matchId, tenantId })
    .populate('reviewerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Candidate Match Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#666666')
        .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(1.5);

      // Overall Score Section
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Overall Match Score');
      doc.moveDown(0.3);
      
      const scoreColor = match.overallScore >= 80 ? '#10B981' : 
                         match.overallScore >= 70 ? '#3B82F6' :
                         match.overallScore >= 60 ? '#F59E0B' : '#EF4444';
      
      doc.fontSize(48).fillColor(scoreColor).text(`${match.overallScore}/100`, { align: 'center' });
      doc.moveDown(1);

      // Candidate Information
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Candidate Information');
      doc.moveDown(0.5);
      
      const candidate = match.resumeId.personalInfo || {};
      doc.fontSize(11).font('Helvetica');
      
      if (candidate.fullName) {
        doc.text(`Name: ${candidate.fullName}`);
      }
      if (candidate.email) {
        doc.text(`Email: ${candidate.email}`);
      }
      if (candidate.phone) {
        doc.text(`Phone: ${candidate.phone}`);
      }
      if (candidate.location) {
        doc.text(`Location: ${candidate.location}`);
      }
      doc.moveDown(1);

      // Position Details
      doc.fontSize(14).font('Helvetica-Bold').text('Position Details');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Job Title: ${match.jobId.title}`);
      if (match.jobId.company) {
        doc.text(`Company: ${match.jobId.company}`);
      }
      if (match.jobId.department) {
        doc.text(`Department: ${match.jobId.department}`);
      }
      if (match.jobId.location) {
        doc.text(`Location: ${match.jobId.location}`);
      }
      doc.moveDown(1);

      // Score Breakdown
      doc.fontSize(14).font('Helvetica-Bold').text('Score Breakdown');
      doc.moveDown(0.5);
      
      const drawScoreBar = (label, score) => {
        const barWidth = 400;
        const barHeight = 15;
        const fillWidth = (score / 100) * barWidth;
        
        doc.fontSize(10).font('Helvetica').text(label);
        doc.moveDown(0.2);
        
        const y = doc.y;
        
        // Background bar
        doc.rect(50, y, barWidth, barHeight).fillAndStroke('#E5E7EB', '#D1D5DB');
        
        // Fill bar
        doc.rect(50, y, fillWidth, barHeight).fill(scoreColor);
        
        // Score text
        doc.fillColor('#000000').fontSize(10).text(`${score}%`, 50 + barWidth + 10, y + 2);
        
        doc.moveDown(1);
      };

      drawScoreBar('Skills Match', match.skillMatch?.score || 0);
      drawScoreBar('Experience Match', match.experienceMatch?.score || 0);
      drawScoreBar('Education Match', match.educationMatch?.score || 0);
      
      doc.moveDown(0.5);

      // Strengths
      if (match.strengths && match.strengths.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#10B981').text('Strengths');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#000000');
        
        match.strengths.forEach((strength) => {
          doc.text(`• ${strength}`, { indent: 10 });
        });
        doc.moveDown(1);
      }

      // Concerns
      if (match.concerns && match.concerns.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#F59E0B').text('Areas of Concern');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#000000');
        
        match.concerns.forEach((concern) => {
          doc.text(`• ${concern}`, { indent: 10 });
        });
        doc.moveDown(1);
      }

      // AI Reasoning
      if (match.aiReasoning) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('AI Analysis');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(match.aiReasoning, { align: 'justify' });
        doc.moveDown(1);
      }

      // Team Reviews
      if (reviews.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text(`Team Reviews (${reviews.length})`);
        doc.moveDown(0.5);

        // Average rating
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        doc.fontSize(11).font('Helvetica').text(`Average Rating: ${'★'.repeat(Math.round(avgRating))} ${avgRating.toFixed(1)}/5`);
        doc.moveDown(1);

        reviews.forEach((review, index) => {
          if (index > 0) doc.moveDown(1);
          
          doc.fontSize(11).font('Helvetica-Bold').text(`Review ${index + 1}`);
          doc.fontSize(9).font('Helvetica')
            .text(`By: ${review.reviewerId?.name || 'Unknown'} | ${new Date(review.createdAt).toLocaleDateString()}`)
            .text(`Rating: ${'★'.repeat(review.rating)} ${review.rating}/5`)
            .text(`Stage: ${review.stage.replace('_', ' ').toUpperCase()}`)
            .text(`Recommendation: ${review.recommendation.replace('_', ' ').toUpperCase()}`);
          
          doc.moveDown(0.3);
          doc.fontSize(9).text(`Feedback: ${review.feedback}`, { align: 'justify' });
          
          // Check if we need a new page
          if (doc.y > 700 && index < reviews.length - 1) {
            doc.addPage();
          }
        });
      }

      // Skills Details
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('Skills Analysis');
      doc.moveDown(0.5);

      if (match.skillMatch?.matchedSkills?.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#10B981').text('Matched Skills');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').fillColor('#000000');
        
        match.skillMatch.matchedSkills.forEach((skill) => {
          doc.text(`• ${skill.skill}${skill.proficiency ? ` (${skill.proficiency})` : ''}`, { indent: 10 });
        });
        doc.moveDown(1);
      }

      if (match.skillMatch?.missingSkills?.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#EF4444').text('Missing Skills');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').fillColor('#000000');
        
        match.skillMatch.missingSkills.forEach((skill) => {
          doc.text(`• ${skill}`, { indent: 10 });
        });
        doc.moveDown(1);
      }

      // Experience Details
      if (match.resumeId.experience && match.resumeId.experience.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Experience');
        doc.moveDown(0.5);
        
        match.resumeId.experience.slice(0, 3).forEach((exp, index) => {
          if (index > 0) doc.moveDown(0.5);
          
          doc.fontSize(11).font('Helvetica-Bold').text(exp.position);
          doc.fontSize(10).font('Helvetica').text(`${exp.company} | ${exp.duration || 'N/A'}`);
          
          if (exp.responsibilities && exp.responsibilities.length > 0) {
            doc.moveDown(0.2);
            exp.responsibilities.slice(0, 3).forEach((resp) => {
              doc.fontSize(9).text(`• ${resp}`, { indent: 10 });
            });
          }
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#666666')
          .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate CSV export for candidates/matches
 */
export const generateCandidatesCSV = async (jobId, tenantId, filters = {}) => {
  // Fetch matches
  const query = { jobId, tenantId };
  
  if (filters.minScore) {
    query.overallScore = { $gte: parseInt(filters.minScore) };
  }
  
  if (filters.status) {
    query.status = filters.status;
  }

  const matches = await Match.find(query)
    .populate('resumeId')
    .populate('jobId', 'title company department')
    .sort({ overallScore: -1 })
    .lean();

  // Create temporary file
  const timestamp = Date.now();
  const filename = `candidates_${jobId}_${timestamp}.csv`;
  const filepath = path.join(__dirname, '../../uploads/exports', filename);

  // Ensure exports directory exists
  const exportsDir = path.join(__dirname, '../../uploads/exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'candidateName', title: 'Candidate Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'location', title: 'Location' },
      { id: 'overallScore', title: 'Overall Score' },
      { id: 'skillScore', title: 'Skills Match' },
      { id: 'experienceScore', title: 'Experience Match' },
      { id: 'educationScore', title: 'Education Match' },
      { id: 'matchedSkills', title: 'Matched Skills' },
      { id: 'missingSkills', title: 'Missing Skills' },
      { id: 'status', title: 'Status' },
      { id: 'reviewCount', title: 'Reviews' },
      { id: 'avgRating', title: 'Avg Rating' },
      { id: 'appliedDate', title: 'Applied Date' }
    ]
  });

  const records = matches.map((match) => {
    const candidate = match.resumeId?.personalInfo || {};
    
    return {
      candidateName: candidate.fullName || 'N/A',
      email: candidate.email || 'N/A',
      phone: candidate.phone || 'N/A',
      location: candidate.location || 'N/A',
      overallScore: match.overallScore,
      skillScore: match.skillMatch?.score || 0,
      experienceScore: match.experienceMatch?.score || 0,
      educationScore: match.educationMatch?.score || 0,
      matchedSkills: match.skillMatch?.matchedSkills?.map(s => s.skill).join('; ') || 'None',
      missingSkills: match.skillMatch?.missingSkills?.join('; ') || 'None',
      status: match.status,
      reviewCount: match.reviewCount || 0,
      avgRating: match.averageReviewRating ? match.averageReviewRating.toFixed(1) : 'N/A',
      appliedDate: new Date(match.createdAt).toLocaleDateString()
    };
  });

  await csvWriter.writeRecords(records);
  
  return { filepath, filename };
};

/**
 * Generate job summary report as PDF
 */
export const generateJobSummaryPDF = async (jobId, tenantId) => {
  const job = await Job.findOne({ _id: jobId, tenantId }).lean();
  
  if (!job) {
    throw new Error('Job not found');
  }

  const matches = await Match.find({ jobId, tenantId })
    .populate('resumeId')
    .sort({ overallScore: -1 })
    .lean();

  const reviews = await Review.find({ jobId, tenantId })
    .populate('reviewerId', 'name')
    .lean();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Job Posting Summary Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#666666')
        .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(1.5);

      // Job Details
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text(job.title);
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      
      if (job.company) doc.text(`Company: ${job.company}`);
      if (job.department) doc.text(`Department: ${job.department}`);
      if (job.location) doc.text(`Location: ${job.location}`);
      if (job.employmentType) doc.text(`Type: ${job.employmentType}`);
      
      doc.text(`Status: ${job.status.toUpperCase()}`);
      doc.text(`Posted: ${new Date(job.createdAt).toLocaleDateString()}`);
      doc.moveDown(1.5);

      // Statistics
      doc.fontSize(14).font('Helvetica-Bold').text('Application Statistics');
      doc.moveDown(0.5);

      const stats = {
        total: matches.length,
        pending: matches.filter(m => m.status === 'pending').length,
        reviewed: matches.filter(m => m.status === 'reviewed').length,
        shortlisted: matches.filter(m => m.isShortlisted).length,
        rejected: matches.filter(m => m.status === 'rejected').length,
        avgScore: matches.length > 0 ? (matches.reduce((sum, m) => sum + m.overallScore, 0) / matches.length).toFixed(1) : 0,
        reviewCount: reviews.length,
        avgReviewRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
      };

      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Applicants: ${stats.total}`);
      doc.text(`Pending Review: ${stats.pending}`);
      doc.text(`Reviewed: ${stats.reviewed}`);
      doc.text(`Shortlisted: ${stats.shortlisted}`);
      doc.text(`Rejected: ${stats.rejected}`);
      doc.text(`Average Match Score: ${stats.avgScore}/100`);
      doc.text(`Total Reviews: ${stats.reviewCount}`);
      if (stats.reviewCount > 0) {
        doc.text(`Average Review Rating: ${stats.avgReviewRating}/5`);
      }
      doc.moveDown(1.5);

      // Top Candidates
      if (matches.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Top 10 Candidates');
        doc.moveDown(0.5);

        const topCandidates = matches.slice(0, 10);
        
        topCandidates.forEach((match, index) => {
          const candidate = match.resumeId?.personalInfo || {};
          const scoreColor = match.overallScore >= 80 ? '#10B981' : 
                            match.overallScore >= 70 ? '#3B82F6' :
                            match.overallScore >= 60 ? '#F59E0B' : '#666666';
          
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
            .text(`${index + 1}. ${candidate.fullName || 'Unknown Candidate'}`);
          
          doc.fontSize(9).font('Helvetica')
            .text(`   Score: `, { continued: true })
            .fillColor(scoreColor).text(`${match.overallScore}/100`, { continued: true })
            .fillColor('#000000').text(` | Skills: ${match.skillMatch?.score || 0}% | Experience: ${match.experienceMatch?.score || 0}%`);
          
          if (match.isShortlisted) {
            doc.fillColor('#10B981').text('   ★ Shortlisted', { continued: true });
          }
          doc.fillColor('#000000');
          
          doc.moveDown(0.5);
        });
      }

      // Required Skills
      if (job.requiredSkills && job.requiredSkills.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('Required Skills');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        
        job.requiredSkills.forEach((skill) => {
          doc.text(`• ${skill}`, { indent: 10 });
        });
        doc.moveDown(1);
      }

      // Job Description
      if (job.description) {
        doc.fontSize(14).font('Helvetica-Bold').text('Job Description');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(job.description, { align: 'justify' });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#666666')
          .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete temporary export file
 */
export const deleteExportFile = (filepath) => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};
