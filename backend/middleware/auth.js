import User from '../models/User.js';
import { verifyToken, extractToken } from '../utils/jwt.js';

/**
 * Protect Middleware
 * Validates JWT and injects user & tenant context into request
 */
export const protect = async (req, res, next) => {
  try {
    // Extract token from header
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. No token provided.',
        statusCode: 401
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId)
      .select('-passwordHash')
      .populate('tenantId');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
        statusCode: 401
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        statusCode: 401
      });
    }

    // Inject user and tenant into request
    req.user = user;
    req.tenantId = user.tenantId._id;
    req.tenant = user.tenantId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Invalid token.',
      statusCode: 401
    });
  }
};

/**
 * Authorize Middleware
 * Checks if user has required role
 * @param {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource`,
        statusCode: 403
      });
    }
    next();
  };
};
