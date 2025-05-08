import { injectable, inject } from 'inversify';
import { DynamoBaseRepository } from './base.repository';
import { IDatabaseConnection } from '@database/database.interface';
import { TYPES } from '@config/types';
import { IEnvironmentConfig } from '@config/env.config';
import { IUser } from '@/interfaces/DbInterfaces';
import { IBaseRepository } from '@/interfaces/base.repository.interface';
import bcrypt from 'bcrypt';

export interface IUserRepository extends IBaseRepository<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
}

@injectable()
export class UserRepository extends DynamoBaseRepository<IUser> implements IUserRepository {
    protected readonly entityName: string = 'users';

    constructor(
        @inject(TYPES.IDatabaseConnection) dbConnection: IDatabaseConnection,
        @inject(TYPES.IEnvironmentConfig) config: IEnvironmentConfig
    ) {
        super(dbConnection, config);
        this.initTableName();
    }

    /**
     * Finds a user by email
     * @param email User email
     * @returns User entity or null if not found
     */
    public async findByEmail(email: string): Promise<IUser | null> {
        const users = await this.queryByIndex('EmailIndex', 'email', email);
        return users.length > 0 ? users[0] : null;
    }

    /**
     * Creates a new user with hashed password
     * @param userData User data
     * @returns Created user entity
     */
    public async create(userData: Partial<IUser>): Promise<IUser> {
        // Hash password if provided
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        // Ensure roles array exists
        if (!userData.roles || !userData.roles.length) {
            userData.roles = ['user'];
        }

        return super.create(userData);
    }

    /**
     * Updates a user
     * @param id User ID
     * @param userData User data to update
     * @returns Updated user entity
     */
    public async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
        // Hash password if it's being updated
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        return super.update(id, userData);
    }
} 