/**
 * Tenant Validation Middleware
 * Ensures resources belong to the requesting tenant
 */
import asyncHandler from 'express-async-handler';

/**
 * Validate that a document belongs to the requesting tenant
 * @param {Model} Model - Mongoose model to check
 * @param {string} paramName - Request parameter name (default: 'id')
 * @returns {Function} Express middleware
 */
export const validateTenantOwnership = (Model, paramName = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params[paramName]);
    
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `${Model.modelName} not found`
      });
    }
    
    if (doc.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to access this resource.'
      });
    }
    
    req.document = doc; // Attach document to request for controllers to use
    next();
  });
};
