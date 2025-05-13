const mongoose = require('mongoose');

const novelNoteSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel', required: true },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'NovelChapter', required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NovelNote', novelNoteSchema);
