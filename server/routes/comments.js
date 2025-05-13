const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Story = require('../models/Story');
const Novel = require('../models/Novel');
const Urdu = require('../models/Urdu');

// Post a new comment
router.post('/', async (req, res) => {
  try {
    const { userEmail, projectId, comment, isAuthor, commentType } = req.body;
    // Check if user is the project author

    const newComment = new Comment({
      userEmail,
      projectId,
      comment,
      commentType,
      isAuthor
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comments for a project
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    const comments = await Comment.find({ projectId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all comments
router.get('/all', async (req, res) => {
  try {
    const comments = await Comment.find({}).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sentiments of comments with type 'Undecided'
router.put('/update-sentiments', async (req, res) => {
  try {
    const undecidedComments = await Comment.find({ commentType: 'Undecided' });

    const updatedComments = await Promise.all(
      undecidedComments.map(async (comment) => {
        try {
          // Call the Flask API to analyze sentiment
          const response = await axios.post('http://127.0.0.1:5000/analyze_sentiment', {
            comment: comment.comment,
          });

          // Update the comment's sentiment
          comment.commentType = response.data.sentiment;
          await comment.save();
          return comment;
        } catch (error) {
          console.error('Error analyzing sentiment:', error);
          return comment; // If sentiment analysis fails, return the original comment
        }
      })
    );

    res.json({ message: 'Sentiments updated successfully!', updatedComments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Route 2: Get comments with "Undecided" type
router.get('/undecided', async (req, res) => {
  try {
    const undecidedComments = await Comment.find({ commentType: 'neutral' });
    res.status(200).json(undecidedComments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching undecided comments', error: error.message });
  }
});

// ✅ Route 3: Update comment sentiment type by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { commentType } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { commentType },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// Helper function to check project ownership
async function checkProjectOwnership(email, projectId) {
  const checks = await Promise.all([
    Story.findOne({ _id: projectId, userEmail: email }),
    Novel.findOne({ _id: projectId, userEmail: email }),
    Urdu.findOne({ _id: projectId, userEmail: email })
  ]);

  return checks.some(result => result !== null);
}

module.exports = router;