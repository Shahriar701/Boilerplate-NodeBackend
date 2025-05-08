import 'reflect-metadata';
import dotenv from 'dotenv';
import { container } from '@config/inversify.config';
import { TYPES } from '@config/types';
import { IDatabaseConnection } from '@database/database.interface';
import { IAuthService } from '@/interfaces/auth.service.interfaces';
import { RegisterDTO } from '@/models/dto/auth.dto';

// Load environment variables
dotenv.config();

async function createUser() {
    try {
        console.log('Starting user creation process...');

        // Connect to the database
        const dbConnection = container.get<IDatabaseConnection>(TYPES.IDatabaseConnection);
        await dbConnection.connect();
        console.log('Database connected successfully');

        // Get the auth service
        const authService = container.get<IAuthService>(TYPES.IAuthService);

        // User data
        const userData: RegisterDTO = {
            name: 'Shahriar',
            email: 'shahriar701@email.com',
            password: 'Password123!'
        };

        try {
            const result = await authService.register(userData);
            console.log('User created successfully:');
            console.log(`- Name: ${result.user.name}`);
            console.log(`- Email: ${result.user.email}`);
            console.log(`- ID: ${result.user.id}`);
            console.log(`- Roles: ${result.user.roles?.join(', ') || 'none'}`);
            console.log(`- Token: ${result.token}`);
        } catch (error) {
            console.error('Failed to create user:', error);
        }

        // Disconnect from database
        await dbConnection.disconnect();
        console.log('Database disconnected');

        process.exit(0);
    } catch (error) {
        console.error('User creation failed:', error);
        process.exit(1);
    }
}

// Run the function
createUser(); 