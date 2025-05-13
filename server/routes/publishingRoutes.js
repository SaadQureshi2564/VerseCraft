const express = require('express');
const router = express.Router();
const Publishing = require('../models/publishing');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        // Rename the file to include the date for uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Create or Update Publishing Info
// Ensure that the file is processed and stored correctly in the backend
router.post('/create/:projectId', upload.single('coverPicture'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { projectType, title, shortTitle, summary, genres, publishingType, audience } = req.body;
    const coverPicture = req.file ? req.file.filename : null;

    let publishing = await Publishing.findOne({ projectId });

    if (publishing) {
      // Update the existing publishing
      publishing.title = title;
      publishing.shortTitle = shortTitle;
      publishing.summary = summary;
      publishing.genres = genres.split(',');
      publishing.publishingType = publishingType || 'Public';
      publishing.audience = audience;
      if (coverPicture) publishing.coverPicture = coverPicture; // Update cover picture
      await publishing.save();
    } else {
      // Create new publishing
      publishing = new Publishing({
        projectId,
        projectType,
        title,
        shortTitle,
        summary,
        genres: genres.split(','),
        publishingType: publishingType || 'Public',
        audience,
        coverPicture,
      });
      await publishing.save();
    }

    res.json({ success: true, message: 'Publishing information saved successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to save publishing information' });
  }
});


router.get('/returnall', async (req, res) => {
  try {
    const publishings = await Publishing.find(); // No filters, just fetch all records.

    if (!publishings.length) {
      return res.status(404).json({ success: false, message: 'No publishing data found' });
    }

    res.status(200).json({ success: true, data: publishings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch publishing data' });
  }
});

// Get Publishing Info by Project ID
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const publishing = await Publishing.findOne({ projectId });

    if (!publishing) {
      return res.status(404).json({ success: false, message: 'Publishing data not found' });
    }

    res.json(publishing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch publishing data' });
  }
});

// Delete Publishing Info by Project ID
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const publishing = await Publishing.findOneAndDelete({ projectId });

    if (!publishing) {
      return res.status(404).json({ success: false, message: 'Publishing data not found' });
    }

    res.json({ success: true, message: 'Publishing data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete publishing data' });
  }
});

// Get Publishing Info by Project ID
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const publishing = await Publishing.findOne({ projectId });

    if (!publishing) {
      return res.status(404).json({ success: false, message: 'Publishing data not found' });
    }

    res.json(publishing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch publishing data' });
  }
});



// Get all published projects
// Get all published projects without needing a projectId
// Route to fetch all publishings



// Handle fetching publishing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const publishing = await Publishing.findById(id);

    if (!publishing) {
      return res.status(404).json({ success: false, message: 'Publishing not found' });
    }

    res.status(200).json({ success: true, data: publishing });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch publishing data' });
  }
});



module.exports = router;
