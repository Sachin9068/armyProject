const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Moduls/User');
const generateUsername = require('../utils/generateUsername');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
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

    const user = new User({ username, role, armyno, rank, name, departmentTrade, mobileno, password });
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
        mobileno: user.mobileno,
        rank: user.rank,
        armyno: user.armyno,
        departmentTrade: user.departmentTrade
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/Mobile and password are required' });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { mobileno: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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
        mobileno: user.mobileno,
        rank: user.rank,
        armyno: user.armyno,
        departmentTrade: user.departmentTrade
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me  — get current user profile
// ─────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/admin/users  — all users (admin)
// ─────────────────────────────────────────────
router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, role } = req.query;

    let filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { armyno: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { mobileno: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter, '-password').sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/admin/users/:id  — single user (admin)
// ─────────────────────────────────────────────
router.get('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/admin/users  — create user (admin)
// ─────────────────────────────────────────────
router.post('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
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

    const user = new User({ username, role, armyno, rank, name, departmentTrade, mobileno, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        mobileno: user.mobileno,
        rank: user.rank,
        armyno: user.armyno,
        departmentTrade: user.departmentTrade
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/admin/users/:id  — update user (admin)
// ─────────────────────────────────────────────
router.put('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { password, ...updateData } = req.body; // don't allow password update here

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/auth/admin/users/:id  — delete user (admin)
// ─────────────────────────────────────────────
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // prevent admin from deleting themselves
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;