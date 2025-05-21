from fastapi import WebSocket
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections by client ID
        self.active_connections: Dict[str, WebSocket] = {}
        # Store idea subscriptions by idea ID
        self.idea_subscriptions: Dict[str, Set[str]] = {}
        # Store experiment subscriptions by experiment ID
        self.experiment_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            # Clean up subscriptions
            for idea_id in self.idea_subscriptions:
                self.idea_subscriptions[idea_id].discard(client_id)
            for experiment_id in self.experiment_subscriptions:
                self.experiment_subscriptions[experiment_id].discard(client_id)
            logger.info(f"Client {client_id} disconnected")

    async def subscribe_to_idea(self, client_id: str, idea_id: str):
        if idea_id not in self.idea_subscriptions:
            self.idea_subscriptions[idea_id] = set()
        self.idea_subscriptions[idea_id].add(client_id)
        logger.info(f"Client {client_id} subscribed to idea {idea_id}")

    def unsubscribe_from_idea(self, client_id: str, idea_id: str):
        if idea_id in self.idea_subscriptions:
            self.idea_subscriptions[idea_id].discard(client_id)
            logger.info(f"Client {client_id} unsubscribed from idea {idea_id}")

    async def subscribe_to_experiment(self, client_id: str, experiment_id: str):
        if experiment_id not in self.experiment_subscriptions:
            self.experiment_subscriptions[experiment_id] = set()
        self.experiment_subscriptions[experiment_id].add(client_id)
        logger.info(f"Client {client_id} subscribed to experiment {experiment_id}")

    def unsubscribe_from_experiment(self, client_id: str, experiment_id: str):
        if experiment_id in self.experiment_subscriptions:
            self.experiment_subscriptions[experiment_id].discard(client_id)
            logger.info(f"Client {client_id} unsubscribed from experiment {experiment_id}")

    async def broadcast_idea_update(self, idea_id: str, data: dict):
        if idea_id in self.idea_subscriptions:
            message = json.dumps({
                "type": "idea_update",
                "data": data
            })
            for client_id in self.idea_subscriptions[idea_id]:
                if client_id in self.active_connections:
                    try:
                        await self.active_connections[client_id].send_text(message)
                    except Exception as e:
                        logger.error(f"Error sending message to client {client_id}: {str(e)}")

    async def broadcast_experiment_update(self, experiment_id: str, data: dict):
        if experiment_id in self.experiment_subscriptions:
            message = json.dumps({
                "type": "experiment_update",
                "data": data
            })
            for client_id in self.experiment_subscriptions[experiment_id]:
                if client_id in self.active_connections:
                    try:
                        await self.active_connections[client_id].send_text(message)
                    except Exception as e:
                        logger.error(f"Error sending message to client {client_id}: {str(e)}")

# Create a singleton instance
manager = ConnectionManager() 