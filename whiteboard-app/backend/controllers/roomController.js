const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, isPublic = true, createdBy } = req.body;
    
    if (!name || !createdBy) {
      return res.status(400).json({ 
        error: 'Room name and creator are required' 
      });
    }

    const roomId = uuidv4();
    
    const room = new Room({
      roomId,
      name,
      isPublic,
      createdBy
    });

    await room.save();
    
    res.status(201).json({
      success: true,
      room: {
        id: room.roomId,
        name: room.name,
        isPublic: room.isPublic,
        createdBy: room.createdBy,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// Get all public rooms
const getPublicRooms = async (req, res) => {
  try {
    console.log('Fetching public rooms');
    const rooms = await Room.find({ isPublic: true })
      .select('roomId name createdBy createdAt activeUsers')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${rooms.length} public rooms`);
    
    const roomsWithUserCount = rooms.map(room => ({
      id: room.roomId,
      name: room.name,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      activeUsersCount: room.activeUsers ? room.activeUsers.length : 0
    }));

    res.json({
      success: true,
      rooms: roomsWithUserCount
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch rooms',
      message: error.message 
    });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      success: true,
      room: {
        id: room.roomId,
        name: room.name,
        isPublic: room.isPublic,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        activeUsersCount: room.activeUsers ? room.activeUsers.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

// Save canvas data
const saveCanvasData = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { canvasData } = req.body;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.canvasData = JSON.stringify(canvasData);
    await room.save();

    res.json({
      success: true,
      message: 'Canvas data saved successfully'
    });
  } catch (error) {
    console.error('Error saving canvas data:', error);
    res.status(500).json({ error: 'Failed to save canvas data' });
  }
};

// Get canvas data
const getCanvasData = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const canvasData = room.canvasData ? JSON.parse(room.canvasData) : null;

    res.json({
      success: true,
      canvasData
    });
  } catch (error) {
    console.error('Error fetching canvas data:', error);
    res.status(500).json({ error: 'Failed to fetch canvas data' });
  }
};

module.exports = {
  createRoom,
  getPublicRooms,
  getRoomById,
  saveCanvasData,
  getCanvasData
};