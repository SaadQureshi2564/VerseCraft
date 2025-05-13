// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  promptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
  role: { type: String, required: true }, // 'user' or 'llm'
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);