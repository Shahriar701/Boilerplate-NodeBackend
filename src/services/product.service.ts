import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/types';
import { IProductRepository } from '@/repositories/mongo/product.repository';
import { IProductService } from '@/interfaces/product.service.interface';
import { ProductResponseDTO, CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';
import { IProductDataAdapter } from '@/interfaces/adapters/product.adapter.interface';

@injectable()
export class ProductService implements IProductService {
    constructor(
        @inject(TYPES.IProductRepository) private readonly productRepository: IProductRepository,
        @inject(TYPES.IProductDataAdapter) private readonly dataAdapter: IProductDataAdapter
    ) { }

    public async findAll(): Promise<ProductResponseDTO[]> {
        const products = await this.productRepository.findAll();
        return products.map(product => this.dataAdapter.toResponseDTO(product));
    }

    public async findById(id: string): Promise<ProductResponseDTO | null> {
        const product = await this.productRepository.findById(id);
        return product ? this.dataAdapter.toResponseDTO(product) : null;
    }

    /**
     * Finds products by type
     * @param type Product type
     * @returns Array of products matching the type
     */
    public async findByType(type: string): Promise<ProductResponseDTO[]> {
        const products = await this.productRepository.findByType(type);
        return products.map(product => this.dataAdapter.toResponseDTO(product));
    }

    /**
     * Finds products within a price range
     * @param min Minimum price
     * @param max Maximum price
     * @returns Array of products within the price range
     */
    public async findByPriceRange(min: number, max: number): Promise<ProductResponseDTO[]> {
        const products = await this.productRepository.findByPriceRange(min, max);
        return products.map(product => this.dataAdapter.toResponseDTO(product));
    }

    public async create(data: CreateProductDTO): Promise<ProductResponseDTO> {
        const productData = this.dataAdapter.fromCreateDTO(data);
        const created = await this.productRepository.create(productData);
        return this.dataAdapter.toResponseDTO(created);
    }

    public async update(id: string, data: UpdateProductDTO): Promise<ProductResponseDTO | null> {
        const updateData = this.dataAdapter.prepareUpdate(data);
        const updated = await this.productRepository.update(id, updateData);
        return updated ? this.dataAdapter.toResponseDTO(updated) : null;
    }

    public async delete(id: string): Promise<boolean> {
        return this.productRepository.delete(id);
    }
}