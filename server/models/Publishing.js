const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Publishing Schema
const publishingSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  projectType: { type: String, required: true },
  title: { type: String, required: true },
  shortTitle: { type: String  },
  summary: { type: String   },
  genres: { type: [String] },
  publishingType: { type: String, default: 'Public' },
  audience: { type: String },
  coverPicture: { type: String }, // Path to cover image in uploads folder
});

module.exports = mongoose.model('Publishing', publishingSchema);
