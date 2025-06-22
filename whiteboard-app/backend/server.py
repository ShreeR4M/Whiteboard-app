from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()

api_router = APIRouter(prefix="/api")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.room_users: Dict[str, List[Dict[str, Any]]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, username: str):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.room_users[room_id] = []
        
        self.active_connections[room_id].append(websocket)
        
        user_info = {"user_id": user_id, "username": username, "websocket": websocket}
        self.room_users[room_id].append(user_info)
        
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "user_id": user_id,
            "username": username,
            "users_count": len(self.room_users[room_id])
        }, exclude_websocket=websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            
            self.room_users[room_id] = [
                user for user in self.room_users[room_id] 
                if user["websocket"] != websocket
            ]
            
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                del self.room_users[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_websocket: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude_websocket:
                    try:
                        await connection.send_text(json.dumps(message))
                    except:
                        # Remove broken connections
                        self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    canvas_data: Optional[str] = None

class RoomCreate(BaseModel):
    name: str
    is_public: bool = True
    created_by: str

class DrawingEvent(BaseModel):
    room_id: str
    user_id: str
    event_type: str  
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

@api_router.get("/")
async def root():
    return {"message": "Collaborative Whiteboard API"}

@api_router.post("/rooms", response_model=Room)
async def create_room(room_data: RoomCreate):
    room = Room(**room_data.dict())
    await db.rooms.insert_one(room.dict())
    return room

@api_router.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str):
    room = await db.rooms.find_one({"id": room_id})
    if room:
        return Room(**room)
    return {"error": "Room not found"}

@api_router.get("/rooms", response_model=List[Room])
async def get_public_rooms():
    rooms = await db.rooms.find({"is_public": True}).to_list(100)
    return [Room(**room) for room in rooms]

@api_router.put("/rooms/{room_id}/canvas")
async def save_canvas(room_id: str, canvas_data: dict):
    result = await db.rooms.update_one(
        {"id": room_id},
        {"$set": {"canvas_data": json.dumps(canvas_data)}}
    )
    return {"success": result.modified_count > 0}

@api_router.get("/rooms/{room_id}/canvas")
async def get_canvas(room_id: str):
    room = await db.rooms.find_one({"id": room_id})
    if room and room.get("canvas_data"):
        return {"canvas_data": json.loads(room["canvas_data"])}
    return {"canvas_data": None}

@app.websocket("/ws/{room_id}/{user_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str, username: str):
    await manager.connect(websocket, room_id, user_id, username)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") in ["draw", "erase", "clear", "undo", "redo"]:
                drawing_event = DrawingEvent(
                    room_id=room_id,
                    user_id=user_id,
                    event_type=message["type"],
                    data=message.get("data", {})
                )
                await db.drawing_events.insert_one(drawing_event.dict())
            
            await manager.broadcast_to_room(room_id, message, exclude_websocket=websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast_to_room(room_id, {
            "type": "user_left",
            "user_id": user_id,
            "username": username,
            "users_count": len(manager.room_users.get(room_id, []))
        })

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()