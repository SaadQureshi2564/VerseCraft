// server/server.js 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // Import Morgan for logging
require('dotenv').config();
const path = require('path');
const http = require('http'); // Import http for creating the server
const socketIo = require('socket.io'); // Import Socket.IO
const jwt = require('jsonwebtoken'); // For JWT authentication
const initializeSocket = require('./socket');

// Import Models
const Chapter = require('./models/Chapter'); // Ensure the Chapter model exists

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Adjust based on your frontend's URL
  credentials: true,
}));
app.use(morgan('dev')); // Use Morgan for logging

// Import Routes
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const storyRoutes = require('./routes/storyRoutes');
const novelsRoutes = require('./routes/novelRoutes');
const urduRouter = require('./routes/urdu');
const chapterRoutes = require('./routes/chapters');
const noteRoutes = require('./routes/noteRoutes');
const novelChaptersRoute = require('./routes/novelChapters');
const notificationsRouter = require('./routes/notifications');

const CharacterRouter = require('./routes/CharacterRouter');
app.use('/api/characters', CharacterRouter);

const plotsRouter = require('./routes/PlotRoutes'); // Adjust the path

app.use(plotsRouter);


// Mount Routes
app.use('/api/notifications', notificationsRouter);
app.use('/api', novelChaptersRoute);
app.use('/api', chapterRoutes); // Mount chapterRoutes at /api
app.use('/api', noteRoutes);



const getChapterRoute = require('./routes/getChapter'); // Adjust the path as needed
app.use('/api', getChapterRoute); // Use the getChapter route

const getprojecttype = require('./routes/helpingroutes');  // Adjust the path as needed
app.use('/api/gettype', getprojecttype);


// Additional Routes
app.use('/api/novels', novelsRoutes);
app.use('/api/urdu', urduRouter);
app.use('/api/stories', storyRoutes);

// Define Additional Routes
app.use('/api/urduchapters', require('./routes/urduChapters'));
app.use('/api/chapter-notes', require('./routes/urduChapterNotes'));

// Mount Routes Correctly (Avoid Duplicates)
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
// Note: '/api/stories' is already mounted above; ensure no duplicates

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const publishingRoutes = require('./routes/publishingRoutes');
app.use('/api/publishing', publishingRoutes);


// Add this line after other route imports
const favoriteRoutes = require('./routes/favorites');
// And this line after other app.use() calls
app.use('/api/favorites', favoriteRoutes);

// Add this line after other route imports
const ratingRoutes = require('./routes/ratings');
// And this line after other app.use() calls
app.use('/api/ratings', ratingRoutes);

// Add this line after other route imports
const commentRoutes = require('./routes/comments');
// And this line after other app.use() calls
app.use('/api/comments', commentRoutes);

const urduChapterVersionsRouter = require('./routes/urduChapterVersionRoutes');
app.use('/api/urduchapterversions', urduChapterVersionsRouter);


const promptRoutes = require('./routes/prompt');
app.use('/api/prompts', promptRoutes); // Use the prompts routes

const chatMessagesRoutes = require('./routes/chatMessages');
app.use('/api/chatMessages', chatMessagesRoutes); // Use the chat messages routes


const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000', // Adjust based on your frontend's URL
        methods: ['GET', 'POST'],
    },
});

// Initialize Socket.io
initializeSocket(io);
// Connect to MongoDB and Start the Server
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => { // Use server.listen instead of app.listen
        console.log(`Server started on port ${PORT}`);
    });
})
.catch((err) => console.log('MongoDB connection error:', err));

// Handle MongoDB Disconnection
mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
});
