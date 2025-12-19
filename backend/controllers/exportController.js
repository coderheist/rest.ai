import asyncHandler from 'express-async-handler';
import { 
  generateCandidatePDF, 
  generateCandidatesCSV, 
  generateJobSummaryPDF,
  deleteExportFile 
} from '../services/exportService.js';

/**
 * @desc    Export candidate match as PDF
 * @route   GET /api/export/candidate/:matchId/pdf
 * @access  Private
 */
export const exportCandidatePDF = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const tenantId = req.user.tenantId;

  const pdfBuffer = await generateCandidatePDF(matchId, tenantId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=candidate_report_${matchId}.pdf`);
  res.send(pdfBuffer);
});

/**
 * @desc    Export candidates as CSV
 * @route   GET /api/export/job/:jobId/candidates/csv
 * @access  Private
 */
export const exportCandidatesCSV = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;
  const filters = {
    minScore: req.query.minScore,
    status: req.query.status
  };

  const { filepath, filename } = await generateCandidatesCSV(jobId, tenantId, filters);

  res.download(filepath, filename, (err) => {
    // Delete file after download
    deleteExportFile(filepath);
    
    if (err) {
      console.error('Error downloading CSV:', err);
      res.status(500).json({ error: 'Failed to download CSV' });
    }
  });
});

/**
 * @desc    Export job summary report as PDF
 * @route   GET /api/export/job/:jobId/summary/pdf
 * @access  Private
 */
export const exportJobSummaryPDF = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;

  const pdfBuffer = await generateJobSummaryPDF(jobId, tenantId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=job_summary_${jobId}.pdf`);
  res.send(pdfBuffer);
});

/**
 * @desc    Get export statistics
 * @route   GET /api/export/stats
 * @access  Private
 */
export const getExportStats = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;

  // This is a placeholder - you can expand with actual export tracking
  res.status(200).json({
    success: true,
    data: {
      message: 'Export functionality is available',
      supportedFormats: ['PDF', 'CSV'],
      endpoints: {
        candidatePDF: '/api/export/candidate/:matchId/pdf',
        candidatesCSV: '/api/export/job/:jobId/candidates/csv',
        jobSummaryPDF: '/api/export/job/:jobId/summary/pdf'
      }
    }
  });
});
