export interface IBaseService<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(dto: Partial<T>): Promise<T>;
  update(id: string, dto: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
} 