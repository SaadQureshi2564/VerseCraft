// server/routes/noteRoutes.js

const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Chapter = require('../models/Chapter');

// Middleware to check if Chapter exists
const checkChapterExists = async (req, res, next) => {
    try {
        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        req.chapter = chapter;
        next();
    } catch (err) {
        console.error('Error checking chapter existence:', err);
        return res.status(500).json({ message: 'Server error while checking chapter' });
    }
};

// -----------------------
// Note Routes
// -----------------------

// Create a new Note under a Chapter
router.post('/stories/:storyId/chapters/:chapterId/notes', checkChapterExists, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Note content is required.' });
        }

        const newNote = new Note({
            chapter: req.params.chapterId,
            content: content.trim(),
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        console.error('Error creating note:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get all Notes for a Chapter
router.get('/stories/:storyId/chapters/:chapterId/notes', checkChapterExists, async (req, res) => {
    try {
        const notes = await Note.find({ chapter: req.params.chapterId }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ message: err.message });
    }
});

// Delete a Note
router.delete('/notes/:noteId', async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.noteId);
        if (!note) return res.status(404).json({ message: 'Note not found.' });

        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ message: err.message });
    }
});

// Optional: Update a Note
router.put('/notes/:noteId', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Note content is required.' });
        }

        const note = await Note.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        note.content = content.trim();
        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
