import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { IUserService } from '@services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '@models/dto/user.dto';

@controller('/users')
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) {}

  @httpGet('/')
  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  @httpGet('/:id')
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error(`Error getting user with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  @httpPost('/')
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const newUser = await this.userService.create(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Failed to create user' });
    }
  }

  @httpPut('/:id')
  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: UpdateUserDTO = req.body;
      const updatedUser = await this.userService.update(req.params.id, userData);
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(`Error updating user with ID ${req.params.id}:`, error);
      res.status(400).json({ error: 'Failed to update user' });
    }
  }

  @httpDelete('/:id')
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.userService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting user with ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
} 