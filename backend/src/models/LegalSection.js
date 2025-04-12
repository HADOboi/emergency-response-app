const mongoose = require('mongoose');

const legalSectionSchema = new mongoose.Schema({
  id: {
    type: String,
    trim: true,
    index: true
  },
  code: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  punishment: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Women Safety', 'Child Safety', 'Elderly Safety', 'Road Safety', 'Cyber Safety', 
           'IPC', 'CrPC', 'Crimes against Human Body', 'Crimes against Property', 'Traffic Offenses', 
           'Crimes against Women', 'Economic Offenses']
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  emergencyActions: [{
    type: String,
    default: []
  }],
  relatedSections: [{
    type: String,
    default: []
  }],
  relatedLaws: [{
    type: String,
    default: []
  }]
}, {
  timestamps: true
});

// Index for faster searches
legalSectionSchema.index({ title: 1, keywords: 1 });

const LegalSection = mongoose.model('LegalSection', legalSectionSchema);

module.exports = LegalSection; 