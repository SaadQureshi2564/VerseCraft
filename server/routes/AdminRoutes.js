// routes/AdminRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = 'your_secret_key_here'; // Use an environment variable in production

// Signup
router.post('/signup', async (req, res) => {
    const { fullname, email, password, age, gender, phone, description, profileImage, coverImage } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const admin = new Admin({
            fullname,
            email,
            password: hashedPassword,
            age,
            gender,
            phone,
            description,
            profileImage,
            coverImage,
        });

        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Update Admin
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Hash password if it's being updated
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin updated successfully', updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error updating admin', error });
    }
});

// Delete Admin
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAdmin = await Admin.findByIdAndDelete(id);
        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting admin', error });
    }
});

module.exports = router;
