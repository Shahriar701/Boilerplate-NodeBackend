import { Container } from 'inversify';
import bcrypt from 'bcrypt';
import { TYPES } from '@config/types';
import { AuthService } from '../auth.service';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { ApiError } from '@/middlewares/error.middleware';
import { LoginDTO, RegisterDTO } from '@/models/dto/auth.dto';
import { UserResponseDTO } from '@/models/dto/user.dto';
import { generateToken } from '@/middlewares/auth.middleware';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

// Mock auth.middleware
jest.mock('@/middlewares/auth.middleware', () => ({
    generateToken: jest.fn()
}));

describe('AuthService', () => {
    let authService: AuthService;
    let mockUserService: jest.Mocked<IUserService>;
    let mockConfig: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock user service
        mockUserService = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        // Mock config
        mockConfig = {
            jwtSecret: 'test-secret',
            jwtExpiration: '1h'
        };

        // Setup container with mocks
        const container = new Container();
        container.bind<IUserService>(TYPES.IUserService).toConstantValue(mockUserService);
        container.bind(TYPES.IEnvironmentConfig).toConstantValue(mockConfig);

        // Create service instance
        authService = new AuthService(mockUserService, mockConfig);
    });

    describe('login', () => {
        it('should throw unauthorized error if user not found', async () => {
            // Arrange
            const loginDTO: LoginDTO = {
                email: 'test@example.com',
                password: 'password123'
            };
            mockUserService.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(authService.login(loginDTO)).rejects.toThrow(ApiError);
            await expect(authService.login(loginDTO)).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('should throw unauthorized error if password is invalid', async () => {
            // Arrange
            const loginDTO: LoginDTO = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            // Create a valid UserResponseDTO with password for mock
            const user = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Add password for bcrypt.compare
                password: 'hashedpassword',
                roles: ['user']
            } as UserResponseDTO & { password: string, roles: string[] };
            
            mockUserService.findByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(authService.login(loginDTO)).rejects.toThrow(ApiError);
            await expect(authService.login(loginDTO)).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('should return token and user data if credentials are valid', async () => {
            // Arrange
            const loginDTO: LoginDTO = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            // Create a valid UserResponseDTO with password for mock
            const user = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Add password for bcrypt.compare
                password: 'hashedpassword',
                roles: ['user']
            } as UserResponseDTO & { password: string, roles: string[] };
            
            mockUserService.findByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (generateToken as jest.Mock).mockReturnValue('test-token');

            // Act
            const result = await authService.login(loginDTO);

            // Assert
            expect(result).toEqual({
                token: 'test-token',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles
                }
            });
            expect(generateToken).toHaveBeenCalledWith(
                {
                    id: user.id,
                    email: user.email,
                    roles: user.roles
                },
                mockConfig.jwtSecret,
                mockConfig.jwtExpiration
            );
        });
    });

    describe('register', () => {
        it('should throw conflict error if email already exists', async () => {
            // Arrange
            const registerDTO: RegisterDTO = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            
            // Create a valid UserResponseDTO for mock
            const existingUser = {
                id: 'existinguser',
                email: 'test@example.com',
                name: 'Existing User',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            } as UserResponseDTO;
            
            mockUserService.findByEmail.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(authService.register(registerDTO)).rejects.toThrow(ApiError);
            await expect(authService.register(registerDTO)).rejects.toMatchObject({
                statusCode: 409,
                message: 'Email already registered'
            });
        });

        it('should create user and return token if email is new', async () => {
            // Arrange
            const registerDTO: RegisterDTO = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            mockUserService.findByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
            
            // Create a valid UserResponseDTO with roles for mock
            const createdUser = {
                id: 'newuser123',
                name: 'Test User',
                email: 'test@example.com',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                roles: ['user']
            } as UserResponseDTO & { roles: string[] };
            
            mockUserService.create.mockResolvedValue(createdUser);
            (generateToken as jest.Mock).mockReturnValue('test-token');

            // Act
            const result = await authService.register(registerDTO);

            // Assert
            expect(mockUserService.create).toHaveBeenCalledWith({
                ...registerDTO,
                password: 'hashedpassword',
                roles: ['user']
            });
            expect(result).toEqual({
                token: 'test-token',
                user: {
                    id: createdUser.id,
                    name: createdUser.name,
                    email: createdUser.email,
                    roles: createdUser.roles
                }
            });
            expect(generateToken).toHaveBeenCalledWith(
                {
                    id: createdUser.id,
                    email: createdUser.email,
                    roles: createdUser.roles
                },
                mockConfig.jwtSecret,
                mockConfig.jwtExpiration
            );
        });
    });
}); 