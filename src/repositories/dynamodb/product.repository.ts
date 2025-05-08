import { injectable, inject } from 'inversify';
import { DynamoBaseRepository } from './base.repository';
import { IDatabaseConnection } from '@database/database.interface';
import { TYPES } from '@config/types';
import { IEnvironmentConfig } from '@config/env.config';
import { IDynamoProduct } from '@/interfaces/DbInterfaces';
import { IBaseRepository } from '@/interfaces/base.repository.interface';

export interface IProductRepository extends IBaseRepository<IDynamoProduct> {
    findByType(type: string): Promise<IDynamoProduct[]>;
    findByPriceRange(min: number, max: number): Promise<IDynamoProduct[]>;
}

@injectable()
export class ProductRepository extends DynamoBaseRepository<IDynamoProduct> implements IProductRepository {
    protected readonly entityName: string = 'products';

    constructor(
        @inject(TYPES.IDatabaseConnection) dbConnection: IDatabaseConnection,
        @inject(TYPES.IEnvironmentConfig) config: IEnvironmentConfig
    ) {
        super(dbConnection, config);
        this.initTableName();
    }
    /**
     * Finds products by type
     * @param type Product type
     * @returns Array of products
     */
    public async findByType(type: string): Promise<IDynamoProduct[]> {
        return this.queryByIndex('TypeIndex', 'type', type);
    }

    /**
     * Finds products by price range
     * @param min Minimum price
     * @param max Maximum price
     * @returns Array of products
     */
    public async findByPriceRange(min: number, max: number): Promise<IDynamoProduct[]> {
        const allProducts = await this.findAll();

        return allProducts.filter(product => {
            const price = product.price || 0;
            return price >= min && price <= max;
        });
    }

    /**
     * Creates a new product
     * @param productData Product data to create
     * @returns Created product
     */
    public async create(productData: Partial<IDynamoProduct>): Promise<IDynamoProduct> {
        // Set default values if not provided
        if (productData.price === undefined) {
            productData.price = 0;
        }

        if (productData.inventory === undefined) {
            productData.inventory = 0;
        }

        if (productData.isFeatured === undefined) {
            productData.isFeatured = false;
        }

        return super.create(productData);
    }
} 