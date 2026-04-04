const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Moduls/User');
const generateUsername = require('../utils/generateUsername');
const router = express.Router();
const adminMiddleware = require('../middleware/auth')

// Register
router.post('/register', async (req, res) => {
  try {

    const { role, armyno, rank, name, departmentTrade, mobileno, password } = req.body;

    if (!role || !armyno || !rank || !name || !departmentTrade || !mobileno || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingMobile = await User.findOne({ mobileno });
    if (existingMobile) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    const existingArmyNo = await User.findOne({ armyno });
    if (existingArmyNo) {
      return res.status(400).json({ message: 'Army number already exists' });
    }

    let username = generateUsername(name, mobileno);

    let existingUsername = await User.findOne({ username });
    let suffix = 1;

    while (existingUsername) {
      username = `${generateUsername(name, mobileno)}${suffix}`;
      existingUsername = await User.findOne({ username });
      suffix++;
    }
  

    const user = new User({
      username,
      role,
      armyno,
      rank,
      name,
      departmentTrade,
      mobileno,
      password
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        mobileno: user.mobileno
      }
    });
  

  } catch (error) {
     res.status(500).send({ message: 'Registeration Error  ', error: error.message });
  }
});

// Login
router.post('/login',async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/Mobile and password are required' });
    }

    // Find user by username or mobileno
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { mobileno: identifier }
      ]
    });
    // console.log(user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        mobileno: user.mobileno
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all users (admin only)
router.get('/admin', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }, '-password');

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single user by ID (admin only)
router.get('/users/:id',  adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;