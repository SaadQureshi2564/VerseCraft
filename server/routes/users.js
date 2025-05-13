// server/routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        // Rename the file to include the date for uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Registration Route
router.post('/signup', upload.single('profile'), async (req, res) => {
    try {
        const { fullname, email, password, age, gender, phone, description } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        let profileImagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';

        // Create new user
        const newUser = new User({
          fullname,
          email,
          password: hashedPassword,
          age,
          gender,
          phone,
          description,
          profileImage: profileImagePath,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Please enter all fields' });
      }
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Check if the user is an admin
      const userType = user.userType === 'admin' ? 'admin' : 'user';
  
      // Create and sign JWT
      const payload = {
        user: {
          id: user._id,
          userType: userType, // Add userType in payload
        },
      };
  
      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, userType: userType, message: 'Login successful' });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
// Get All Users Route (for testing)
router.get('/all', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Collaborators
router.get('/get-collaborators', async (req, res) => {
    console.log('Received request for /get-collaborators');
    try {
        const collaborators = await User.find({}, 'fullname email');
        res.json(collaborators);
    } catch (err) {
        console.error('Error fetching collaborators:', err);
        res.status(500).json({ message: err.message });
    }
});

// Protected Route: Get User Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile Route
router.put('/profile', auth, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { fullname, email, age, gender, phone, description } = req.body;

        const updateFields = {
            fullname,
            email,
            age,
            gender,
            phone,
            description,
        };

        // Handle profile image upload
        if (req.files['profileImage']) {
            updateFields.profileImage = req.files['profileImage'][0].path.replace(/\\/g, '/');
        }

        // Handle cover image upload
        if (req.files['coverImage']) {
            updateFields.coverImage = req.files['coverImage'][0].path.replace(/\\/g, '/');
        }

        // Update user
        const user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true }).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change Password Route
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Please provide current and new passwords' });
        }

        // Get user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
