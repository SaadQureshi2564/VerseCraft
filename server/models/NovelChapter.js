//models/NovelChapter.js

const mongoose = require('mongoose');

const novelChapterSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel', required: true },
  title: { type: String, required: true, trim: true },
  number: { type: Number, required: true },
  content: { type: String, default: '' },
  summary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` before saving
novelChapterSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NovelChapter', novelChapterSchema);