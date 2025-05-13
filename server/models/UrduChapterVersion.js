// models/UrduChapterVersion.js

const mongoose = require('mongoose');

const urduChapterVersionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UrduProject',
    required: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UrduChapter',
    required: true,
  },
  createrName: {
    type: String,
    required: true,
  },
  versionId: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  versionName: {
    type: String,
    required: true,
  }, // Optional: Name for the version (e.g., "Draft 1", "Final")
  summary: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model('UrduChapterVersion', urduChapterVersionSchema);