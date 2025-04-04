import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { IUserService } from '@services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '@models/dto/user.dto';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
@controller('/users')
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private readonly userService: IUserService
  ) {}

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/UserResponseDTO'
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDTO'
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserDTO'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDTO'
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update a user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUserDTO'
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDTO'
   *       400:
   *         description: Invalid input
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete a user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       204:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
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