const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { getUserFavorites, getProjectRatings, getPublishingDetails } = require('./favoriteHelpers');

// Toggle favorite status
router.post('/toggle', async (req, res) => {
  try {
    const { userEmail, projectId, projectType } = req.body;

    // Check if favorite exists
    const existingFavorite = await Favorite.findOne({ userEmail, projectId });

    if (existingFavorite) {
      // Remove from favorites
      await Favorite.deleteOne({ _id: existingFavorite._id });
      res.json({ favorited: false });
    } else {
      // Add to favorites
      const newFavorite = new Favorite({
        userEmail,
        projectId,
        projectType
      });
      await newFavorite.save();
      res.json({ favorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if project is favorited
router.get('/check', async (req, res) => {
  try {
    const { userEmail, projectId } = req.query;
    const favorite = await Favorite.findOne({ userEmail, projectId });
    res.json({ favorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all favorites for a user
router.get('/user', async (req, res) => {
  try {
    const { userEmail } = req.query;
    const favorites = await Favorite.find({ userEmail });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Route to get user's favorite projects with ratings and publishing details
router.get('/favorites/:userEmail', async (req, res) => {
  const { userEmail } = req.params;

  try {
    // Step 1: Get user's favorite projects
    const favorites = await getUserFavorites(userEmail);
    if (!favorites.length) {
      return res.json([]); // Return empty array if no favorites
    }

    // Step 2: Fetch ratings and publishing details for each favorite
    const favoriteDetails = await Promise.all(
      favorites.map(async (favorite) => {
        const rating = await getProjectRatings(userEmail, favorite.projectId);
        const publishing = await getPublishingDetails(favorite.projectId);

        return {
          projectId: favorite.projectId,
          projectType: favorite.projectType,
          title: publishing ? publishing.title : 'Unknown Title',
          summary: publishing ? publishing.summary : 'No summary available',
          genres: publishing ? publishing.genres : [],
          rating: rating !== null ? rating : 'Not rated',
          coverPicture: publishing ? publishing.coverPicture : null,
        };
      })
    );

    res.json(favoriteDetails);
  } catch (error) {
    console.error('Error fetching favorite details:', error);
    res.status(500).json({ message: 'Error fetching favorite details', error });
  }
});


module.exports = router;