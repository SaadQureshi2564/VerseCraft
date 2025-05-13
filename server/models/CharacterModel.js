// backend/models/CharacterModel.js

const mongoose = require('mongoose');

const TraitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const CharacterSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  fullName: { type: String, required: true },
  age: { type: String },
  gender: { type: String },
  ethnicity: { type: String },
  summary: { type: String },
  backstory: { type: String },
  backgroundImage: { type: String }, // Path to the uploaded image
  physicalTraits: [TraitSchema],
  personalityTraits: [TraitSchema],
  characterArcs: [TraitSchema],
  relationships: [TraitSchema],
  skills: [TraitSchema],
  weaknesses: [TraitSchema],
  roles: [TraitSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Character', CharacterSchema);
