import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
    const savedUsername = localStorage.getItem('whiteboard-username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching rooms from:', `${API}/rooms`);
      const response = await axios.get(`${API}/rooms`);
      console.log('Response received:', response.data);
      
      if (response.data && response.data.rooms) {
        setRooms(response.data.rooms);
      } else if (Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received invalid data format from server');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        setError(`Server error: ${error.response.status}. ${error.response.data?.error || ''}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post(`${API}/rooms`, {
        name: newRoomName.trim(),
        isPublic: true,
        createdBy: username.trim()
      });

      if (response.data.success) {
        const roomId = response.data.room.id;
        localStorage.setItem('whiteboard-username', username.trim());
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = (roomId) => {
    if (!username.trim()) {
      setError('Please enter your username to join a room');
      return;
    }
    
    localStorage.setItem('whiteboard-username', username.trim());
    navigate(`/room/${roomId}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      createRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              🎨 Collaborative Whiteboard
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Draw, create, and collaborate in real-time with friends and colleagues from anywhere in the world
            </p>
            <div className="flex justify-center space-x-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span>Real-time sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span>Easy sharing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔧</span>
                <span>Powerful tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Room Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Room</h2>
            <p className="text-gray-600">Start a new collaborative whiteboard session</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Your Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                id="roomName"
                type="text"
                placeholder="Enter room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={createRoom}
              disabled={isLoading || !newRoomName.trim() || !username.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                '🚀 Create Room'
              )}
            </button>
          </div>
        </div>

        {/* Join Room Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Existing Room</h2>
            <p className="text-gray-600">Connect to an active whiteboard session</p>
          </div>

          {isLoading && rooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading rooms...</span>
              </div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Public Rooms Available</h3>
              <p className="text-gray-500 mb-4">Be the first to create a room and start collaborating!</p>
              <button
                onClick={fetchRooms}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                🔄 Refresh
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                          {room.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Created by: <span className="font-medium">{room.createdBy}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">{room.activeUsersCount}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      Created: {new Date(room.createdAt).toLocaleDateString()}
                    </div>
                    
                    <button
                      onClick={() => joinRoom(room.id)}
                      disabled={!username.trim()}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      🚪 Join Room
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={fetchRooms}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  🔄 Refresh Rooms
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;