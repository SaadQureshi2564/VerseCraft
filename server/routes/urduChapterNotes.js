// routes/urduChapterNotes.js
const express = require('express');
const router = express.Router();
const UrduChapterNote = require('../models/UrduChapterNote');

// @route   POST /api/chapter-notes
// @desc    Create a new note for a chapter
router.post('/', async (req, res) => {
  const { projectId, chapterId, content } = req.body;

  try {
    const newNote = new UrduChapterNote({
      projectId,
      chapterId,
      content,
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/chapter-notes/:projectId/:chapterId
// @desc    Get all notes for a specific chapter
router.get('/:projectId/:chapterId', async (req, res) => {
  try {
    const notes = await UrduChapterNote.find({
      projectId: req.params.projectId,
      chapterId: req.params.chapterId,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/chapter-notes/:noteId
// @desc    Delete a note
router.delete('/:noteId', async (req, res) => {
  try {
    const note = await UrduChapterNote.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    await note.remove();

    res.json({ msg: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
