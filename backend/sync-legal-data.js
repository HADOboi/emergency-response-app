/**
 * This is a simple runner script to sync legal data from frontend to backend.
 * Run this once to populate the MongoDB database with comprehensive legal data.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n=== Legal Data Sync Tool ===\n');
console.log('This tool will sync legal data from the frontend to the MongoDB database.');
console.log('Make sure MongoDB is running before proceeding.\n');

const syncScript = path.join(__dirname, 'src', 'seed', 'syncLegalData.js');

console.log('Starting sync process...\n');

const child = spawn('node', [syncScript], { stdio: 'inherit' });

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Sync completed successfully!');
    console.log('\nYou can now delete both this script (backend/sync-legal-data.js)');
    console.log('and the sync script (backend/src/seed/syncLegalData.js)');
    console.log('\nThe legal data is now properly stored in your MongoDB database.');
  } else {
    console.log('\n❌ Sync failed with code:', code);
    console.log('Please check the error messages above and try again.');
  }
}); 