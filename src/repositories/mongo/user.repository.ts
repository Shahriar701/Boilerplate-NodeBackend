import { injectable } from 'inversify';
import { IUser, UserModel } from '@models/mongo/user.model';
import { MongoBaseRepository } from './base.repository';
import { IBaseRepository } from '../base.repository.interface';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

@injectable()
export class UserRepository extends MongoBaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }
} 