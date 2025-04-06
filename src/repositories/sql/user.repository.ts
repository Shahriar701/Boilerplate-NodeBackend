import { injectable, inject } from 'inversify';
import { IDatabaseConnection } from '@database/database.interface';
import { TYPES } from '@config/types';
import { User } from '@models/sql/user.entity';
import { TypeOrmBaseRepository } from './base.repository';
import { IBaseRepository } from '../../interfaces/base.repository.interface';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}

@injectable()
export class UserRepository extends TypeOrmBaseRepository<User> implements IUserRepository {
  protected readonly entityName = 'User';

  constructor(
    @inject(TYPES.IDatabaseConnection) dbConnection: IDatabaseConnection
  ) {
    super(dbConnection);
  }

  public async findByEmail(email: string): Promise<User | null> {
    this.initializeRepository();
    return this.repository.findOne({ where: { email } });
  }
} 