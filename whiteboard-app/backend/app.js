const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');
const SocketHandlers = require('./socket/socketHandlers');

require('dotenv').config();

// Create Express app
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin:[
     'http://localhost:3000','https://whiteboard-frontend-jade.vercel.app',
    process.env.CORS_ORIGIN || '*'
  ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api', roomRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Collaborative Whiteboard API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

const socketHandlers = new SocketHandlers(io);

io.on('connection', (socket) => {
  socketHandlers.handleConnection(socket);
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = { app, server, io };