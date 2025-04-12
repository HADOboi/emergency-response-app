const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import LegalSection model
const LegalSection = require('../models/LegalSection');

// The path to the frontend's legalData.ts file
const frontendDataPath = path.join(__dirname, '../../../src/data/legalData.ts');

/**
 * Function to extract legal data from the frontend file
 * This parses the TypeScript file to extract the data without requiring TS compilation
 */
const extractFrontendData = () => {
  try {
    // Read the frontend data file
    const fileContent = fs.readFileSync(frontendDataPath, 'utf8');
    
    // Extract the array data between the square brackets
    let dataStart = fileContent.indexOf('export const legalDatabase: LegalSection[] = [');
    if (dataStart === -1) {
      dataStart = fileContent.indexOf('export const legalDatabase = [');
    }
    
    if (dataStart === -1) {
      throw new Error('Could not find legalDatabase export in frontend file');
    }
    
    const startBracket = fileContent.indexOf('[', dataStart);
    let bracketCount = 1;
    let endBracket = startBracket + 1;
    
    // Find the matching closing bracket for the array
    while (bracketCount > 0 && endBracket < fileContent.length) {
      if (fileContent[endBracket] === '[') bracketCount++;
      if (fileContent[endBracket] === ']') bracketCount--;
      endBracket++;
    }
    
    // Extract the array data
    const arrayData = fileContent.substring(startBracket, endBracket);
    
    // Convert the TypeScript code to valid JSON by:
    // 1. Wrap property names without quotes in quotes
    const withQuotedProps = arrayData.replace(/(\s*?)(\w+)(\s*?):/g, '"$2":');
    
    // 2. Replace single quotes with double quotes for strings (but avoid replacing single quotes in contractions)
    const withDoubleQuotes = withQuotedProps.replace(/'([^']*?)'/g, '"$1"');
    
    // 3. Remove trailing commas
    const noTrailingCommas = withDoubleQuotes.replace(/,(\s*?[\]}])/g, '$1');
    
    // Parse the modified string as JSON
    const legalData = JSON.parse(noTrailingCommas);
    
    return legalData;
  } catch (error) {
    console.error('Error extracting frontend data:', error);
    return null;
  }
};

/**
 * Function to transform the frontend data to match the backend schema
 */
const transformData = (frontendData) => {
  return frontendData.map(section => {
    // Create the document with all fields present in frontend data
    const transformedSection = {
      id: section.id,
      code: section.code,
      title: section.title,
      description: section.description,
      punishment: section.punishment,
      category: section.category || 'General',
      keywords: section.keywords || [],
      emergencyActions: section.emergencyActions || [],
      relatedSections: section.relatedSections || []
    };
    
    // Add any additional fields from frontend data not explicitly handled above
    for (const [key, value] of Object.entries(section)) {
      if (!(key in transformedSection)) {
        transformedSection[key] = value;
      }
    }
    
    return transformedSection;
  });
};

/**
 * Main function to sync the frontend data to the backend database
 */
const syncData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emergency-response');
    console.log('Connected to MongoDB');
    
    // Extract frontend data
    console.log('Extracting frontend legal data...');
    const frontendData = extractFrontendData();
    
    if (!frontendData || !frontendData.length) {
      throw new Error('No frontend data found or error extracting data');
    }
    
    console.log(`Found ${frontendData.length} legal sections in frontend data`);
    
    // Transform data for backend
    console.log('Transforming data for backend schema...');
    const transformedData = transformData(frontendData);
    
    // Clear existing data
    console.log('Clearing existing legal sections...');
    await LegalSection.deleteMany({});
    
    // Insert transformed data
    console.log('Inserting frontend data into MongoDB...');
    await LegalSection.insertMany(transformedData);
    
    console.log(`Successfully synced ${transformedData.length} legal sections to MongoDB`);
    console.log('You can now safely delete this script as it is no longer needed');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error syncing data:', error);
    
    // Close MongoDB connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    
    process.exit(1);
  }
};

// Run the sync function
syncData(); 