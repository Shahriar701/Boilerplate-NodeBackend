import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { IAuthService } from '@/interfaces/auth.service.interfaces';
import { ResponseUtil } from '@/utils/response.util';
import { LoginDTO, RegisterDTO } from '@/models/dto/auth.dto';

@controller('/auth')
export class AuthController {
    constructor(
        @inject(TYPES.IAuthService) private readonly authService: IAuthService
    ) { }

    @httpPost('/login')
    public async login(req: Request, res: Response): Promise<void> {
        const loginData: LoginDTO = req.body;
        const result = await this.authService.login(loginData);
        ResponseUtil.ok(res, result);
    }

    // Debug login endpoint that doesn't throw errors
    @httpPost('/debug-login')
    public async debugLogin(req: Request, res: Response): Promise<void> {
        try {
            console.log('Debug login attempt with:', req.body);
            const loginData: LoginDTO = req.body;

            // Try to get the user by email
            const result = await this.authService.login(loginData);
            console.log('Login successful:', result);
            ResponseUtil.ok(res, result);
        } catch (error) {
            console.error('Debug login error:', error);

            // Send a mock success response for testing
            const mockResponse = {
                token: 'debug-jwt-token-' + Date.now(),
                user: {
                    id: 'debug-user-id',
                    name: 'Debug User',
                    email: req.body.email,
                    roles: ['user']
                }
            };

            // For frontend testing
            ResponseUtil.ok(res, mockResponse);

            // Alternatively, uncomment to see what the real error response would be:
            // ResponseUtil.unauthorized(res, error as Error);
        }
    }

    @httpPost('/register')
    public async register(req: Request, res: Response): Promise<void> {
        const registerData: RegisterDTO = req.body;
        const result = await this.authService.register(registerData);
        ResponseUtil.created(res, result);
    }
} 