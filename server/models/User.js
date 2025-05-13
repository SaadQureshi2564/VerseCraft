// server/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname:    { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    age:         { type: Number, required: true },
    gender:      { type: String, required: true },
    phone:       { type: String, required: true },
    description: { type: String },
    profileImage:{ type: String },
    coverImage:  { type: String },
    userType:    { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);