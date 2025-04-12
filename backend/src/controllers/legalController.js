const UnaddedLegalTerm = require('../models/UnaddedLegalTerm');
const LegalSection = require('../models/LegalSection');

// Track an unadded legal term
exports.trackUnaddedTerm = async (req, res) => {
  try {
    const { term } = req.body;
    
    if (!term) {
      return res.status(400).json({ message: 'Term is required' });
    }

    // Find or create the term
    const existingTerm = await UnaddedLegalTerm.findOne({ term: term.toLowerCase() });
    
    if (existingTerm) {
      // Update search count and last searched date
      existingTerm.searchCount += 1;
      existingTerm.lastSearched = new Date();
      await existingTerm.save();
    } else {
      // Create new term
      await UnaddedLegalTerm.create({
        term: term.toLowerCase(),
        searchCount: 1,
        lastSearched: new Date()
      });
    }

    res.status(200).json({ message: 'Term tracked successfully' });
  } catch (error) {
    console.error('Error tracking unadded term:', error);
    res.status(500).json({ message: 'Error tracking unadded term' });
  }
};

// Get all unadded terms
exports.getUnaddedTerms = async (req, res) => {
  try {
    const terms = await UnaddedLegalTerm.find()
      .sort({ searchCount: -1, lastSearched: -1 });
    
    res.json(terms);
  } catch (error) {
    console.error('Error fetching unadded terms:', error);
    res.status(500).json({ message: 'Error fetching unadded terms' });
  }
};

// Ignore a term
exports.ignoreTerm = async (req, res) => {
  try {
    const term = await UnaddedLegalTerm.findById(req.params.id);
    
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    // Delete the term from unadded terms
    await UnaddedLegalTerm.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Term ignored successfully' });
  } catch (error) {
    console.error('Error ignoring term:', error);
    res.status(500).json({ message: 'Error ignoring term' });
  }
};

// Link a term to an existing case
exports.linkTerm = async (req, res) => {
  try {
    const { existingCaseId, caseTitle } = req.body;
    console.log('Linking term with existingCaseId:', existingCaseId, 'caseTitle:', caseTitle);
    
    const term = await UnaddedLegalTerm.findById(req.params.id);
    
    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    // Find the existing case
    let existingCase = null;
    
    // Check if existingCaseId is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(existingCaseId);
    
    if (isValidObjectId) {
      try {
        existingCase = await LegalSection.findById(existingCaseId);
      } catch (error) {
        console.log('Error finding by ObjectId:', error.message);
        // Continue to next search method
      }
    }
    
    // If not found by ObjectId, try finding by custom id field
    if (!existingCase) {
      try {
        existingCase = await LegalSection.findOne({ id: existingCaseId });
        console.log('Found by custom id:', existingCase ? 'yes' : 'no');
      } catch (error) {
        console.log('Error finding by custom id:', error.message);
      }
    }
    
    // If still not found, create a new one with the provided ID
    if (!existingCase && caseTitle) {
      console.log('Creating new section with id:', existingCaseId, 'title:', caseTitle);
      try {
        const parts = caseTitle.split(' - ');
        existingCase = new LegalSection({
          id: existingCaseId,
          code: parts[0] || '',
          title: parts[1] || caseTitle,
          description: 'Created from unadded term',
          category: 'General',
          keywords: [term.term],
          emergencyActions: ['Contact authorities if needed'],
          relatedSections: [],
          relatedLaws: []
        });
        await existingCase.save();
        console.log('New section created successfully');
      } catch (error) {
        console.error('Error creating new section:', error);
        return res.status(500).json({ message: 'Failed to create new section: ' + error.message });
      }
    } else if (!existingCase) {
      return res.status(404).json({ message: 'Existing case not found' });
    }

    // Add the term as a keyword to the existing case
    if (!existingCase.keywords.includes(term.term)) {
      existingCase.keywords.push(term.term);
      await existingCase.save();
    }
    
    // Delete the term from unadded terms
    await UnaddedLegalTerm.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Term linked successfully' });
  } catch (error) {
    console.error('Error linking term:', error);
    res.status(500).json({ message: 'Error linking term' });
  }
};

// Get all legal sections
exports.getLegalSections = async (req, res) => {
  try {
    console.log('Fetching all legal sections...'); // Debug log
    const sections = await LegalSection.find()
      .sort({ title: 1 });
    
    console.log('Found sections:', sections); // Debug log
    res.json(sections);
  } catch (error) {
    console.error('Error fetching legal sections:', error);
    res.status(500).json({ message: 'Error fetching legal sections' });
  }
}; 