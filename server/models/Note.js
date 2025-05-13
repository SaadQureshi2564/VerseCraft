// server/models/Note.js

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: [true, 'Associated chapter is required'],
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
  },
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
});

// Optional: Add indexes for performance (if necessary)
noteSchema.index({ chapter: 1 });

module.exports = mongoose.model('Note', noteSchema);
