import asyncHandler from 'express-async-handler';
import * as noteService from '../services/noteService.js';

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(
    req.user.tenantId,
    req.user._id,
    req.body
  );
  res.status(201).json(note);
});

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.params.id, req.user.tenantId);
  res.json(note);
});

// @desc    Get notes for an entity
// @route   GET /api/notes/:entityType/:entityId
// @access  Private
export const getNotesForEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const notes = await noteService.getNotesForEntity(
    req.user.tenantId,
    entityType,
    entityId
  );
  res.json(notes);
});

// @desc    Get recent notes
// @route   GET /api/notes/recent
// @access  Private
export const getRecentNotes = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const notes = await noteService.getRecentNotes(req.user.tenantId, limit);
  res.json(notes);
});

// @desc    Get user's notes
// @route   GET /api/notes/user/:userId
// @access  Private
export const getUserNotes = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const notes = await noteService.getUserNotes(
    req.user.tenantId,
    req.params.userId,
    limit
  );
  res.json(notes);
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(
    req.params.id,
    req.user.tenantId,
    req.user._id,
    req.body
  );
  res.json(note);
});

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
export const togglePinNote = asyncHandler(async (req, res) => {
  const note = await noteService.togglePinNote(
    req.params.id,
    req.user.tenantId,
    req.user._id
  );
  res.json(note);
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = asyncHandler(async (req, res) => {
  const result = await noteService.deleteNote(
    req.params.id,
    req.user.tenantId,
    req.user._id
  );
  res.json(result);
});

// @desc    Search notes
// @route   GET /api/notes/search
// @access  Private
export const searchNotes = asyncHandler(async (req, res) => {
  const { q, type, isPinned, userId, relatedType, limit } = req.query;
  
  const filters = {};
  if (type) filters.type = type;
  if (isPinned !== undefined) filters.isPinned = isPinned === 'true';
  if (userId) filters.userId = userId;
  if (relatedType) filters.relatedType = relatedType;
  if (limit) filters.limit = parseInt(limit);

  const notes = await noteService.searchNotes(req.user.tenantId, q, filters);
  res.json(notes);
});
