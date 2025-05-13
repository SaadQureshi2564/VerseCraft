const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const ChapterVersion = require('../models/ChapterVersion');
const Story = require('../models/Story');

// Middleware to check if Story exists
const checkStoryExists = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        req.story = story;
        next();
    } catch (err) {
        console.error('Error checking story existence:', err);
        return res.status(500).json({ message: 'Server error while checking story' });
    }
};

// Create a new Chapter under a Story
router.post('/stories/:storyId/chapters', checkStoryExists, async (req, res) => {
    try {
        const { title, number, content, language } = req.body;

        if (!title || !number) {
            return res.status(400).json({ message: 'Title and number are required.' });
        }

        const existingChapter = await Chapter.findOne({ story: req.params.storyId, number });
        if (existingChapter) {
            return res.status(400).json({ message: 'Chapter number already exists in this story.' });
        }

        const newChapter = new Chapter({
            story: req.params.storyId,
            title,
            number,
            content: content || '',
            language: language || 'en',
        });

        const savedChapter = await newChapter.save();
        res.status(201).json(savedChapter);
    } catch (err) {
        console.error('Error creating chapter:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get all Chapters for a Story
router.get('/stories/:storyId/chapters', checkStoryExists, async (req, res) => {
    try {
        const chapters = await Chapter.find({ story: req.params.storyId }).sort({ number: 1 });
        res.status(200).json(chapters);
    } catch (err) {
        console.error('Error fetching chapters:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get a Chapter by ID
router.get('/chapters/:chapterId', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.chapterId).populate('story');
        if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });
        res.status(200).json(chapter);
    } catch (err) {
        console.error('Error fetching chapter by ID:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update a Chapter
router.put('/chapters/:chapterId', async (req, res) => {
    try {
        const { title, number, content, language } = req.body;

        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found.' });
        }

        if (number && number !== chapter.number) {
            const duplicateChapter = await Chapter.findOne({ story: chapter.story, number });
            if (duplicateChapter) {
                return res.status(400).json({ message: 'Another chapter with this number already exists.' });
            }
        }

        chapter.title = title ?? chapter.title;
        chapter.number = number ?? chapter.number;
        chapter.content = content ?? chapter.content;
        chapter.language = language ?? chapter.language;
        chapter.updatedAt = Date.now();

        const updatedChapter = await chapter.save();
        res.status(200).json(updatedChapter);
    } catch (err) {
        console.error('Error updating chapter:', err);
        res.status(400).json({ message: err.message });
    }
});

// Delete a Chapter
router.delete('/chapters/:chapterId', async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndDelete(req.params.chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });

        res.status(200).json({ message: 'Chapter deleted successfully.' });
    } catch (err) {
        console.error('Error deleting chapter:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create a new version of a chapter
router.post('/chapters/:chapterId/versions', async (req, res) => {
    try {
        const { content, language, summary, createdBy } = req.body;

        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found.' });
        }

        const newVersion = new ChapterVersion({
            chapter: chapter._id,
            content,
            language,
            summary,
            createdBy,
        });

        const savedVersion = await newVersion.save();

        chapter.versions.push(savedVersion._id);
        chapter.currentVersion = savedVersion._id;
        await chapter.save();

        res.status(201).json(savedVersion);
    } catch (err) {
        console.error('Error creating chapter version:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get all versions of a chapter
router.get('/chapters/:chapterId/versions', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.chapterId).populate('versions');
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found.' });
        }

        res.status(200).json(chapter.versions);
    } catch (err) {
        console.error('Error fetching chapter versions:', err);
        res.status(500).json({ message: err.message });
    }
});

// Revert to a specific version of a chapter
router.post('/chapters/:chapterId/revert/:versionId', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found.' });
        }

        const version = await ChapterVersion.findById(req.params.versionId);
        if (!version) {
            return res.status(404).json({ message: 'Version not found.' });
        }

        // Update chapter content and language from the version
        chapter.content = version.content;
        chapter.language = version.language;
        chapter.currentVersion = version._id;
        await chapter.save();

        res.status(200).json({ 
            message: 'Chapter reverted successfully.',
            content: version.content,
            language: version.language
        });
    } catch (err) {
        console.error('Error reverting chapter:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;