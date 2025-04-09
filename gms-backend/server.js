const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const connectDB = require('./config/db');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Options
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Security middleware
// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Sanitize data (prevent NoSQL injection)
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api/', limiter);

// Prevent HTTP param pollution
app.use(hpp());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Setup user connection
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
    console.log(`User ${userData.fullName} (${userData._id}) connected`);
  });
  
  // Join chat room
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });
  
  // Leave chat room
  socket.on('leave chat', (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });
  
  // Typing indicators
  socket.on('typing', (room) => {
    socket.to(room).emit('typing');
  });
  
  socket.on('stop typing', (room) => {
    socket.to(room).emit('stop typing');
  });
  
  // New message
  socket.on('new message', (newMessageReceived) => {
    let conversation = newMessageReceived.conversation;
    
    if (!conversation.participants) return;
    
    conversation.participants.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });
  
  // Notification events
  socket.on('new notification', (notification) => {
    if (notification.to) {
      socket.to(notification.to).emit('notification received', notification);
    }
  });
  
  // Trainer connection events
  socket.on('trainer request', (data) => {
    if (data.trainerId) {
      socket.to(data.trainerId).emit('new trainer request', {
        customerId: data.customerId,
        customerName: data.customerName
      });
    }
  });
  
  socket.on('trainer response', (data) => {
    if (data.customerId) {
      socket.to(data.customerId).emit('trainer response received', {
        trainerId: data.trainerId,
        trainerName: data.trainerName,
        accepted: data.accepted
      });
    }
  });
  
  // Event registration
  socket.on('event registration', (data) => {
    if (data.organizerId) {
      socket.to(data.organizerId).emit('new event registration', {
        userId: data.userId,
        userName: data.userName,
        eventId: data.eventId,
        eventName: data.eventName
      });
    }
  });
  
  // User disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});