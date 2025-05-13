const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');

// Submit or update rating
router.post('/submit', async (req, res) => {
  try {
    const { userEmail, projectId, projectType, rating } = req.body;

    // Upsert the rating
    const existingRating = await Rating.findOneAndUpdate(
      { userEmail, projectId },
      { rating, projectType },
      { new: true, upsert: true }
    );

    // Calculate new average rating
    const aggregate = await Rating.aggregate([
      { $match: { projectId } },
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);

    res.json({
      success: true,
      averageRating: aggregate[0]?.average || 0,
      userRating: existingRating.rating
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get average rating for a project
router.get('/average', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const aggregate = await Rating.aggregate([
      { $match: { projectId } },
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);

    res.json({
      averageRating: aggregate[0]?.average || 0,
      totalRatings: await Rating.countDocuments({ projectId })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's rating for a project
router.get('/user', async (req, res) => {
  try {
    const { userEmail, projectId } = req.query;
    const rating = await Rating.findOne({ userEmail, projectId });
    res.json({ userRating: rating?.rating || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;