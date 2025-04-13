import { Container } from 'inversify';
import { Request, Response } from 'express';
import { AuthController } from '../auth.controller';
import { TYPES } from '@config/types';
import { IAuthService } from '@/interfaces/auth.service.interfaces';
import { ResponseUtil } from '@/utils/response.util';
import { LoginDTO, RegisterDTO, AuthResponseDTO } from '@/models/dto/auth.dto';

// Mock ResponseUtil
jest.mock('@/utils/response.util', () => ({
    ResponseUtil: {
        ok: jest.fn(),
        created: jest.fn(),
        badRequest: jest.fn(),
        notFound: jest.fn(),
        serverError: jest.fn(),
        unauthorized: jest.fn(),
        forbidden: jest.fn()
    }
}));

describe('AuthController', () => {
    let container: Container;
    let authController: AuthController;
    let mockAuthService: jest.Mocked<IAuthService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock auth service
        mockAuthService = {
            login: jest.fn(),
            register: jest.fn()
        };

        // Setup container with mock service
        container = new Container();
        container.bind<IAuthService>(TYPES.IAuthService).toConstantValue(mockAuthService);

        // Create controller instance
        authController = new AuthController(mockAuthService);

        // Setup mock request and response
        mockRequest = {
            body: {}
        };
        mockResponse = {};
    });

    describe('login', () => {
        it('should call authService.login with login data and return the result', async () => {
            // Arrange
            const loginDTO: LoginDTO = {
                email: 'test@example.com',
                password: 'password123'
            };

            const authResponse: AuthResponseDTO = {
                token: 'test-token',
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com',
                    roles: ['user']
                }
            };

            mockRequest.body = loginDTO;
            mockAuthService.login.mockResolvedValue(authResponse);

            // Act
            await authController.login(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDTO);
            expect(ResponseUtil.ok).toHaveBeenCalledWith(mockResponse, authResponse);
        });

        it('should pass along any errors thrown by the auth service', async () => {
            // Arrange
            const loginDTO: LoginDTO = {
                email: 'invalid@example.com',
                password: 'wrong-password'
            };

            mockRequest.body = loginDTO;
            const error = new Error('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.login(mockRequest as Request, mockResponse as Response))
                .rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('should call authService.register with registration data and return the result', async () => {
            // Arrange
            const registerDTO: RegisterDTO = {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'password123'
            };

            const authResponse: AuthResponseDTO = {
                token: 'new-token',
                user: {
                    id: 'newuser123',
                    name: 'New User',
                    email: 'newuser@example.com',
                    roles: ['user']
                }
            };

            mockRequest.body = registerDTO;
            mockAuthService.register.mockResolvedValue(authResponse);

            // Act
            await authController.register(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockAuthService.register).toHaveBeenCalledWith(registerDTO);
            expect(ResponseUtil.created).toHaveBeenCalledWith(mockResponse, authResponse);
        });

        it('should pass along any errors thrown by the auth service', async () => {
            // Arrange
            const registerDTO: RegisterDTO = {
                name: 'Existing User',
                email: 'existing@example.com',
                password: 'password123'
            };

            mockRequest.body = registerDTO;
            const error = new Error('Email already registered');
            mockAuthService.register.mockRejectedValue(error);

            // Act & Assert
            await expect(authController.register(mockRequest as Request, mockResponse as Response))
                .rejects.toThrow('Email already registered');
        });
    });
}); 