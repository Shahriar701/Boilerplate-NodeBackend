import { injectable, inject } from 'inversify';
import { Repository, ObjectLiteral, DeepPartial, FindOptionsWhere, DataSource } from 'typeorm';
import { IDatabaseConnection } from '@database/database.interface';
import { TYPES } from '@config/types';
import { IBaseRepository } from '../base.repository.interface';

@injectable()
export abstract class TypeOrmBaseRepository<T extends ObjectLiteral> implements IBaseRepository<T> {
  protected abstract readonly entityName: string;
  protected repository!: Repository<T>; // Using the definite assignment assertion

  constructor(
    @inject(TYPES.IDatabaseConnection) private readonly dbConnection: IDatabaseConnection
  ) {
    // We will initialize the repository in the initializeRepository method
  }

  protected initializeRepository(): void {
    if (!this.repository) {
      const connection = this.dbConnection.getConnection() as DataSource;
      this.repository = connection.getRepository(this.entityName);
    }
  }

  public async findAll(): Promise<T[]> {
    this.initializeRepository();
    return this.repository.find();
  }

  public async findById(id: string): Promise<T | null> {
    this.initializeRepository();
    const where = { id } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  public async create(entity: Partial<T>): Promise<T> {
    this.initializeRepository();
    const newEntity = this.repository.create(entity as DeepPartial<T>);
    return this.repository.save(newEntity);
  }

  public async update(id: string, entity: Partial<T>): Promise<T | null> {
    this.initializeRepository();
    const existingEntity = await this.findById(id);
    
    if (!existingEntity) {
      return null;
    }
    
    const updatedEntity = this.repository.merge(existingEntity, entity as DeepPartial<T>);
    return this.repository.save(updatedEntity);
  }

  public async delete(id: string): Promise<boolean> {
    this.initializeRepository();
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
} 