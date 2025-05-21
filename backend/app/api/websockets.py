from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import manager
import uuid
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            try:
                # Receive and parse the message
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message["type"] == "subscribe:idea":
                    await manager.subscribe_to_idea(client_id, message["idea_id"])
                elif message["type"] == "unsubscribe:idea":
                    manager.unsubscribe_from_idea(client_id, message["idea_id"])
                elif message["type"] == "subscribe:experiment":
                    await manager.subscribe_to_experiment(client_id, message["experiment_id"])
                elif message["type"] == "unsubscribe:experiment":
                    manager.unsubscribe_from_experiment(client_id, message["experiment_id"])
                else:
                    logger.warning(f"Unknown message type: {message['type']}")
                    
            except json.JSONDecodeError:
                logger.error("Invalid JSON message received")
                continue
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(client_id) 