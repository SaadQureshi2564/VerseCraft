const express = require('express');
const router = express.Router();

// Importing all models
const Story = require('../models/Story');
const Novel = require('../models/Novel');
const Urdu = require('../models/Urdu');
const Chapter = require('../models/Chapter');
const NovelChapter = require('../models/NovelChapter');
const UrduChapter = require('../models/UrduChapter');

// Route to fetch chapters for a given projectId (Story, Novel, or Urdu)
router.get('/:projectId/chapters', async (req, res) => {
    const projectId = req.params.projectId;

    try {
        // Try to find the project type: Story
        let project = await Story.findById(projectId);
        if (project) {
            // If it's a Story, fetch chapters associated with the projectId
            const chapters = await Chapter.find({ story: projectId }).sort({ number: 1 });
            return res.status(200).json(chapters);
        }

        // Try to find the project type: Novel
        project = await Novel.findById(projectId);
        if (project) {
            // If it's a Novel, fetch chapters associated with the projectId
            const chapters = await NovelChapter.find({ projectId: projectId }).sort({ number: 1 });
            return res.status(200).json(chapters);
        }

        // Try to find the project type: Urdu
        project = await Urdu.findById(projectId);
        if (project) {
            // If it's an Urdu project, fetch chapters associated with the projectId
            const chapters = await UrduChapter.find({ projectId: projectId }).sort({ number: 1 });
            return res.status(200).json(chapters);
        }

        // If no project was found, return a 404 error
        return res.status(404).json({ message: 'Project not found.' });

    } catch (err) {
        console.error('Error fetching chapters:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
