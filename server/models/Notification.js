// models/Notification.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import uuid for unique ID generation

// Notification Schema
const NotificationSchema = new mongoose.Schema({
    notificationId: { 
        type: String, 
        unique: true, 
        default: uuidv4 // Automatically generates a unique ID
    },
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'projectType' // Dynamic reference based on projectType
    },
    projectType: { // New field
        type: String,
        required: true,
        enum: ['Novel', 'Story', 'Urdu'], // Allowed project types
    },
    notificationType: {
        type: String,
        required: true,
        enum: ['Reminder', 'Update', 'Alert', 'Invite'], // Add 'Invite' to the allowed types
    },
    senderEmail: { 
        type: String, 
        required: true, // Store sender's email directly
    },
    recipientEmail: { 
        type: String, 
        required: true, // Store recipient's email directly
    },
    description: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'seen'], 
        default: 'pending' 
    },
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Notification', NotificationSchema);
