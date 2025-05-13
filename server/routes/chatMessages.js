const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

// Save a new message for the prompt
router.post('/create', async (req, res) => {
  const { promptId, role, content } = req.body;

  try {
    const newMessage = new ChatMessage({
      promptId,
      role,
      content,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Fetch messages by promptId

// Fetch messages by promptId (integer)
// Fetch messages by promptId (String)
router.get('/:promptId', async (req, res) => {
    const { promptId } = req.params;
    
    console.log('Fetching messages for promptId:', promptId); // Debugging log
  
    try {
      const messages = await ChatMessage.find({ promptId: promptId }); // Query as string
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  


  
module.exports = router;
