const mongoose = require('mongoose');
const LegalSection = require('../models/LegalSection');
require('dotenv').config();

// Using the same legal sections as defined in the frontend, but with matching categories
const initialSections = [
  {
    id: 'ipc-302',
    code: 'IPC Section 302',
    title: 'Murder',
    description: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
    punishment: 'Death penalty or imprisonment for life with fine',
    category: 'Crimes against Human Body',
    keywords: ['murder', 'homicide', 'killing', 'death', 'assassination'],
    emergencyActions: [
      'Immediately call police (100)',
      'Do not touch or move anything at the crime scene',
      'Seek medical help if needed',
      'Contact family members',
      'Document any witnesses'
    ],
    relatedSections: ['IPC-304', 'IPC-307', 'IPC-308']
  },
  {
    id: 'ipc-304',
    code: 'IPC Section 304',
    title: 'Culpable Homicide not amounting to Murder',
    description: 'Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.',
    punishment: 'Imprisonment for life or up to 10 years with fine',
    category: 'Crimes against Human Body',
    keywords: ['culpable homicide', 'manslaughter', 'death', 'killing', 'negligence'],
    emergencyActions: [
      'Call police (100)',
      'Seek medical help',
      'Document the incident',
      'Preserve evidence',
      'Contact legal counsel'
    ],
    relatedSections: ['IPC-302', 'IPC-304A', 'IPC-307']
  },
  {
    id: 'ipc-390',
    code: 'IPC Section 390',
    title: 'Robbery',
    description: 'In all robbery there is either theft or extortion. When theft is robbery: theft becomes robbery if, in order to committing of the theft, or in committing the theft, or in carrying away or attempting to carry away property obtained by the theft, the offender, for that end, voluntarily causes or attempts to cause to any person death or hurt or wrongful restraint, or fear of instant death or of instant hurt, or of instant wrongful restraint.',
    punishment: 'Imprisonment for up to 10 years with fine',
    category: 'Crimes against Property',
    keywords: ['robbery', 'theft', 'armed robbery', 'mugging', 'looting'],
    emergencyActions: [
      'Call police (100) immediately',
      'Do not resist if threatened with violence',
      'Try to remember details about the robbers',
      'Document any injuries',
      'Contact insurance if applicable'
    ],
    relatedSections: ['IPC-392', 'IPC-393', 'IPC-394']
  },
  {
    id: 'ipc-279',
    code: 'IPC Section 279',
    title: 'Rash Driving or Riding on a Public Way',
    description: 'Whoever drives any vehicle, or rides, on any public way in a manner so rash or negligent as to endanger human life, or to be likely to cause hurt or injury to any other person, shall be punished with imprisonment of either description for a term which may extend to six months, or with fine which may extend to one thousand rupees, or with both.',
    punishment: 'Imprisonment up to 6 months or fine up to ₹1000 or both',
    category: 'Traffic Offenses',
    keywords: ['rash driving', 'reckless driving', 'hit and run', 'accident', 'traffic violation'],
    emergencyActions: [
      'Call police (100)',
      'Call ambulance (108)',
      'Document the scene with photos',
      'Get contact details of witnesses',
      'Do not admit fault at the scene'
    ],
    relatedSections: ['IPC-304A', 'IPC-337', 'IPC-338']
  },
  {
    id: 'ipc-304A',
    code: 'IPC Section 304A',
    title: 'Causing Death by Negligence',
    description: 'Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.',
    punishment: 'Imprisonment up to 2 years or fine or both',
    category: 'Crimes against Human Body',
    keywords: ['negligence', 'accident', 'death', 'rash act', 'carelessness'],
    emergencyActions: [
      'Call police (100)',
      'Call ambulance (108)',
      'Document the scene',
      'Get witness statements',
      'Contact insurance company'
    ],
    relatedSections: ['IPC-279', 'IPC-337', 'IPC-338']
  },
  {
    id: 'ipc-354',
    code: 'IPC Section 354',
    title: 'Assault or Criminal Force to Woman with Intent to Outrage her Modesty',
    description: 'Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.',
    punishment: 'Imprisonment from 1 to 5 years with fine',
    category: 'Crimes against Women',
    keywords: ['assault', 'molestation', 'harassment', 'outraging modesty', 'women safety'],
    emergencyActions: [
      'Call police (100) immediately',
      'Call women helpline (1091)',
      'Document the incident',
      'Seek medical help if needed',
      'Contact family members'
    ],
    relatedSections: ['IPC-354A', 'IPC-354B', 'IPC-354C', 'IPC-354D']
  },
  {
    id: 'ipc-379',
    code: 'IPC Section 379',
    title: 'Theft',
    description: 'Whoever, intending to take dishonestly any moveable property out of the possession of any person without that person\'s consent, moves that property in order to such taking, is said to commit theft.',
    punishment: 'Imprisonment up to 3 years or fine or both',
    category: 'Crimes against Property',
    keywords: ['theft', 'stealing', 'larceny', 'burglary', 'robbery'],
    emergencyActions: [
      'Call police (100)',
      'Document stolen items',
      'Check CCTV if available',
      'Contact insurance company',
      'Secure the premises'
    ],
    relatedSections: ['IPC-380', 'IPC-381', 'IPC-382']
  },
  {
    id: 'ipc-323',
    code: 'IPC Section 323',
    title: 'Voluntarily Causing Hurt',
    description: 'Whoever, except in the case provided for by section 334, voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.',
    punishment: 'Imprisonment up to 1 year or fine up to ₹1000 or both',
    category: 'Crimes against Human Body',
    keywords: ['assault', 'battery', 'hurt', 'injury', 'physical violence'],
    emergencyActions: [
      'Call police (100)',
      'Seek medical help',
      'Document injuries',
      'Get witness statements',
      'File FIR at police station'
    ],
    relatedSections: ['IPC-324', 'IPC-325', 'IPC-326']
  },
  {
    id: 'ipc-420',
    code: 'IPC Section 420',
    title: 'Cheating and Dishonestly Inducing Delivery of Property',
    description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
    punishment: 'Imprisonment up to 7 years with fine',
    category: 'Economic Offenses',
    keywords: ['cheating', 'fraud', 'scam', 'deception', 'financial crime'],
    emergencyActions: [
      'Document all evidence',
      'File police complaint',
      'Contact cyber crime cell if online fraud',
      'Inform bank if financial fraud',
      'Keep all communication records'
    ],
    relatedSections: ['IPC-417', 'IPC-418', 'IPC-419']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sections
    await LegalSection.deleteMany({});
    console.log('Cleared existing sections');

    // Insert new sections
    await LegalSection.insertMany(initialSections);
    console.log('Seeded initial legal sections');

    console.log('Database successfully seeded with legal sections from frontend data');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 