# Collaborative Whiteboard App

## Project Description

The Collaborative Whiteboard App is a real-time drawing and collaboration platform that allows multiple users to work together on a shared canvas. This interactive workspace enables teams to brainstorm ideas, create diagrams, annotate documents, and communicate through an integrated chat system—all in real-time from anywhere in the world.

The application features a responsive design that works across devices, intuitive drawing tools, and seamless WebSocket communication for instant collaboration. Whether you're conducting remote meetings, planning projects, teaching online classes, or simply sketching ideas with friends, this whiteboard app provides the perfect digital canvas for collaboration.

## Features

### Canvas & Drawing Features
- **Real-time drawing** with synchronized updates across all connected users
- **Multiple drawing tools** including pen, eraser, shapes (rectangles, circles)
- **Text tool** for adding text annotations
- **Color picker** with customizable color options
- **Adjustable brush sizes** for different drawing styles
- **Undo functionality** to revert changes
- **Selection tool** for modifying existing elements

### Collaboration Features
- **Real-time collaboration** with changes visible instantly to all participants
- **User presence indicators** showing who is currently connected
- **Room-based system** allowing multiple separate whiteboard sessions
- **Persistent canvas** that saves between sessions
- **Integrated chat system** for communication alongside the whiteboard

### User Experience
- **Simple room creation** and joining process
- **Custom usernames** for easy identification
- **Responsive design** that works across devices
- **Visual indicators** showing connection status and actions
- **Canvas export** functionality for saving work locally

## Tech Stack

### Frontend
- **React.js** - UI component library
- **Fabric.js** - HTML5 canvas library for interactive objects
- **Socket.io (Client)** - Real-time bidirectional event-based communication
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io (Server)** - WebSocket server implementation
- **MongoDB** - NoSQL database for storing room and canvas data
- **Mongoose** - MongoDB object modeling

### DevOps & Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database service

## Setup Instructions

### Prerequisites
- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MongoDB (local installation or Atlas account)

### Local Development Setup

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/whiteboard-app.git
cd whiteboard-app
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following content
echo "PORT=8001
MONGO_URI=mongodb://localhost:27017/whiteboard_app
NODE_ENV=development" > .env

# Start the backend server
npm start
```

#### 3. Frontend Setup
```bash
# Open a new terminal window and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with the following content
echo "REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_BACKEND_WS_URL=ws://localhost:8001" > .env

# Start the frontend development server
npm start
```

#### 4. Access the application
Open your browser and navigate to `http://localhost:3000`

### MongoDB Setup
- For local development, ensure MongoDB is running on your machine
- For production, create a MongoDB Atlas cluster and update the MONGO_URI in the backend .env file

## Deployed Demo

You can try out the application at our live demo:

## Usage Guide

1. **Create or Join a Room**
   - Enter your username
   - Create a new room or join an existing one

2. **Use the Drawing Tools**
   - Select tools from the toolbar at the top
   - Choose colors and adjust brush sizes
   - Draw on the canvas using your mouse or touch input

3. **Collaborate with Others**
   - Share the room URL with collaborators
   - Chat with other users using the integrated chat panel
   - See real-time updates as others draw

4. **Save Your Work**
   - Use the save button to download the canvas as a PNG image
   - The canvas state is automatically saved to the server

## Future Enhancements

- Additional drawing tools (lines, arrows, polygons)
- Zoom and pan functionality
- User permissions and role-based access
- Private rooms with password protection
- Additional export formats (PDF, SVG)
- Mobile app version
- Custom templates for different use cases

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
Vercel: https://whiteboard-app-hpqk.vercel.app/
## Acknowledgements

- Fabric.js for the powerful canvas manipulation library
- Socket.io for enabling real-time communication
- The React and Node.js communities for excellent documentation and support
