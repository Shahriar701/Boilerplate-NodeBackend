import { injectable } from 'inversify';
import { Model, Document } from 'mongoose';
import { IBaseRepository } from '../../interfaces/base.repository.interface';

@injectable()
export abstract class MongoBaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) { }

  public async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  public async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  public async create(entity: Partial<T>): Promise<T> {
    const newEntity = new this.model(entity);
    return await newEntity.save();
  }

  public async update(id: string, entity: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, entity, { new: true }).exec();
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
} 