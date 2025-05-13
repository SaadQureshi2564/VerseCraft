const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one rating per user per project
ratingSchema.index({ userEmail: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);