// server/models/TextFile.js

const mongoose = require('mongoose');

const textFileSchema = new mongoose.Schema({
  filename: { 
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
});

const TextFile = mongoose.model('TextFile', textFileSchema);
module.exports = TextFile;
