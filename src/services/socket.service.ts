import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { injectable } from 'inversify';

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
  private events: SocketEvent[] = [];

  /**
   * Initialize Socket.IO server with HTTP server
   * @param httpServer HTTP server instance
   * @param options Socket.IO options
   */
  initialize(httpServer: HttpServer, options: any = {}): void {
    if (this.io) {
      console.warn('Socket.IO server already initialized');
      return;
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // In production, restrict this to specific origins
        methods: ['GET', 'POST'],
        credentials: true,
      },
      ...options,
    });

    console.log('Socket.IO server initialized');

    // Set up connection handler
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Register all events for this socket
      this.registerEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    // Register predefined events
    this.registerPredefinedEvents();
  }

  /**
   * Register a new socket event
   * @param event SocketEvent object with name and handler
   */
  registerEvent(event: SocketEvent): void {
    this.events.push(event);
    console.log(`Socket event registered: ${event.name}`);
  }

  /**
   * Register multiple socket events
   * @param events Array of SocketEvent objects
   */
  registerEvents(socket: Socket): void {
    this.events.forEach((event) => {
      socket.on(event.name, (...args: any[]) => event.handler(socket, ...args));
    });
  }

  /**
   * Register predefined events that should be available by default
   */
  private registerPredefinedEvents(): void {
    // Example: ping-pong event
    this.registerEvent({
      name: 'ping',
      handler: (socket: Socket) => {
        socket.emit('pong', { timestamp: Date.now() });
      },
    });
  }

  /**
   * Emit an event to all connected clients
   * @param event Event name
   * @param data Event data
   */
  emit(event: string, data: any): void {
    if (!this.io) {
      console.warn('Socket.IO server not initialized');
      return;
    }

    this.io.emit(event, data);
  }

  /**
   * Emit an event to a specific room
   * @param room Room name
   * @param event Event name
   * @param data Event data
   */
  emitToRoom(room: string, event: string, data: any): void {
    if (!this.io) {
      console.warn('Socket.IO server not initialized');
      return;
    }

    this.io.to(room).emit(event, data);
  }

  /**
   * Get the Socket.IO server instance
   * @returns Socket.IO server instance
   */
  getIO(): Server | null {
    return this.io;
  }
}

// Create namespace for event types
export namespace SocketEvents {
  // Example event types for messaging
  export const MESSAGE_SENT = 'message:sent';
  export const MESSAGE_RECEIVED = 'message:received';
  
  // Example event types for notifications
  export const NOTIFICATION_CREATED = 'notification:created';
  export const NOTIFICATION_READ = 'notification:read';

  // Example event types for real-time updates
  export const RESOURCE_CREATED = 'resource:created';
  export const RESOURCE_UPDATED = 'resource:updated';
  export const RESOURCE_DELETED = 'resource:deleted';
} 