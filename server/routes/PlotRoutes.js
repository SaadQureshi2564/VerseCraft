// routes/plots.js

const express = require('express');
const router = express.Router();
const Plot = require('../models/Plot');
const Chapter = require('../models/Chapter'); // Ensure Chapter model is imported

// Middleware for authentication (if applicable)
// You can use something like passport.js or custom middleware
// For example:
// const authenticate = require('../middleware/authenticate');
// router.use(authenticate);

// GET /api/chapters/:chapterId/plots - Fetch all plots for a chapter
router.get('/api/chapters/:chapterId/plots', async (req, res) => {
    try {
        const { chapterId } = req.params;
        
        // // Verify if the chapter exists
        // const chapter = await Chapter.findById(chapterId);
        // if (!chapter) {
        //     return res.status(404).json({ message: 'Chapter not found.' });
        // }

        const plots = await Plot.find({ chapter: chapterId });
        res.json(plots);
    } catch (error) {
        console.error("Error fetching plots:", error);
        res.status(500).json({ message: 'Server error fetching plots.' });
    }
});

// POST /api/chapters/:chapterId/plots - Create a new plot for a chapter
router.post('/api/chapters/:chapterId/plots', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { name, sections } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Plot name is required and cannot be empty.' });
        }

        // Verify if the chapter exists
        // const chapter = await Chapter.findById(chapterId);
        // if (!chapter) {
        //     return res.status(404).json({ message: 'Chapter not found.' });
        // }

        // Validate sections if provided
        let validatedSections = [];
        if (sections && Array.isArray(sections)) {
            validatedSections = sections.map(section => ({
                name: section.name ? section.name.trim() : 'Untitled Section',
                summary: section.summary ? section.summary.trim() : '',
                characters: Array.isArray(section.characters) ? section.characters : [],
            }));
        }

        const newPlot = new Plot({
            chapter: chapterId, // Assign chapter correctly
            name: name.trim(),
            sections: validatedSections,
        });

        await newPlot.save();
        res.status(201).json(newPlot);
    } catch (error) {
        console.error("Error creating plot:", error);
        res.status(500).json({ message: 'Server error creating plot.' });
    }
});

// PUT /api/chapters/:chapterId/plots/:plotId - Update a specific plot
router.put('/api/chapters/:chapterId/plots/:plotId', async (req, res) => {
    try {
        const { chapterId, plotId } = req.params;
        const { name, sections } = req.body;

        // Find the plot and ensure it belongs to the specified chapter
        const plot = await Plot.findOne({ _id: plotId, chapter: chapterId });
        if (!plot) {
            return res.status(404).json({ message: 'Plot not found for this chapter.' });
        }

        // Update fields if provided
        if (name !== undefined) {
            if (name.trim() === '') {
                return res.status(400).json({ message: 'Plot name cannot be empty.' });
            }
            plot.name = name.trim();
        }
        if (sections !== undefined) {
            if (!Array.isArray(sections)) {
                return res.status(400).json({ message: 'Sections must be an array.' });
            }
            // Validate sections
            plot.sections = sections.map(section => ({
                name: section.name ? section.name.trim() : 'Untitled Section',
                summary: section.summary ? section.summary.trim() : '',
                characters: Array.isArray(section.characters) ? section.characters : [],
            }));
        }

        await plot.save();
        res.json(plot);
    } catch (error) {
        console.error("Error updating plot:", error);
        res.status(500).json({ message: 'Server error updating plot.' });
    }
});

// DELETE /api/chapters/:chapterId/plots/:plotId - Delete a specific plot
router.delete('/api/chapters/:chapterId/plots/:plotId', async (req, res) => {
    try {
        const { chapterId, plotId } = req.params;

        // Find the plot and ensure it belongs to the specified chapter
        const plot = await Plot.findOne({ _id: plotId, chapter: chapterId });
        if (!plot) {
            return res.status(404).json({ message: 'Plot not found for this chapter.' });
        }

        await plot.remove();
        res.json({ message: 'Plot removed successfully.' });
    } catch (error) {
        console.error("Error deleting plot:", error);
        res.status(500).json({ message: 'Server error deleting plot.' });
    }
});

module.exports = router;
