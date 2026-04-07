const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const adminrouter = require('./routes/admin');
const locationRouter = require('./routes/location');
const { attachLocationWebSocket } = require('./sockets/locationSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);

attachLocationWebSocket(server);

// Middleware
app.use(express.json());

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || DEV_ORIGINS.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminrouter);
app.use('/api/location', locationRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env.`);
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket location: ws://<host>:${PORT}/ws/location`);
});