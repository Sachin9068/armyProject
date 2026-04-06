const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Moduls/User');
const generateUsername = require('../utils/generateUsername');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {updateLocation} = require('../controllers/LocationController');

const locationRouter = express.Router();

locationRouter.post("/update",authMiddleware,updateLocation);

module.exports = locationRouter;