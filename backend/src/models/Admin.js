const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
}, {
  timestamps: true,
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
adminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

// Create default admin if not exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@erapp.com' });
    if (!adminExists) {
      await Admin.create({
        email: 'admin@erapp.com',
        password: 'admin@123',
        role: 'admin'
      });
      console.log('Default admin created successfully');
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Call createDefaultAdmin when the model is loaded
createDefaultAdmin();

module.exports = { Admin, createDefaultAdmin }; 