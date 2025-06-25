const Room = require('../models/Room');

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.activeRooms = new Map(); 
    this.userSockets = new Map(); 
  }

  handleConnection(socket) {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', async (data) => {
      try {
        const { roomId, userId, username } = data;
        
        const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        previousRooms.forEach(room => {
          socket.leave(room);
          this.removeUserFromRoom(room, socket.id);
        });

        socket.join(roomId);
        
        this.userSockets.set(socket.id, { roomId, userId, username });
        
        if (!this.activeRooms.has(roomId)) {
          this.activeRooms.set(roomId, new Set());
        }
        this.activeRooms.get(roomId).add(socket.id);

        await this.updateRoomUsers(roomId);

        socket.to(roomId).emit('user-joined', {
          userId,
          username,
          userCount: this.activeRooms.get(roomId).size
        });

        socket.emit('room-joined', {
          roomId,
          userCount: this.activeRooms.get(roomId).size
        });

        console.log(`User ${username} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('drawing-event', async (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        
        await this.saveDrawingEvent(roomId, {
          ...data,
          userId: userInfo.userId,
          username: userInfo.username
        });

        socket.to(roomId).emit('drawing-event', {
          ...data,
          userId: userInfo.userId,
          username: userInfo.username
        });

      } catch (error) {
        console.error('Error handling drawing event:', error);
      }
    });

    socket.on('clear-canvas', async (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        
        await this.saveDrawingEvent(roomId, {
          type: 'clear',
          data: {},
          userId: userInfo.userId,
          username: userInfo.username
        });

        socket.to(roomId).emit('canvas-cleared', {
          userId: userInfo.userId,
          username: userInfo.username
        });

      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    });

    // Chat message handling
    socket.on('chat-message', (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        const messageData = {
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date()
        };

        // Broadcast to all users in the room including sender
        this.io.to(roomId).emit('chat-message', messageData);
        
        console.log(`Chat message in room ${roomId} from ${data.username}: ${data.message}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    });

    // User typing indicator
    socket.on('user-typing', (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        
        // Broadcast typing status to other users in the room (not sender)
        socket.to(roomId).emit('user-typing', {
          userId: data.userId,
          username: data.username,
          isTyping: data.isTyping
        });
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    socket.on('save-canvas', async (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        const { canvasData } = data;

        const room = await Room.findOne({ roomId });
        if (room) {
          room.canvasData = JSON.stringify(canvasData);
          await room.save();
          
          socket.emit('canvas-saved', { success: true });
        }

      } catch (error) {
        console.error('Error saving canvas:', error);
        socket.emit('canvas-saved', { success: false, error: error.message });
      }
    });

    // Chat message handling
    socket.on('chat-message', (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        const messageData = {
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date()
        };

        // Broadcast to all users in the room including sender
        this.io.to(roomId).emit('chat-message', messageData);
        
        console.log(`Chat message in room ${roomId} from ${data.username}: ${data.message}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    });

    // User typing indicator
    socket.on('user-typing', (data) => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (!userInfo) return;

        const { roomId } = userInfo;
        
        // Broadcast typing status to other users in the room (not sender)
        socket.to(roomId).emit('user-typing', {
          userId: data.userId,
          username: data.username,
          isTyping: data.isTyping
        });
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const userInfo = this.userSockets.get(socket.id);
        if (userInfo) {
          const { roomId, userId, username } = userInfo;
          
          this.removeUserFromRoom(roomId, socket.id);
          
          await this.updateRoomUsers(roomId);
          
          socket.to(roomId).emit('user-left', {
            userId,
            username,
            userCount: this.activeRooms.get(roomId)?.size || 0
          });

          console.log(`User ${username} left room ${roomId}`);
        }

        this.userSockets.delete(socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  }

  removeUserFromRoom(roomId, socketId) {
    if (this.activeRooms.has(roomId)) {
      this.activeRooms.get(roomId).delete(socketId);
      if (this.activeRooms.get(roomId).size === 0) {
        this.activeRooms.delete(roomId);
      }
    }
  }

  async updateRoomUsers(roomId) {
    try {
      const socketIds = this.activeRooms.get(roomId);
      if (!socketIds) return;

      const activeUsers = [];
      for (const socketId of socketIds) {
        const userInfo = this.userSockets.get(socketId);
        if (userInfo) {
          activeUsers.push({
            userId: userInfo.userId,
            username: userInfo.username,
            socketId: socketId
          });
        }
      }

      await Room.findOneAndUpdate(
        { roomId },
        { activeUsers },
        { upsert: false }
      );
    } catch (error) {
      console.error('Error updating room users:', error);
    }
  }

  async saveDrawingEvent(roomId, eventData) {
    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        room.drawingEvents.push(eventData);
        if (room.drawingEvents.length > 1000) {
          room.drawingEvents = room.drawingEvents.slice(-1000);
        }
        await room.save();
      }
    } catch (error) {
      console.error('Error saving drawing event:', error);
    }
  }
}

module.exports = SocketHandlers;