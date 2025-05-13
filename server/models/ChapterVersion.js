const mongoose = require('mongoose');

const chapterVersionSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: [true, 'Associated chapter is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  language: {
    type: String,
    enum: ['en', 'ur'],
    default: 'en',
  },
  summary: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who created this version is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChapterVersion', chapterVersionSchema);