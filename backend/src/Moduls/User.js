const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  role: { type: String, required: true, enum: ['ADMIN', 'RHM', 'BHM', 'EMPLOYEE'],  },
  armyno: { type: String, required: true, unique: true, trim: true },
  rank: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  departmentTrade: { type: String, required: true, trim: true },
  mobileno: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
   // For BHM: reference to the RHM they report to
  rhmId: {type: mongoose.Schema.Types.ObjectId,ref: 'User',default: null,},
     // For EMPLOYEE: reference to the BHM they report to
  bhmId: {type: mongoose.Schema.Types.ObjectId,ref: 'User',default: null,},
    // Denormalized counters for enforcing limits
  bhmCount: {type: Number,default: 0,min: 0,max: 4,},
  employeeCount: {type: Number,default: 0,min: 0,max: 150,},
    // Embedded last known location (optional, for fast map rendering)
  lastLocation: {lat: { type: Number, default: null },lng: { type: Number, default: null },updatedAt: { type: Date, default: null },},
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);