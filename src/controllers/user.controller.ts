/**
 * User Controller
 * 
 * Demonstrates best practices for handling HTTP requests in Express:
 * 1. Uses ResponseUtil for successful responses
 * 2. Throws ApiError instances for error cases
 * 3. Lets the global error middleware handle errors consistently
 */
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { IUserService } from '../interfaces/user.service.interfaces';
import { CreateUserDTO, UpdateUserDTO } from '@models/dto/user.dto';
import { ResponseUtil } from '@/utils/response.util';
import { ApiError } from '@/middlewares/error.middleware';

@controller('/users')
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) { }

  @httpGet('/')
  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.findAll();
    ResponseUtil.ok(res, users);
  }

  @httpGet('/:id')
  public async getUserById(req: Request, res: Response): Promise<void> {
    const user = await this.userService.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    ResponseUtil.ok(res, user);
  }

  @httpPost('/')
  public async createUser(req: Request, res: Response): Promise<void> {
    const userData: CreateUserDTO = req.body;
    const newUser = await this.userService.create(userData);
    ResponseUtil.created(res, newUser);
  }

  @httpPut('/:id')
  public async updateUser(req: Request, res: Response): Promise<void> {
    const userData: UpdateUserDTO = req.body;
    const updatedUser = await this.userService.update(req.params.id, userData);
    if (!updatedUser) {
      throw ApiError.notFound('User not found');
    }
    ResponseUtil.ok(res, updatedUser);
  }

  @httpDelete('/:id')
  public async deleteUser(req: Request, res: Response): Promise<void> {
    const deleted = await this.userService.delete(req.params.id);
    if (!deleted) {
      throw ApiError.notFound('User not found');
    }
    ResponseUtil.noContent(res);
  }
} 