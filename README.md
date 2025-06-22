# Collaborative Whiteboard Application

A real-time collaborative whiteboard application that allows multiple users to draw, edit, and share ideas in a collaborative virtual space.

## Features

- **Real-time Collaboration**: Draw and see others' drawing in real-time
- **Multiple Drawing Tools**: Pen, eraser, shapes (rectangle, circle), and text
- **Tool Customization**: Adjustable brush size and color
- **Object Management**: Select, move, and delete objects
- **Undo Functionality**: Revert previous actions
- **Room-based Collaboration**: Join specific rooms using room IDs
- **User Presence**: See who's connected to your whiteboard
- **Canvas Management**: Clear canvas and save drawings

## Tech Stack

### Frontend
- React.js
- Fabric.js (canvas manipulation library)
- Socket.io Client (real-time communication)
- Tailwind CSS (styling)

### Backend
- Node.js
- Express
- Socket.io (WebSocket implementation)
- MongoDB & Mongoose (data persistence)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB instance

### Installation

1. Clone the repository
```bash
git clone git@github.com:ShreeR4M/Whiteboard-app.git
cd Whiteboard-app
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard
```

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend development server
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Creating/Joining a Room**:
   - Enter a room ID or use the generated one
   - Share the room ID with others to collaborate

2. **Drawing**:
   - Select the pen tool and draw directly on the canvas
   - Change color and brush size using the toolbar

3. **Adding Shapes**:
   - Select a shape from the toolbar
   - Click and drag on the canvas to create

4. **Managing Objects**:
   - Use the select tool to click on objects
   - Move, resize, or delete selected objects

5. **Undo**:
   - Click the undo button or press Ctrl+Z/Cmd+Z

6. **Saving Work**:
   - Click the save button to download your whiteboard as an image

## Screenshots

![image](https://github.com/user-attachments/assets/c8bd0f8c-ae86-47a2-8406-de4241d3d2f6)
![image](https://github.com/user-attachments/assets/aae8dc49-7d46-4221-ac78-df35ca80c084)



## Future Enhancements

- User authentication and persistent rooms
- Drawing layers
- More shape options
- Templates and backgrounds
- Mobile responsiveness
- Export to different formats (PDF, SVG)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Fabric.js for the powerful canvas manipulation library
- Socket.io for making real-time communication straightforward
- The React team for the amazing frontend framework

---

*Built with ❤️ by Shree*
