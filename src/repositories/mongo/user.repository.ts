import { injectable, inject } from 'inversify';
import { IUser, UserModel } from '@models/mongo/user.model';
import { MongoBaseRepository } from './base.repository';
import { IBaseRepository } from '../base.repository.interface';
import { IDatabaseConnection } from '@database/database.interface';
import { TYPES } from '@config/types';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

@injectable()
export class UserRepository extends MongoBaseRepository<IUser> implements IUserRepository {
  constructor(
    @inject(TYPES.IDatabaseConnection) dbConnection: IDatabaseConnection
  ) {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }
} 