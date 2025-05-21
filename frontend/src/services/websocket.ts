import { io, Socket } from 'socket.io-client';
import { useSnackbar } from 'notistack';

class WebSocketService {
  private socket: Socket | null = null;
  private static instance: WebSocketService;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect() {
    if (!this.socket) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      this.socket = io(apiUrl, {
        path: '/ws',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToIdeaUpdates(ideaId: string, callback: (data: any) => void) {
    const socket = this.connect();
    socket.emit('subscribe:idea', ideaId);
    socket.on(`idea:${ideaId}`, callback);
  }

  subscribeToExperimentUpdates(experimentId: string, callback: (data: any) => void) {
    const socket = this.connect();
    socket.emit('subscribe:experiment', experimentId);
    socket.on(`experiment:${experimentId}`, callback);
  }

  unsubscribeFromIdeaUpdates(ideaId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:idea', ideaId);
      this.socket.off(`idea:${ideaId}`);
    }
  }

  unsubscribeFromExperimentUpdates(experimentId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:experiment', experimentId);
      this.socket.off(`experiment:${experimentId}`);
    }
  }
}

export const websocketService = WebSocketService.getInstance(); 