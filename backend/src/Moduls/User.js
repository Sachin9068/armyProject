const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  role: { type: String, required: true, enum: ['admin', 'user', 'officer'], default: 'user' },
  armyno: { type: String, required: true, unique: true, trim: true },
  rank: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  departmentTrade: { type: String, required: true, trim: true },
  mobileno: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);