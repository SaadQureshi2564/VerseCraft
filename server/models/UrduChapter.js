// models/UrduChapter.js
const mongoose = require('mongoose');

const UrduChapterSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UrduProject', // Assuming you have an UrduProject model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UrduChapter', UrduChapterSchema);
