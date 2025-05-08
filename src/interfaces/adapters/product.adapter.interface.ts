import { IProduct, IDynamoProduct } from '@/interfaces/DbInterfaces';
import { ProductResponseDTO, CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';

/**
 * Interface for adapting different product data sources to a consistent format
 */
export interface IProductDataAdapter {
  /**
   * Convert database entity to response DTO
   */
  toResponseDTO(source: any): ProductResponseDTO;
  
  /**
   * Create entity from DTO
   */
  fromCreateDTO(dto: CreateProductDTO): any;
  
  /**
   * Prepare entity for update
   */
  prepareUpdate(dto: UpdateProductDTO): any;
}

/**
 * MongoDB product data adapter
 */
export class MongoProductAdapter implements IProductDataAdapter {
  /**
   * Convert MongoDB document to response DTO
   */
  toResponseDTO(product: IProduct): ProductResponseDTO {
    return {
      productId: product._id ? product._id.toString() : '',
      name: product.name,
      type: product.type,
      description: product.description,
      price: product.price || 0,
      inventory: product.inventory || 0,
      isFeatured: product.isFeatured || false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
  
  /**
   * Create MongoDB entity from DTO
   */
  fromCreateDTO(dto: CreateProductDTO): Partial<IProduct> {
    return {
      name: dto.name,
      type: dto.type,
      description: dto.description,
      price: dto.price || 0,
      inventory: dto.inventory || 0,
      isFeatured: dto.isFeatured || false
    };
  }
  
  /**
   * Prepare MongoDB entity for update
   */
  prepareUpdate(dto: UpdateProductDTO): Partial<IProduct> {
    return dto;
  }
}

/**
 * DynamoDB product data adapter
 */
export class DynamoProductAdapter implements IProductDataAdapter {
  /**
   * Convert DynamoDB item to response DTO
   */
  toResponseDTO(product: IDynamoProduct): ProductResponseDTO {
    return {
      productId: product.id,
      name: product.name,
      type: product.type,
      description: product.description,
      price: product.price || 0,
      inventory: product.inventory || 0,
      isFeatured: product.isFeatured || false,
      createdAt: typeof product.createdAt === 'string' ? new Date(product.createdAt) : product.createdAt,
      updatedAt: typeof product.updatedAt === 'string' ? new Date(product.updatedAt) : product.updatedAt
    };
  }
  
  /**
   * Create DynamoDB entity from DTO
   */
  fromCreateDTO(dto: CreateProductDTO): Partial<IDynamoProduct> {
    return {
      name: dto.name,
      type: dto.type,
      description: dto.description,
      price: dto.price || 0,
      inventory: dto.inventory || 0,
      isFeatured: dto.isFeatured || false
    };
  }
  
  /**
   * Prepare DynamoDB entity for update
   */
  prepareUpdate(dto: UpdateProductDTO): Partial<IDynamoProduct> {
    return dto;
  }
} 