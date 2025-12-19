import Note from '../models/Note.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Match from '../models/Match.js';

export const createNote = async (tenantId, userId, data) => {
  const { relatedTo, content, type, tags, isPinned, isPrivate } = data;

  // Verify the related entity exists and belongs to this tenant
  let model;
  switch (relatedTo.type) {
    case 'job':
      model = Job;
      break;
    case 'resume':
      model = Resume;
      break;
    case 'match':
      model = Match;
      break;
    default:
      throw new Error('Invalid relatedTo type');
  }

  const entity = await model.findOne({ _id: relatedTo.id, tenantId });
  if (!entity) {
    throw new Error(`${relatedTo.type} not found or access denied`);
  }

  // Gather metadata based on entity type
  const metadata = {};
  if (relatedTo.type === 'job') {
    metadata.jobTitle = entity.title;
  } else if (relatedTo.type === 'resume') {
    metadata.candidateName = entity.candidateInfo?.name;
  } else if (relatedTo.type === 'match') {
    const [job, resume] = await Promise.all([
      Job.findById(entity.jobId).select('title'),
      Resume.findById(entity.resumeId).select('candidateInfo.name')
    ]);
    metadata.jobTitle = job?.title;
    metadata.candidateName = resume?.candidateInfo?.name;
  }

  const note = new Note({
    tenantId,
    userId,
    relatedTo: {
      type: relatedTo.type,
      id: relatedTo.id,
      model: relatedTo.type.charAt(0).toUpperCase() + relatedTo.type.slice(1)
    },
    content,
    type: type || 'general',
    tags: tags || [],
    isPinned: isPinned || false,
    isPrivate: isPrivate || false,
    metadata
  });

  await note.save();
  await note.populate('userId', 'name email');
  return note;
};

export const getNoteById = async (noteId, tenantId) => {
  const note = await Note.findOne({ _id: noteId, tenantId })
    .populate('userId', 'name email');
  
  if (!note) {
    throw new Error('Note not found');
  }
  
  return note;
};

export const getNotesForEntity = async (tenantId, entityType, entityId) => {
  return Note.getNotesForEntity(tenantId, entityType, entityId);
};

export const getRecentNotes = async (tenantId, limit = 10) => {
  return Note.getRecentNotes(tenantId, limit);
};

export const getUserNotes = async (tenantId, userId, limit = 50) => {
  return Note.getUserNotes(tenantId, userId, limit);
};

export const updateNote = async (noteId, tenantId, userId, data) => {
  const note = await Note.findOne({ _id: noteId, tenantId });
  
  if (!note) {
    throw new Error('Note not found');
  }

  // Only the note creator can update it (or admin - to be implemented)
  if (note.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to update this note');
  }

  const { content, type, tags, isPinned, isPrivate } = data;
  
  if (content !== undefined) note.content = content;
  if (type !== undefined) note.type = type;
  if (tags !== undefined) note.tags = tags;
  if (isPinned !== undefined) note.isPinned = isPinned;
  if (isPrivate !== undefined) note.isPrivate = isPrivate;

  await note.save();
  await note.populate('userId', 'name email');
  return note;
};

export const togglePinNote = async (noteId, tenantId, userId) => {
  const note = await Note.findOne({ _id: noteId, tenantId });
  
  if (!note) {
    throw new Error('Note not found');
  }

  if (note.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to pin this note');
  }

  return note.togglePin();
};

export const deleteNote = async (noteId, tenantId, userId) => {
  const note = await Note.findOne({ _id: noteId, tenantId });
  
  if (!note) {
    throw new Error('Note not found');
  }

  // Only the note creator can delete it (or admin)
  if (note.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to delete this note');
  }

  await Note.deleteOne({ _id: noteId });
  return { message: 'Note deleted successfully' };
};

export const searchNotes = async (tenantId, query, filters = {}) => {
  const searchQuery = { tenantId };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (filters.type) {
    searchQuery.type = filters.type;
  }

  if (filters.isPinned !== undefined) {
    searchQuery.isPinned = filters.isPinned;
  }

  if (filters.userId) {
    searchQuery.userId = filters.userId;
  }

  if (filters.relatedType) {
    searchQuery['relatedTo.type'] = filters.relatedType;
  }

  return Note.find(searchQuery)
    .populate('userId', 'name email')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(filters.limit || 50);
};
