const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  commentType: {
    type: String,
    enum: ['positive', 'negative', 'neutral','Undecided'],
    default: 'Undecided'
  },
  isAuthor: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);