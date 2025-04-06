import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { CreateUserDTO, UpdateUserDTO } from '@models/dto/user.dto';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { ResponseUtil } from '@/utils/response.util';
import { createAuthMiddleware, hasRoles } from '@/middlewares/auth.middleware';
import { Container } from 'inversify';

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

@controller('/users')
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) { }

  @httpGet('/', auth)
  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAll();
      ResponseUtil.ok(res, users);
    } catch (error) {
      console.error('Error getting all users:', error);
      ResponseUtil.serverError(res, 'Failed to get users');
    }
  }

  @httpGet('/:id', auth, selfOrAdmin)
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        ResponseUtil.notFound(res, `User not found with id: ${req.params.id}`);
        return;
      }
      ResponseUtil.ok(res, user);
    } catch (error) {
      console.error(`Error getting user with ID ${req.params.id}:`, error);
      ResponseUtil.serverError(res, 'Failed to get user');
    }
  }

  @httpPost('/', auth, adminOnly)
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const newUser = await this.userService.create(userData);
      ResponseUtil.created(res, newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      ResponseUtil.badRequest(res, 'Failed to create user');
    }
  }

  @httpPut('/:id', auth, selfOrAdmin)
  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: UpdateUserDTO = req.body;
      const updatedUser = await this.userService.update(req.params.id, userData);
      if (!updatedUser) {
        ResponseUtil.notFound(res, `User not found with id: ${req.params.id}`);
        return;
      }
      ResponseUtil.ok(res, updatedUser);
    } catch (error) {
      console.error(`Error updating user with ID ${req.params.id}:`, error);
      ResponseUtil.badRequest(res, 'Failed to update user');
    }
  }

  @httpDelete('/:id', auth, adminOnly)
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.userService.delete(req.params.id);
      if (!deleted) {
        ResponseUtil.notFound(res, `User not found with id: ${req.params.id}`);
        return;
      }
      ResponseUtil.noContent(res);
    } catch (error) {
      console.error(`Error deleting user with ID ${req.params.id}:`, error);
      ResponseUtil.serverError(res, 'Failed to delete user');
    }
  }
} 