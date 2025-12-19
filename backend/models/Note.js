import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['job', 'resume', 'match'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'relatedTo.model'
    },
    model: {
      type: String,
      enum: ['Job', 'Resume', 'Match'],
      required: true
    }
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['general', 'interview', 'screening', 'feedback', 'follow-up'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  metadata: {
    candidateName: String,
    jobTitle: String,
    stage: String
  }
}, {
  timestamps: true
});

// Indexes
noteSchema.index({ tenantId: 1, 'relatedTo.type': 1, 'relatedTo.id': 1 });
noteSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
noteSchema.index({ tenantId: 1, isPinned: 1, createdAt: -1 });

// Static methods
noteSchema.statics.getNotesForEntity = function(tenantId, entityType, entityId) {
  return this.find({
    tenantId,
    'relatedTo.type': entityType,
    'relatedTo.id': entityId
  })
  .populate('userId', 'name email')
  .sort({ isPinned: -1, createdAt: -1 });
};

noteSchema.statics.getRecentNotes = function(tenantId, limit = 10) {
  return this.find({ tenantId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

noteSchema.statics.getUserNotes = function(tenantId, userId, limit = 50) {
  return this.find({ tenantId, userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance methods
noteSchema.methods.togglePin = function() {
  this.isPinned = !this.isPinned;
  return this.save();
};

const Note = mongoose.model('Note', noteSchema);

export default Note;
