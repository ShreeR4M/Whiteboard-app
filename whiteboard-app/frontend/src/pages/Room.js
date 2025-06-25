import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import socketManager from '../utils/socket';
import Toolbar from '../components/Toolbar';
import Canvas from '../components/Canvas';
import ChatSidebar from '../components/ChatSidebar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [currentUser] = useState(() => ({
    id: uuidv4(),
    username: localStorage.getItem('whiteboard-username') || 'Anonymous'
  }));
  
  const [roomInfo, setRoomInfo] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [canUndo, setCanUndo] = useState(false);
  
  const canvasRef = useRef(null);
  const fabricEventsRef = useRef(null);
  const shapeAddRef = useRef(null);

  useEffect(() => {
    if (!currentUser.username || currentUser.username === 'Anonymous') {
      navigate('/');
      return;
    }

    initializeRoom();
    
    return () => {
      if (socketManager.isConnected()) {
        socketManager.leaveRoom();
        socketManager.disconnect();
      }
    };
  }, [roomId, navigate, currentUser.username]);

  const initializeRoom = async () => {
    try {
      const response = await axios.get(`${API}/rooms/${roomId}`);
      if (response.data.success) {
        setRoomInfo(response.data.room);
      } else {
        setConnectionError('Room not found');
        return;
      }

      socketManager.connect(BACKEND_URL);
      
      setupSocketListeners();
      
      if (socketManager.isConnected()) {
        joinRoom();
      } else {
        socketManager.on('socket-connected', joinRoom);
      }

    } catch (error) {
      console.error('Error initializing room:', error);
      setConnectionError('Failed to connect to room');
    }
  };

  const setupSocketListeners = () => {
    socketManager.on('room-joined', (data) => {
      setIsConnected(true);
      setConnectionError('');
      console.log('Successfully joined room:', data);
    });

    socketManager.on('user-joined', (data) => {
      setConnectedUsers(prev => {
        const updated = prev.filter(user => user.id !== data.userId);
        return [...updated, { id: data.userId, username: data.username }];
      });
    });

    socketManager.on('user-left', (data) => {
      setConnectedUsers(prev => prev.filter(user => user.id !== data.userId));
    });

    socketManager.on('socket-error', (data) => {
      setConnectionError('Connection error: ' + data.error);
      setIsConnected(false);
    });

    socketManager.on('socket-disconnected', (data) => {
      setIsConnected(false);
      setConnectionError('Disconnected from server');
    });
  };

  const joinRoom = () => {
    socketManager.joinRoom(roomId, currentUser.id, currentUser.username);
  };

  const handleCanvasReady = (canvas, fabricEvents) => {
    canvasRef.current = canvas;
    fabricEventsRef.current = fabricEvents;
    
    loadCanvasData();
  };

  const loadCanvasData = async () => {
    try {
      const response = await axios.get(`${API}/rooms/${roomId}/canvas`);
      if (response.data.success && response.data.canvasData) {
        fabricEventsRef.current?.loadCanvasData(response.data.canvasData);
      }
    } catch (error) {
      console.error('Error loading canvas data:', error);
    }
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      fabricEventsRef.current?.clearCanvas();
    }
  };

  const handleSaveCanvas = async () => {
    try {
      if (!canvasRef.current) return;
      
      fabricEventsRef.current?.saveCanvas();
      
      const link = document.createElement('a');
      link.download = `whiteboard-${roomId}-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Error saving canvas:', error);
      alert('Failed to save canvas. Please try again.');
    }
  };

  const handleAddShape = (shapeType) => {
    if (shapeAddRef.current) {
      shapeAddRef.current(shapeType);
    }
  };

  const handleUndo = () => {
    if (fabricEventsRef.current && canUndo) {
      fabricEventsRef.current.undo();
    }
  };

  const handleUndoRedoStatusChange = (status) => {
    setCanUndo(status.canUndo);
    
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      navigate('/');
    }
  };

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <div className="space-y-3">
            <button
              onClick={initializeRoom}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected || !roomInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Connecting to room...</span>
          </div>
          <p className="text-gray-600">
            Setting up your collaborative whiteboard experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onClearCanvas={handleClearCanvas}
        onSaveCanvas={handleSaveCanvas}
        onAddShape={handleAddShape}
        onUndo={handleUndo}
        canUndo={canUndo}
        connectedUsers={connectedUsers}
        roomId={roomId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Canvas */}
        <div className={`flex-1 ${isChatOpen ? 'mr-80' : ''} transition-all duration-300`}>
          <Canvas
            socketManager={socketManager}
            currentTool={currentTool}
            currentColor={currentColor}
            brushSize={brushSize}
            onCanvasReady={handleCanvasReady}
            onShapeAdd={shapeAddRef}
            onUndoRedoStatusChange={handleUndoRedoStatusChange}
            roomId={roomId}
          />
        </div>
        
        {/* Chat Sidebar */}
        <ChatSidebar
          socketManager={socketManager}
          currentUser={currentUser}
          connectedUsers={connectedUsers}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
      
      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Room: <span className="font-mono">{roomInfo.name}</span>
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">
              {connectedUsers.length + 1} user{connectedUsers.length !== 0 ? 's' : ''} connected
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">
            Connected as: <span className="font-semibold">{currentUser.username}</span>
          </span>
          <button
            onClick={handleLeaveRoom}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            🚪 Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;