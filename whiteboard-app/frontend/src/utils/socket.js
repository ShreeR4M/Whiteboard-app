import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
    this.callbacks = new Map();
  }

  connect(backendUrl) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.emit('socket-connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.emit('socket-disconnected', { reason });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket-error', { error });
    });

    this.socket.on('room-joined', (data) => {
      this.emit('room-joined', data);
    });

    this.socket.on('user-joined', (data) => {
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.emit('user-left', data);
    });

    this.socket.on('drawing-event', (data) => {
      this.emit('drawing-event', data);
    });

    this.socket.on('canvas-cleared', (data) => {
      this.emit('canvas-cleared', data);
    });

    this.socket.on('canvas-saved', (data) => {
      this.emit('canvas-saved', data);
    });
  }

  joinRoom(roomId, userId, username) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.currentRoom = roomId;
    this.socket.emit('join-room', { roomId, userId, username });
  }

  leaveRoom() {
    if (this.currentRoom && this.socket) {
      this.socket.emit('leave-room', { roomId: this.currentRoom });
      this.currentRoom = null;
    }
  }

  sendDrawingEvent(eventData) {
    if (!this.socket || !this.currentRoom) return;
    
    this.socket.emit('drawing-event', eventData);
  }

  clearCanvas() {
    if (!this.socket || !this.currentRoom) return;
    
    this.socket.emit('clear-canvas', {});
  }

  saveCanvas(canvasData) {
    if (!this.socket || !this.currentRoom) return;
    
    this.socket.emit('save-canvas', { canvasData });
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);
  }

  off(event, callback) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in callback for event ${event}:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  getCurrentRoom() {
    return this.currentRoom;
  }
}

const socketManager = new SocketManager();

export default socketManager;