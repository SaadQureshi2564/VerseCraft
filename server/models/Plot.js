// models/Plot.js

const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Section name is required.'],
    },
    summary: {
        type: String,
        default: '',
    },
    characters: [{
        type: String,
    }],
}, { _id: false }); // Prevents creating an _id for subdocuments

const PlotSchema = new mongoose.Schema({
    chapter: { // Correct field name
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: [true, 'Chapter reference is required.'],
    },
    name: {
        type: String,
        required: [true, 'Plot name is required.'],
    },
    sections: [SectionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Plot', PlotSchema);
