const express = require('express');
const router = express.Router();
const NovelChapter = require('../models/NovelChapter');
const NovelNote = require('../models/NovelNote');

// Add a new chapter
router.post('/novels/:novelId/chapters', async (req, res) => {
  const novelId = req.params.novelId;
  const { title } = req.body;

  try {
    // Get the next chapter number
    const chapterCount = await NovelChapter.countDocuments({ projectId: novelId });
    const newChapter = new NovelChapter({
      projectId: novelId,
      title,
      number: chapterCount + 1,
    });

    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all chapters of a novel
router.get('/novels/:novelId/chapters', async (req, res) => {
  const novelId = req.params.novelId;

  try {
    const chapters = await NovelChapter.find({ projectId: novelId }).sort('number');
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific chapter
router.get('/novels/:novelId/chapters/:chapterId', async (req, res) => {
  const { novelId, chapterId } = req.params;

  try {
    const chapter = await NovelChapter.findOne({ _id: chapterId, projectId: novelId });
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a chapter
router.put('/novels/:novelId/chapters/:chapterId', async (req, res) => {
  const { novelId, chapterId } = req.params;
  const { title, content, summary } = req.body;

  try {
    const chapter = await NovelChapter.findOneAndUpdate(
      { _id: chapterId, projectId: novelId },
      { title, content, summary, updatedAt: Date.now() },
      { new: true }
    );

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a note to a chapter
router.post('/novels/:novelId/chapters/:chapterId/notes', async (req, res) => {
  const { novelId, chapterId } = req.params;
  const { content } = req.body;

  try {
    const newNote = new NovelNote({
      projectId: novelId,
      chapterId,
      content,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notes of a chapter
router.get('/novels/:novelId/chapters/:chapterId/notes', async (req, res) => {
  const { novelId, chapterId } = req.params;

  try {
    const notes = await NovelNote.find({ projectId: novelId, chapterId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
router.delete('/novels/:novelId/chapters/:chapterId/notes/:noteId', async (req, res) => {
  const { novelId, chapterId, noteId } = req.params;

  try {
    const note = await NovelNote.findOneAndDelete({
      _id: noteId,
      projectId: novelId,
      chapterId,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
