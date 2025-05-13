// models/UrduChapterNote.js
const mongoose = require('mongoose');

const UrduChapterNoteSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UrduProject', // Assuming you have an UrduProject model
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UrduChapter',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('UrduChapterNote', UrduChapterNoteSchema);
