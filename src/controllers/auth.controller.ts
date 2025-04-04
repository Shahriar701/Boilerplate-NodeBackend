import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { IEnvironmentConfig } from '@config/env.config';
import { IUserService } from '@services/user.service';
import { generateToken } from '@middlewares/auth.middleware';
import { validateBody, Validators } from '@middlewares/validation.middleware';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication API
 * 
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *       example:
 *         email: user@example.com
 *         password: password123
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         user:
 *           $ref: '#/components/schemas/UserResponseDTO'
 */
@controller('/auth')
export class AuthController {
  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService,
    @inject(TYPES.IEnvironmentConfig) private readonly config: IEnvironmentConfig
  ) {}

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login to the application
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Invalid credentials
   *       401:
   *         description: Authentication failed
   *       500:
   *         description: Server error
   */
  @httpPost('/login', validateBody<{ email: string; password: string }>({
    email: Validators.email,
    password: Validators.required
  }))
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // For demonstration purposes
      // In a real application, you'd verify the user's credentials against a database
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        res.status(401).json({ message: 'Authentication failed' });
        return;
      }
      
      // In a real app, validate password with bcrypt or similar
      // For demo, we'll assume the password is correct
      
      // Generate JWT token
      const token = generateToken(
        { id: user.id, email: user.email, roles: ['user'] },
        this.config.jwtSecret,
        this.config.jwtExpiresIn
      );
      
      res.json({
        token,
        user
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 