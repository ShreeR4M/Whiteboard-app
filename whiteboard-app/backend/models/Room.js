const mongoose = require('mongoose');

const drawingEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['draw', 'erase', 'clear', 'undo', 'redo', 'shape', 'text']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  userId: String,
  username: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  canvasData: {
    type: String, // JSON string of canvas state
    default: null
  },
  drawingEvents: [drawingEventSchema],
  activeUsers: [{
    userId: String,
    username: String,
    socketId: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Room', roomSchema);