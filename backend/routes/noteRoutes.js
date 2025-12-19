import express from 'express';
import { protect } from '../middleware/auth.js';
import * as noteController from '../controllers/noteController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Search notes
router.get('/search', noteController.searchNotes);

// Recent notes
router.get('/recent', noteController.getRecentNotes);

// User notes
router.get('/user/:userId', noteController.getUserNotes);

// Entity notes
router.get('/:entityType/:entityId', noteController.getNotesForEntity);

// CRUD operations
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNoteById);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

// Pin toggle
router.patch('/:id/pin', noteController.togglePinNote);

export default router;
