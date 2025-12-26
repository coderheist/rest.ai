import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * USER SCHEMA
 * Purpose: Authentication and role-based access control
 * Relations: Belongs to Tenant, creates Jobs, writes Reviews
 * 
 * Multi-tenant architecture: Every user belongs to one tenant
 */
const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  refreshToken: {
    type: String,
    select: false
  },
  
  refreshTokenExpiry: {
    type: Date,
    select: false
  },
  
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'RECRUITER', 'VIEWER'],
      message: '{VALUE} is not a valid role'
    },
    default: 'RECRUITER',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Compound indexes for multi-tenant queries
userSchema.index({ tenantId: 1, email: 1 });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method: Check permissions
userSchema.methods.hasPermission = function(action) {
  const permissions = {
    ADMIN: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_billing'],
    RECRUITER: ['create', 'read', 'update', 'delete'],
    VIEWER: ['read']
  };
  
  return permissions[this.role]?.includes(action) || false;
};

// Static method: Find users by tenant
userSchema.statics.findByTenant = function(tenantId, filters = {}) {
  return this.find({ 
    tenantId, 
    isActive: true,
    ...filters 
  }).select('-passwordHash');
};

// Update lastLogin timestamp
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// Save refresh token
userSchema.methods.saveRefreshToken = async function(token) {
  this.refreshToken = token;
  this.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await this.save({ validateBeforeSave: false });
};

// Clear refresh token
userSchema.methods.clearRefreshToken = async function() {
  this.refreshToken = undefined;
  this.refreshTokenExpiry = undefined;
  await this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

export default User;
