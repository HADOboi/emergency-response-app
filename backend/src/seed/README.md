# Legal Data Sync Script

This directory contains scripts to populate the MongoDB database with legal data from the frontend.

## syncLegalData.js

This script syncs the legal data from the frontend (`src/data/legalData.ts`) to the MongoDB database. It ensures that all the detailed data from the frontend, including punishment details, is properly stored in the backend.

### How to Run

1. Make sure MongoDB is running
2. From the project root directory, run:

```bash
node backend/src/seed/syncLegalData.js
```

### What It Does

1. Reads the legal data from the frontend TypeScript file
2. Transforms it to match the backend schema
3. Clears any existing legal sections from the database
4. Inserts all the transformed data into MongoDB

### When to Run

This script should be run only once to initially populate the database. You may run it again if you update the frontend legal data and want to sync those changes to the backend.

### After Running

Once you've successfully run the script and confirmed the data is in the database, you can safely delete the script as it's no longer needed. The application will now use the MongoDB database for legal searches instead of falling back to the frontend data. 