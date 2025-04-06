import { TYPES } from "@/config/types";
import { IDatabaseConnection } from "@/database/database.interface";
import { ProductModel } from "@/models/mongo/product.model";
import { IProduct } from "@/interfaces/DbInterfaces";
import { injectable, inject } from "inversify";
import { IBaseRepository } from "../../interfaces/base.repository.interface";
import { MongoBaseRepository } from "./base.repository";

export interface IProductRepository extends IBaseRepository<IProduct> {
    findByType(type: string): Promise<IProduct[]>;
    findByName(name: string): Promise<IProduct[]>;
    findByTypeAndName(type: string, name: string): Promise<IProduct[]>;
    searchProducts(query: string): Promise<IProduct[]>;
    findByPriceRange(min: number, max: number): Promise<IProduct[]>;
}

@injectable()
export class ProductRepository extends MongoBaseRepository<IProduct> implements IProductRepository {
    constructor(
        @inject(TYPES.IDatabaseConnection) dbConnection: IDatabaseConnection
    ) {
        super(ProductModel);
    }

    public async findByType(type: string): Promise<IProduct[]> {
        return this.model.find({ type }).exec();
    }

    public async findByName(name: string): Promise<IProduct[]> {
        return this.model.find({ name: { $regex: name, $options: 'i' } }).exec();
    }

    public async findByTypeAndName(type: string, name: string): Promise<IProduct[]> {
        return this.model.find({
            type,
            name: { $regex: name, $options: 'i' }
        }).exec();
    }

    public async searchProducts(query: string): Promise<IProduct[]> {
        return this.model.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { type: { $regex: query, $options: 'i' } }
            ]
        }).exec();
    }

    public async findByPriceRange(min: number, max: number): Promise<IProduct[]> {
        return this.model.find({
            price: { $gte: min, $lte: max }
        }).exec();
    }
} 