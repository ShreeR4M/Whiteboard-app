import React, { useState, useEffect, useRef } from 'react';

const ChatSidebar = ({ 
  socketManager, 
  currentUser, 
  connectedUsers, 
  isOpen, 
  onToggle 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socketManager) return;

    const handleChatMessage = (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: new Date()
      }]);
    };

    const handleUserTyping = (data) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers(prev => {
          const updated = prev.filter(user => user.userId !== data.userId);
          if (data.isTyping) {
            updated.push({ userId: data.userId, username: data.username });
          }
          return updated;
        });
      }
    };

    // Setup socket listeners
    socketManager.on('chat-message', handleChatMessage);
    socketManager.on('user-typing', handleUserTyping);

    return () => {
      socketManager.off('chat-message', handleChatMessage);
      socketManager.off('user-typing', handleUserTyping);
    };
  }, [socketManager, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketManager) return;

    socketManager.socket.emit('chat-message', {
      message: newMessage.trim(),
      userId: currentUser.id,
      username: currentUser.username
    });

    setNewMessage('');
    stopTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && socketManager) {
      setIsTyping(true);
      socketManager.socket.emit('user-typing', {
        userId: currentUser.id,
        username: currentUser.username,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && socketManager) {
      setIsTyping(false);
      socketManager.socket.emit('user-typing', {
        userId: currentUser.id,
        username: currentUser.username,
        isTyping: false
      });
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        title="Open Chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Chat</h3>
          <p className="text-sm opacity-90">
            {connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''} online
          </p>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:bg-blue-600 p-1 rounded"
          title="Close Chat"
        >
          ✕
        </button>
      </div>

      {/* Connected Users */}
      <div className="bg-gray-50 p-3 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Online Users</h4>
        <div className="space-y-1">
          {connectedUsers.map(user => (
            <div key={user.id} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {user.username}
                {user.id === currentUser.id && ' (You)'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.userId === currentUser.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.userId !== currentUser.id && (
                  <div className="text-xs font-medium mb-1">
                    {message.username}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
                <div className={`text-xs mt-1 ${
                  message.userId === currentUser.id 
                    ? 'text-blue-100' 
                    : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="text-xs text-gray-600">
                {typingUsers.map(user => user.username).join(', ')} 
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;