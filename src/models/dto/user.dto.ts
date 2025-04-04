/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDTO:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: User's password
 *       example:
 *         email: user@example.com
 *         name: John Doe
 *         password: password123
 */
// For creating a new user
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: User's password
 *         isActive:
 *           type: boolean
 *           description: User's account status
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *       example:
 *         email: user@example.com
 *         name: John Doe
 *         isActive: true
 */
// For updating a user
export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
  isActive?: boolean;
  lastLogin?: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponseDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: User's unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         isActive:
 *           type: boolean
 *           description: User's account status
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         email: user@example.com
 *         name: John Doe
 *         isActive: true
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T12:00:00.000Z"
 */
// For user responses
export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
} 