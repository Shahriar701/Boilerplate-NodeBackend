import { injectable } from 'inversify';
import { IBaseService } from './base.service.interface';
import { IBaseRepository } from '@repositories/base.repository.interface';

@injectable()
export abstract class BaseService<T> implements IBaseService<T> {
  constructor(protected readonly repository: IBaseRepository<T>) {}

  public async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  public async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  public async create(dto: Partial<T>): Promise<T> {
    return this.repository.create(dto);
  }

  public async update(id: string, dto: Partial<T>): Promise<T | null> {
    return this.repository.update(id, dto);
  }

  public async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
} 