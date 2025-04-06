import { injectable, inject } from 'inversify';
import { TYPES } from '@config/types';
import { BaseService } from './base.service';
import { IUserRepository } from '@repositories/mongo/user.repository';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { UserResponseDTO, CreateUserDTO, UpdateUserDTO } from '@/models/dto/user.dto';

@injectable()
export class UserService extends BaseService<any> implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private readonly userRepository: IUserRepository
  ) {
    super(userRepository);
  }

  public async findAll(): Promise<UserResponseDTO[]> {
    const users = await this.repository.findAll();
    return users.map(this.toResponseDTO);
  }

  public async findById(id: string): Promise<UserResponseDTO | null> {
    const user = await this.repository.findById(id);
    return user ? this.toResponseDTO(user) : null;
  }

  public async findByEmail(email: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toResponseDTO(user) : null;
  }

  public async create(data: CreateUserDTO): Promise<UserResponseDTO> {
    // Here you might want to hash the password before storing it
    const user = await this.repository.create(data);
    return this.toResponseDTO(user);
  }

  public async update(id: string, data: UpdateUserDTO): Promise<UserResponseDTO | null> {
    // If password is included, you should hash it here
    const user = await this.repository.update(id, data);
    return user ? this.toResponseDTO(user) : null;
  }

  // Helper method to transform database entity to response DTO
  private toResponseDTO(user: any): UserResponseDTO {
    return {
      id: user.id || user._id.toString(),
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
} 