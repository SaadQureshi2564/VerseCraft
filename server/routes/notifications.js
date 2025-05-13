// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Novel = require('../models/Novel'); // Corrected import
const Story = require('../models/Story'); // Corrected import
const Urdu = require('../models/Urdu'); // Corrected import

// Send a Collaboration Invitation Notification
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, description, notificationType, projectId, projectType } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !description || !notificationType || !projectId || !projectType) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ error: 'You cannot invite yourself.' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validNotificationTypes = ['Reminder', 'Update', 'Alert', 'Invite'];
    if (!validNotificationTypes.includes(notificationType)) {
      return res.status(400).json({ error: 'Invalid notification type.' });
    }

    // Validate projectType
    const validProjectTypes = ['Novel', 'Story', 'Urdu'];
    if (!validProjectTypes.includes(projectType)) {
      return res.status(400).json({ error: 'Invalid project type.' });
    }

    const existingNotification = await Notification.findOne({ 
      senderEmail: sender.email, 
      recipientEmail: receiver.email, 
      projectId, 
      notificationType 
    });

    if (existingNotification) {
      return res.status(400).json({ error: 'An invitation for this project has already been sent to this user.' });
    }

    const newNotification = new Notification({
      senderEmail: sender.email,
      recipientEmail: receiver.email,
      projectId,
      projectType, // Ensure projectType is included
      notificationType,
      description,
    });

    await newNotification.save();
    res.status(201).json({ message: 'Notification sent successfully!', notification: newNotification });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Fetch notifications for the current user
router.get('/user-notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Get the authenticated user

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Fetch notifications where recipientEmail matches user's email
    const notifications = await Notification.find({ recipientEmail: user.email }).sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update notification status
router.patch('/:id/status', auth, async (req, res) => { // Corrected path
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected', 'seen'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { notificationId: req.params.id },
      { status },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => { // Corrected path
  try {
    const deletedNotification = await Notification.findOneAndDelete({ notificationId: req.params.id });
    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    res.json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Accept Invite
router.post('/accept-invite', auth, async (req, res) => { // Corrected path
  const { projectId, projectType, notificationId } = req.body; // Include notificationId
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Validate projectType
    const validProjectTypes = ['Novel', 'Story', 'Urdu'];
    if (!validProjectTypes.includes(projectType)) {
      return res.status(400).json({ error: 'Invalid project type.' });
    }

    let projectModel;
    switch (projectType) {
      case 'Novel':
        projectModel = Novel;
        break;
      case 'Story':
        projectModel = Story;
        break;
      case 'Urdu':
        projectModel = Urdu;
        break;
      default:
        return res.status(400).json({ error: 'Invalid project type.' });
    }

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    // Find the notification
    const notification = await Notification.findOne({ 
      notificationId, 
      recipientEmail: user.email, 
      notificationType: 'Invite' 
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    // Check current status
    if (notification.status === 'accepted') {
      return res.status(400).json({ error: 'Invitation has already been accepted.' });
    }

    if (notification.status === 'rejected') {
      return res.status(400).json({ error: 'Invitation has been rejected and cannot be accepted.' });
    }

    // Add user to project's collaborators if not already included
    if (!project.collaborators.some(collab => collab.email === user.email)) {
      project.collaborators.push({ email: user.email });
      await project.save();
    }

    // Update notification status to 'accepted'
    notification.status = 'accepted';
    await notification.save();

    res.status(200).json({ message: 'Invite accepted successfully.', project });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;
