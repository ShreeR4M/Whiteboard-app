const express = require('express');
const router = express.Router();
const {
  createRoom,
  getPublicRooms,
  getRoomById,
  saveCanvasData,
  getCanvasData
} = require('../controllers/roomController');

router.post('/rooms', createRoom);
router.get('/rooms', getPublicRooms);
router.get('/rooms/:roomId', getRoomById);
router.put('/rooms/:roomId/canvas', saveCanvasData);
router.get('/rooms/:roomId/canvas', getCanvasData);

module.exports = router;