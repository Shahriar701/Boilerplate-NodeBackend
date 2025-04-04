// For creating a new user
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

// For updating a user
export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
  isActive?: boolean;
  lastLogin?: Date;
}

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