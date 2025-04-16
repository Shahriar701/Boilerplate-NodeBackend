import { LoginDTO, RegisterDTO, AuthResponseDTO } from '@/models/dto/auth.dto';

export interface IAuthService {
    login(loginDTO: LoginDTO): Promise<AuthResponseDTO>;
    register(registerDTO: RegisterDTO): Promise<AuthResponseDTO>;
} 