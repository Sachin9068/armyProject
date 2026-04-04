const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const { attachLocationWebSocket } = require('./sockets/locationSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);

attachLocationWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket location: ws://<host>:${PORT}/ws/location`);
});