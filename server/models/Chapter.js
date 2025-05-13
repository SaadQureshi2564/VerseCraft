const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: [true, 'Associated story is required'],
  },
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
  },
  number: {
    type: Number,
    required: [true, 'Chapter number is required'],
    min: [1, 'Chapter number must be at least 1'],
  },
  currentVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChapterVersion',
  },
  versions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChapterVersion',
  }],
  content: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

chapterSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

chapterSchema.index({ story: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);