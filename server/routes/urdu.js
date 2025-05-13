const express = require('express');
const router = express.Router();
const Urdu = require('../models/Urdu');

// Create a new Urdu project
router.post('/', async (req, res) => {
  try {
    const urdu = new Urdu(req.body);
    await urdu.save();
    res.status(201).json(urdu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Urdu projects
router.get('/', async (req, res) => {
  try {
    const urdus = await Urdu.find();
    res.json(urdus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Urdu projects for a specific user by author email
router.get('/user/:email', async (req, res) => {
  try {
    const urdus = await Urdu.find({ 'author.email': req.params.email });
    res.json(urdus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Urdu projects where a specific email is a collaborator
router.get('/collaborator/:email', async (req, res) => {
  try {
    const urdus = await Urdu.find({ 'collaborators.email': req.params.email });
    res.json(urdus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single Urdu project by ID
router.get('/:id', async (req, res) => {
  try {
    const urdu = await Urdu.findById(req.params.id);
    if (!urdu) return res.status(404).json({ error: 'Project not found' });
    res.json(urdu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an Urdu project by ID
router.put('/:id', async (req, res) => {
  try {
    const urdu = await Urdu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!urdu) return res.status(404).json({ error: 'Project not found' });
    res.json(urdu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an Urdu project by ID
router.delete('/:id', async (req, res) => {
  try {
    const urdu = await Urdu.findByIdAndDelete(req.params.id);
    if (!urdu) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});







module.exports = router;
