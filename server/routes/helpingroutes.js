// routes/helpingRoutes.js
const express = require('express');
const router = express.Router();

const Novel = require('../models/Novel');
const Story = require('../models/Story');
const Urdu = require('../models/Urdu');

// Route to detect project type by ID
router.get('/detect/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received project ID:', id);  // Debug log

  try {
    const novel = await Novel.findById(id);
    if (novel) return res.json({ type: 'Novel', data: novel });
    const story = await Story.findById(id);
    if (story) return res.json({ type: 'Story', data: story });
    const urdu = await Urdu.findById(id);
    if (urdu) return res.json({ type: 'Urdu', data: urdu });

    return res.status(404).json({ message: 'Project not found' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



module.exports = router;
