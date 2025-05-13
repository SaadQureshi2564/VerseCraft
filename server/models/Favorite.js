const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  projectType: {
    type: String,
    enum: ['Story', 'Novel', 'Urdu'],
    required: true
  },
  favorited: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique combination of userEmail and projectId
favoriteSchema.index({ userEmail: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);