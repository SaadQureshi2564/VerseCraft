const Favorite = require('../models/Favorite');
const Rating = require('../models/Rating');
const Publishing = require('../models/publishing');

// Get favorite projects for a user by email
const getUserFavorites = async (userEmail) => {
  try {
    const favorites = await Favorite.find({ userEmail });
    return favorites;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

// Get ratings for a specific project and user
const getProjectRatings = async (userEmail, projectId) => {
  try {
    const ratings = await Rating.find({ userEmail, projectId });
    return ratings.length > 0 ? ratings[0].rating : null; // Return the rating value or null if none exists
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};

// Get publishing details for a project
const getPublishingDetails = async (projectId) => {
  try {
    const publishing = await Publishing.findOne({ projectId });
    return publishing;
  } catch (error) {
    console.error('Error fetching publishing details:', error);
    throw error;
  }
};

module.exports = {
  getUserFavorites,
  getProjectRatings,
  getPublishingDetails,
};