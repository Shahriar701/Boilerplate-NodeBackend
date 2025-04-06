/**
 * User Controller
 * 
 * Demonstrates best practices for handling HTTP requests in Express:
 * 1. Uses ResponseUtil for successful responses
 * 2. Throws ApiError instances for error cases
 * 3. Lets the global error middleware handle errors consistently
 */
import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { CreateUserDTO, UpdateUserDTO } from '@models/dto/user.dto';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { ResponseUtil } from '@/utils/response.util';
import { createAuthMiddleware, hasRoles } from '@/middlewares/auth.middleware';
import { Container } from 'inversify';
import { ApiError } from '@/middlewares/error.middleware';

// Get the container from the server context
const getContainer = (req: Request): Container => {
  return (req as any).container;
};

// Auth middleware factory
const auth = (req: Request, res: Response, next: NextFunction) => {
  return createAuthMiddleware(getContainer(req))(req, res, next);
};

// Admin role check middleware
const adminOnly = hasRoles(['admin']);

// Check if user is accessing their own profile or is an admin
const selfOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.params.id;
  const currentUser = req.user;

  if (!currentUser) {
    ResponseUtil.unauthorized(res, 'User not authenticated');
    return;
  }

  // Allow if the user is accessing their own data or is an admin
  if (currentUser.id === userId || (currentUser.roles && currentUser.roles.includes('admin'))) {
    next();
  } else {
    ResponseUtil.forbidden(res, 'Access denied: You can only access your own profile');
  }
};

/**
 * User Controller
 * 
 * Demonstrates best practices for handling HTTP requests in Express:
 * 1. Uses ResponseUtil for successful responses
 * 2. Throws ApiError instances for error cases
 * 3. Lets the global error middleware handle errors consistently
 */
@controller('/users')
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) { }

  @httpGet('/', auth)
  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.findAll();
    ResponseUtil.ok(res, users);
  }

  @httpGet('/:id', auth, selfOrAdmin)
  public async getUserById(req: Request, res: Response): Promise<void> {
    const user = await this.userService.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound(`User not found with id: ${req.params.id}`);
    }
    ResponseUtil.ok(res, user);
  }

  @httpPost('/', auth, adminOnly)
  public async createUser(req: Request, res: Response): Promise<void> {
    const userData: CreateUserDTO = req.body;
    const newUser = await this.userService.create(userData);
    ResponseUtil.created(res, newUser);
  }

  @httpPut('/:id', auth, selfOrAdmin)
  public async updateUser(req: Request, res: Response): Promise<void> {
    const userData: UpdateUserDTO = req.body;
    const updatedUser = await this.userService.update(req.params.id, userData);
    if (!updatedUser) {
      throw ApiError.notFound(`User not found with id: ${req.params.id}`);
    }
    ResponseUtil.ok(res, updatedUser);
  }

  @httpDelete('/:id', auth, adminOnly)
  public async deleteUser(req: Request, res: Response): Promise<void> {
    const deleted = await this.userService.delete(req.params.id);
    if (!deleted) {
      throw ApiError.notFound(`User not found with id: ${req.params.id}`);
    }
    ResponseUtil.noContent(res);
  }
} 