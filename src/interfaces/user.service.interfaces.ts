import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '@models/dto/user.dto';

export interface IUserService {
    findAll(): Promise<UserResponseDTO[]>;
    findById(id: string): Promise<UserResponseDTO | null>;
    findByEmail(email: string): Promise<UserResponseDTO | null>;
    create(data: CreateUserDTO): Promise<UserResponseDTO>;
    update(id: string, data: UpdateUserDTO): Promise<UserResponseDTO | null>;
    delete(id: string): Promise<boolean>;
}
