import { UserService } from '@services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '@models/dto/user.dto';

// Mock repository
const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Test data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserResponse = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  isActive: true,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockRepository as any);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockRepository.findAll.mockResolvedValue([mockUser]);

      const result = await userService.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUserResponse]);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById('1');

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUserResponse);
    });

    it('should return null if user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await userService.findById('999');

      expect(mockRepository.findById).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDTO: CreateUserDTO = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };

      const newUser = {
        ...mockUser,
        ...createUserDTO,
      };

      mockRepository.create.mockResolvedValue(newUser);

      const result = await userService.create(createUserDTO);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDTO);
      expect(result).toEqual({
        ...mockUserResponse,
        email: 'new@example.com',
        name: 'New User',
      });
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDTO: UpdateUserDTO = {
        name: 'Updated Name',
      };

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update('1', updateUserDTO);

      expect(mockRepository.update).toHaveBeenCalledWith('1', updateUserDTO);
      expect(result).toEqual({
        ...mockUserResponse,
        name: 'Updated Name',
      });
    });

    it('should return null if user to update not found', async () => {
      mockRepository.update.mockResolvedValue(null);

      const result = await userService.update('999', { name: 'Updated Name' });

      expect(mockRepository.update).toHaveBeenCalledWith('999', { name: 'Updated Name' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await userService.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false if user to delete not found', async () => {
      mockRepository.delete.mockResolvedValue(false);

      const result = await userService.delete('999');

      expect(mockRepository.delete).toHaveBeenCalledWith('999');
      expect(result).toBe(false);
    });
  });
}); 