import { ProductResponseDTO, CreateProductDTO, UpdateProductDTO } from "@/models/dto/product.dto";

export interface IProductService {
    findAll(): Promise<ProductResponseDTO[]>;
    findById(id: string): Promise<ProductResponseDTO | null>;
    findByType(type: string): Promise<ProductResponseDTO[]>;
    create(data: CreateProductDTO): Promise<ProductResponseDTO>;
    update(id: string, data: UpdateProductDTO): Promise<ProductResponseDTO | null>;
    delete(id: string): Promise<boolean>;
    findByType(type: string): Promise<ProductResponseDTO[]>;
    findByPriceRange(min: number, max: number): Promise<ProductResponseDTO[]>;
}