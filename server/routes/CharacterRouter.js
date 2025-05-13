// backend/routes/CharacterRouter.js

const express = require('express');
const router = express.Router();
const Character = require('../models/CharacterModel');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new character
router.post('/', upload.single('backgroundImage'), async (req, res) => {
  try {
    const {
      projectId,
      fullName,
      age,
      gender,
      ethnicity,
      summary,
      backstory,
      physicalTraits,
      personalityTraits,
      characterArcs,
      relationships,
      skills,
      weaknesses,
      roles,
    } = req.body;

    // Parse JSON strings for traits
    const parsedPhysicalTraits = physicalTraits ? JSON.parse(physicalTraits) : [];
    const parsedPersonalityTraits = personalityTraits ? JSON.parse(personalityTraits) : [];
    const parsedCharacterArcs = characterArcs ? JSON.parse(characterArcs) : [];
    const parsedRelationships = relationships ? JSON.parse(relationships) : [];
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedWeaknesses = weaknesses ? JSON.parse(weaknesses) : [];
    const parsedRoles = roles ? JSON.parse(roles) : [];

    const newCharacter = new Character({
      projectId,
      fullName,
      age,
      gender,
      ethnicity,
      summary,
      backstory,
      physicalTraits: parsedPhysicalTraits,
      personalityTraits: parsedPersonalityTraits,
      characterArcs: parsedCharacterArcs,
      relationships: parsedRelationships,
      skills: parsedSkills,
      weaknesses: parsedWeaknesses,
      roles: parsedRoles,
      backgroundImage: req.file ? req.file.path : null,
    });

    const savedCharacter = await newCharacter.save();
    res.status(201).json(savedCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all characters for a specific project
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }
    const characters = await Character.find({ projectId });
    res.status(200).json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Get a single character by ID
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.status(200).json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a character by ID
router.put('/:id', upload.single('backgroundImage'), async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      ethnicity,
      summary,
      backstory,
      physicalTraits,
      personalityTraits,
      characterArcs,
      relationships,
      skills,
      weaknesses,
      roles,
    } = req.body;

    // Parse JSON strings for traits
    const parsedPhysicalTraits = physicalTraits ? JSON.parse(physicalTraits) : [];
    const parsedPersonalityTraits = personalityTraits ? JSON.parse(personalityTraits) : [];
    const parsedCharacterArcs = characterArcs ? JSON.parse(characterArcs) : [];
    const parsedRelationships = relationships ? JSON.parse(relationships) : [];
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedWeaknesses = weaknesses ? JSON.parse(weaknesses) : [];
    const parsedRoles = roles ? JSON.parse(roles) : [];

    const updatedData = {
      fullName,
      age,
      gender,
      ethnicity,
      summary,
      backstory,
      physicalTraits: parsedPhysicalTraits,
      personalityTraits: parsedPersonalityTraits,
      characterArcs: parsedCharacterArcs,
      relationships: parsedRelationships,
      skills: parsedSkills,
      weaknesses: parsedWeaknesses,
      roles: parsedRoles,
    };

    if (req.file) {
      updatedData.backgroundImage = req.file.path;
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedCharacter) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a character by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCharacter = await Character.findByIdAndDelete(req.params.id);
    if (!deletedCharacter) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.status(200).json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
