// models/Urdu.js
const mongoose = require('mongoose');

// Urdu Schema
const urduSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
  },
  author: { 
    name: { 
      type: String, 
      required: [true, 'Author name is required'],
      trim: true,
    },
    email: { 
      type: String, 
      required: [true, 'Author email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    }
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
  },
  genres: {
    type: [String],
    default: [],
  },
  collaborators: [{ 
    email: { 
      type: String, 
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    } 
  }],
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('Urdu', urduSchema);
