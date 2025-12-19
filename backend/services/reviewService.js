import Review from '../models/Review.js';
import Match from '../models/Match.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';

export const createReview = async (tenantId, reviewerId, data) => {
  const { matchId, rating, feedback, stage, strengths, weaknesses, recommendation, technicalSkills, communication, cultureFit, problemSolving, isConfidential, sharedWith } = data;

  // Verify match exists
  const match = await Match.findOne({ _id: matchId, tenantId })
    .populate('jobId')
    .populate('resumeId');

  if (!match) {
    throw new Error('Match not found');
  }

  // Check if reviewer already reviewed this match
  const existingReview = await Review.findOne({ matchId, reviewerId, tenantId });
  if (existingReview) {
    throw new Error('You have already reviewed this candidate. Use update to modify your review.');
  }

  const review = new Review({
    tenantId,
    matchId,
    jobId: match.jobId._id,
    resumeId: match.resumeId._id,
    reviewerId,
    rating,
    feedback,
    stage: stage || 'screening',
    strengths: strengths || [],
    weaknesses: weaknesses || [],
    recommendation,
    technicalSkills: technicalSkills || {},
    communication: communication || {},
    cultureFit: cultureFit || {},
    problemSolving: problemSolving || {},
    isConfidential: isConfidential || false,
    sharedWith: sharedWith || []
  });

  await review.save();
  await review.populate('reviewerId', 'name email role');

  return review;
};

export const getReviewById = async (reviewId, tenantId) => {
  const review = await Review.findOne({ _id: reviewId, tenantId })
    .populate('reviewerId', 'name email role')
    .populate('jobId', 'title department')
    .populate('resumeId', 'candidateInfo.name fileName');

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};

export const getReviewsByMatch = async (matchId, tenantId) => {
  const reviews = await Review.getReviewsByMatch(matchId, tenantId);
  const averageRating = await Review.getAverageRating(matchId, tenantId);

  return {
    reviews,
    averageRating
  };
};

export const getReviewsByJob = async (jobId, tenantId, options = {}) => {
  return Review.getReviewsByJob(jobId, tenantId, options);
};

export const getReviewsByReviewer = async (reviewerId, tenantId, options = {}) => {
  return Review.getReviewsByReviewer(reviewerId, tenantId, options);
};

export const updateReview = async (reviewId, tenantId, reviewerId, data) => {
  const review = await Review.findOne({ _id: reviewId, tenantId });

  if (!review) {
    throw new Error('Review not found');
  }

  // Only the reviewer can update their review (or admin)
  if (review.reviewerId.toString() !== reviewerId.toString()) {
    throw new Error('Unauthorized to update this review');
  }

  const { rating, feedback, stage, strengths, weaknesses, recommendation, technicalSkills, communication, cultureFit, problemSolving, isConfidential, sharedWith } = data;

  if (rating !== undefined) review.rating = rating;
  if (feedback !== undefined) review.feedback = feedback;
  if (stage !== undefined) review.stage = stage;
  if (strengths !== undefined) review.strengths = strengths;
  if (weaknesses !== undefined) review.weaknesses = weaknesses;
  if (recommendation !== undefined) review.recommendation = recommendation;
  if (technicalSkills !== undefined) review.technicalSkills = technicalSkills;
  if (communication !== undefined) review.communication = communication;
  if (cultureFit !== undefined) review.cultureFit = cultureFit;
  if (problemSolving !== undefined) review.problemSolving = problemSolving;
  if (isConfidential !== undefined) review.isConfidential = isConfidential;
  if (sharedWith !== undefined) review.sharedWith = sharedWith;

  await review.save();
  await review.populate('reviewerId', 'name email role');

  return review;
};

export const deleteReview = async (reviewId, tenantId, reviewerId) => {
  const review = await Review.findOne({ _id: reviewId, tenantId });

  if (!review) {
    throw new Error('Review not found');
  }

  // Only the reviewer can delete their review (or admin)
  if (review.reviewerId.toString() !== reviewerId.toString()) {
    throw new Error('Unauthorized to delete this review');
  }

  await Review.deleteOne({ _id: reviewId });
  return { message: 'Review deleted successfully' };
};

export const getAverageRating = async (matchId, tenantId) => {
  return Review.getAverageRating(matchId, tenantId);
};

export const getRecommendationDistribution = async (jobId, tenantId) => {
  return Review.getRecommendationDistribution(jobId, tenantId);
};

export const getReviewStats = async (tenantId, filters = {}) => {
  const query = { tenantId };

  if (filters.jobId) {
    query.jobId = filters.jobId;
  }

  if (filters.startDate) {
    query.createdAt = { $gte: new Date(filters.startDate) };
  }

  if (filters.endDate) {
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
  }

  const [totalReviews, avgRatingResult, recommendationDist] = await Promise.all([
    Review.countDocuments(query),
    Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgTechnical: { $avg: '$technicalSkills.rating' },
          avgCommunication: { $avg: '$communication.rating' },
          avgCultureFit: { $avg: '$cultureFit.rating' },
          avgProblemSolving: { $avg: '$problemSolving.rating' }
        }
      }
    ]),
    Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$recommendation',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const recommendations = recommendationDist.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalReviews,
    averageRatings: avgRatingResult.length > 0 ? {
      overall: Math.round(avgRatingResult[0].avgRating * 10) / 10,
      technical: avgRatingResult[0].avgTechnical ? Math.round(avgRatingResult[0].avgTechnical * 10) / 10 : 0,
      communication: avgRatingResult[0].avgCommunication ? Math.round(avgRatingResult[0].avgCommunication * 10) / 10 : 0,
      cultureFit: avgRatingResult[0].avgCultureFit ? Math.round(avgRatingResult[0].avgCultureFit * 10) / 10 : 0,
      problemSolving: avgRatingResult[0].avgProblemSolving ? Math.round(avgRatingResult[0].avgProblemSolving * 10) / 10 : 0
    } : {
      overall: 0,
      technical: 0,
      communication: 0,
      cultureFit: 0,
      problemSolving: 0
    },
    recommendations
  };
};
