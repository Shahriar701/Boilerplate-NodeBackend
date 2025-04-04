import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SocketService, SocketEvents } from './socket.service';

// Create a mock for the Socket.IO Server
const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockTo = jest.fn(() => ({ emit: mockEmit }));
const mockServer = {
  on: mockOn,
  emit: mockEmit,
  to: mockTo
};

// Mock socket.io
jest.mock('socket.io', () => {
  return {
    Server: jest.fn().mockImplementation(() => mockServer)
  };
});

describe('Socket Service', () => {
  let socketService: SocketService;
  let mockHttpServer: Partial<HttpServer>;
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    socketService = new SocketService();
    mockHttpServer = {};
    mockSocket = {
      id: 'socket-id-123',
      on: jest.fn(),
      emit: jest.fn()
    };
    
    // Initialize Socket.IO
    socketService.initialize(mockHttpServer as HttpServer);
  });

  describe('initialize', () => {
    it('should create a new Socket.IO server', () => {
      expect(Server).toHaveBeenCalledWith(mockHttpServer, expect.objectContaining({
        cors: expect.any(Object)
      }));
    });

    it('should set up connection handler', () => {
      expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should do nothing if already initialized', () => {
      jest.clearAllMocks();
      socketService.initialize(mockHttpServer as HttpServer);
      
      expect(Server).not.toHaveBeenCalled();
    });

    it('should set up connection listeners', () => {
      // Get the connection handler
      const connectionHandler = mockOn.mock.calls[0][1];
      
      // Trigger connection event
      connectionHandler(mockSocket);
      
      // Check that disconnect handler is set up
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('registerEvent', () => {
    it('should add a new event to the events array', () => {
      const handler = jest.fn();
      const event = { name: 'test-event', handler };
      
      socketService.registerEvent(event);
      
      // Get the connection handler
      const connectionHandler = mockOn.mock.calls[0][1];
      
      // Trigger connection event
      connectionHandler(mockSocket);
      
      // Check that event is registered for the socket
      expect(mockSocket.on).toHaveBeenCalledWith('test-event', expect.any(Function));
    });
  });

  describe('emit', () => {
    it('should emit event to all connected clients', () => {
      socketService.emit('test-event', { data: 'test-data' });
      
      expect(mockEmit).toHaveBeenCalledWith('test-event', { data: 'test-data' });
    });

    it('should not emit if Socket.IO is not initialized', () => {
      // Create a new service without initializing
      const newService = new SocketService();
      
      newService.emit('test-event', { data: 'test-data' });
      
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  describe('emitToRoom', () => {
    it('should emit event to a specific room', () => {
      socketService.emitToRoom('test-room', 'test-event', { data: 'test-data' });
      
      expect(mockTo).toHaveBeenCalledWith('test-room');
      expect(mockEmit).toHaveBeenCalledWith('test-event', { data: 'test-data' });
    });

    it('should not emit if Socket.IO is not initialized', () => {
      // Create a new service without initializing
      const newService = new SocketService();
      
      newService.emitToRoom('test-room', 'test-event', { data: 'test-data' });
      
      expect(mockTo).not.toHaveBeenCalled();
    });
  });

  describe('getIO', () => {
    it('should return the Socket.IO server instance', () => {
      const io = socketService.getIO();
      
      expect(io).toBe(mockServer);
    });

    it('should return null if Socket.IO is not initialized', () => {
      // Create a new service without initializing
      const newService = new SocketService();
      
      const io = newService.getIO();
      
      expect(io).toBeNull();
    });
  });

  describe('SocketEvents', () => {
    it('should define message event constants', () => {
      expect(SocketEvents.MESSAGE_SENT).toBe('message:sent');
      expect(SocketEvents.MESSAGE_RECEIVED).toBe('message:received');
    });

    it('should define notification event constants', () => {
      expect(SocketEvents.NOTIFICATION_CREATED).toBe('notification:created');
      expect(SocketEvents.NOTIFICATION_READ).toBe('notification:read');
    });

    it('should define resource event constants', () => {
      expect(SocketEvents.RESOURCE_CREATED).toBe('resource:created');
      expect(SocketEvents.RESOURCE_UPDATED).toBe('resource:updated');
      expect(SocketEvents.RESOURCE_DELETED).toBe('resource:deleted');
    });
  });
}); 