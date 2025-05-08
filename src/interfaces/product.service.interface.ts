import { ProductResponseDTO, CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';

/**
 * Product service interface - consistent across all database implementations
 */
export interface IProductService {
    findAll(): Promise<ProductResponseDTO[]>;
    findById(id: string): Promise<ProductResponseDTO | null>;
    findByType(type: string): Promise<ProductResponseDTO[]>;
    findByPriceRange(min: number, max: number): Promise<ProductResponseDTO[]>;
    create(data: CreateProductDTO): Promise<ProductResponseDTO>;
    update(id: string, data: UpdateProductDTO): Promise<ProductResponseDTO | null>;
    delete(id: string): Promise<boolean>;
} 