const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  promptId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'llm'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
