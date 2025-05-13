// models/Section.js
const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        default: '',
    },
    characters: [{
        type: String,
        default: '',
    }],
}, { _id: false }); // Set _id to false if sections are embedded and unique IDs are not required

module.exports = SectionSchema;
