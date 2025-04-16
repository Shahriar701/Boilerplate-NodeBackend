import { inject, injectable } from 'inversify';
import { TYPES } from '@config/types';
import { IAuthService } from '@/interfaces/auth.service.interfaces';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { LoginDTO, RegisterDTO, AuthResponseDTO } from '@/models/dto/auth.dto';
import { generateToken } from '@/middlewares/auth.middleware';
import { ApiError } from '@/middlewares/error.middleware';
import { IEnvironmentConfig } from '@/interfaces/environment.interface';
import bcrypt from 'bcrypt';

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TYPES.IUserService) private readonly userService: IUserService,
        @inject(TYPES.IEnvironmentConfig) private readonly config: IEnvironmentConfig
    ) { }

    async login(loginDTO: LoginDTO): Promise<AuthResponseDTO> {
        console.log('Login attempt with email:', loginDTO.email);
        
        const user = await this.userService.findByEmail(loginDTO.email);
        console.log('User found:', user ? 'Yes' : 'No');
        console.log('User details:', JSON.stringify({
            id: user?.id,
            email: user?.email,
            name: user?.name,
            hasPassword: !!user?.password,
            passwordLength: user?.password?.length,
            roles: user?.roles
        }, null, 2));
        
        if (!user) {
            console.log('User not found');
            throw ApiError.unauthorized('Invalid credentials');
        }
        
        console.log('User has password:', user.password ? 'Yes' : 'No');
        
        if (!user.password) {
            console.log('User has no password');
            throw ApiError.unauthorized('Invalid credentials');
        }
        
        console.log('Comparing passwords...');
        console.log('Input password:', loginDTO.password ? '[PROVIDED]' : '[EMPTY]');
        console.log('Stored password (hash):', user.password ? '[HASH PRESENT]' : '[NO HASH]');
        
        try {
            const isPasswordValid = await bcrypt.compare(loginDTO.password, user.password);
            console.log('Password valid:', isPasswordValid ? 'Yes' : 'No');
            
            if (!isPasswordValid) {
                console.log('Password invalid');
                throw ApiError.unauthorized('Invalid credentials');
            }
            
            console.log('Generating token...');
            
            const token = generateToken(
                {
                    id: user.id,
                    email: user.email,
                    roles: user.roles || []
                },
                this.config.jwtSecret,
                this.config.jwtExpiresIn
            );

            // Update last login time
            await this.userService.update(user.id, {
                lastLogin: new Date()
            });

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles || []
                }
            };
        } catch (error) {
            console.error('Error during password comparison:', error);
            throw ApiError.unauthorized('Invalid credentials');
        }
    }

    async register(registerDTO: RegisterDTO): Promise<AuthResponseDTO> {
        const existingUser = await this.userService.findByEmail(registerDTO.email);

        if (existingUser) {
            throw ApiError.conflict('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(registerDTO.password, 10);
        const user = await this.userService.create({
            ...registerDTO,
            password: hashedPassword,
            roles: ['user']
        });

        const token = generateToken(
            {
                id: user.id,
                email: user.email,
                roles: user.roles
            },
            this.config.jwtSecret,
            this.config.jwtExpiresIn
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles
            }
        };
    }
} 