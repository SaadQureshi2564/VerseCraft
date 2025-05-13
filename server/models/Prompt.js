const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'llm'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,  // Use ObjectId for simplicity
    required: true,
  },
}, { timestamps: true });

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
