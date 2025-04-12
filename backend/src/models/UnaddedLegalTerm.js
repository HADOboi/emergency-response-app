const mongoose = require('mongoose');

const unaddedLegalTermSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  searchCount: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster searches
unaddedLegalTermSchema.index({ term: 1 });

const UnaddedLegalTerm = mongoose.model('UnaddedLegalTerm', unaddedLegalTermSchema);

module.exports = UnaddedLegalTerm; 