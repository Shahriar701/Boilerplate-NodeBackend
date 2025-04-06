import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/types';
import { IProductRepository } from '@/repositories/mongo/product.repository';
import { IProductService } from '@/interfaces/product.service.interfaces';
import { ProductResponseDTO, CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';
import { IProduct } from '@/interfaces/DbInterfaces';
import { Document } from 'mongoose';
import { ProductBuilder } from '@/models/builders';

@injectable()
export class ProductService implements IProductService {
    constructor(
        @inject(TYPES.IProductRepository) private readonly productRepository: IProductRepository
    ) { }

    public async findAll(): Promise<ProductResponseDTO[]> {
        const products = await this.productRepository.findAll();
        return products.map(this.toResponseDTO);
    }

    public async findById(id: string): Promise<ProductResponseDTO | null> {
        const product = await this.productRepository.findById(id);
        return product ? this.toResponseDTO(product) : null;
    }

    public async findByType(type: string): Promise<ProductResponseDTO[]> {
        const products = await this.productRepository.findByType(type);
        return products.map(this.toResponseDTO);
    }

    public async findByPriceRange(min: number, max: number): Promise<ProductResponseDTO[]> {
        const products = await this.productRepository.findByPriceRange(min, max);
        return products.map(this.toResponseDTO);
    }

    public async create(data: CreateProductDTO): Promise<ProductResponseDTO> {
        // Using ProductBuilder factory method to create from DTO
        const productData = ProductBuilder.fromDTO(data).build();
        const product = await this.productRepository.create(productData);
        return this.toResponseDTO(product);
    }

    public async update(id: string, data: UpdateProductDTO): Promise<ProductResponseDTO | null> {
        const product = await this.productRepository.update(id, data);
        return product ? this.toResponseDTO(product) : null;
    }

    public async delete(id: string): Promise<boolean> {
        return this.productRepository.delete(id);
    }

    // Helper method to transform database entity to response DTO
    private toResponseDTO(product: IProduct): ProductResponseDTO {
        return {
            productId: product._id ? product._id.toString() : '',
            name: product.name,
            type: product.type,
            description: product.description,
            price: product.price,
            inventory: product.inventory,
            isFeatured: product.isFeatured,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };
    }
}