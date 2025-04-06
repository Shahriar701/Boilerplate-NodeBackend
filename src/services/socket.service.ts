import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { injectable } from 'inversify';

/**
 * Event constants for standardized real-time communication
 */
export const SocketEvents = {
  // Message events
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',

  // Notification events
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_READ: 'notification:read',

  // Resource events for real-time CRUD operations
  RESOURCE_CREATED: 'resource:created',
  RESOURCE_UPDATED: 'resource:updated',
  RESOURCE_DELETED: 'resource:deleted'
};

/**
 * Interface for custom socket event handlers
 */
export interface SocketEventHandler {
  name: string;
  handler: (socket: Socket, ...args: any[]) => void;
}

/**
 * Interface for Socket.IO events and handlers
 */
export interface SocketEvent {
  name: string;
  handler: (socket: Socket, ...args: any[]) => void;
}

/**
 * Socket.IO service for WebSocket functionality
 */
@injectable()
export class SocketService {
  private io: Server | null = null;
  private events: SocketEventHandler[] = [];

  /**
   * Initialize the Socket.IO server
   * @param httpServer HTTP server instance
   */
  public initialize(httpServer: HttpServer): void {
    // Prevent multiple initializations
    if (this.io) {
      return;
    }

    // Create Socket.IO server with CORS configuration
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // In production, this should be configured more restrictively
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Set up connection handler
    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Register disconnect handler
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });

      // Register custom event handlers
      this.events.forEach(event => {
        socket.on(event.name, (...args: any[]) => {
          event.handler(socket, ...args);
        });
      });
    });
  }

  /**
   * Register a custom event handler
   * @param event Event handler object
   */
  public registerEvent(event: SocketEventHandler): void {
    this.events.push(event);
  }

  /**
   * Emit an event to all connected clients
   * @param event Event name
   * @param data Event data
   */
  public emit(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Emit an event to clients in a specific room
   * @param room Room name
   * @param event Event name
   * @param data Event data
   */
  public emitToRoom(room: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  /**
   * Get the Socket.IO server instance
   * @returns Socket.IO server instance or null if not initialized
   */
  public getIO(): Server | null {
    return this.io;
  }
} 