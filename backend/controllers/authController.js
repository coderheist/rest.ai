import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { generateToken } from '../utils/jwt.js';

/**
 * @desc    Register new user and create tenant
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { tenantName, name, email, password } = req.body;

    // Validate input
    if (!tenantName || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
        statusCode: 400
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
        statusCode: 400
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: tenantName,
      plan: 'FREE',
      contactEmail: email
    });

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      tenantId: tenant._id,
      name,
      email,
      passwordHash: password,
      role: 'ADMIN' // First user is admin
    });

    // Generate token
    const token = generateToken({
      userId: user._id,
      tenantId: tenant._id,
      role: user.role
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: tenant._id
        },
        tenant: {
          _id: tenant._id,
          name: tenant.name,
          plan: tenant.plan
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
        statusCode: 400
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+passwordHash').populate('tenantId');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        statusCode: 401
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken({
      userId: user._id,
      tenantId: user.tenantId._id,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId._id
        },
        tenant: {
          _id: user.tenantId._id,
          name: user.tenantId.name,
          plan: user.tenantId.plan
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('tenantId');

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId._id,
          lastLogin: user.lastLogin
        },
        tenant: {
          _id: user.tenantId._id,
          name: user.tenantId.name,
          plan: user.tenantId.plan,
          resumeLimit: user.tenantId.resumeLimit,
          jdLimit: user.tenantId.jdLimit,
          aiUsageLimit: user.tenantId.aiUsageLimit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
