import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, requestParam, queryParam } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { CreateProductDTO, UpdateProductDTO } from '@models/dto/product.dto';
import { IProductService } from '@/interfaces/product.service.interfaces';

@controller('/products')
export class ProductController {
    constructor(
        @inject(TYPES.IProductService) private readonly productService: IProductService
    ) { }

    @httpGet('/')
    public async getAllProducts(_req: Request, res: Response): Promise<void> {
        try {
            const products = await this.productService.findAll();
            res.json(products);
        } catch (error) {
            console.error('Error getting all products:', error);
            res.status(500).json({ error: 'Failed to get products' });
        }
    }

    @httpGet('/search')
    public async searchProducts(req: Request, res: Response): Promise<void> {
        try {
            const min = req.query.min ? Number(req.query.min) : undefined;
            const max = req.query.max ? Number(req.query.max) : undefined;

            if (min !== undefined && max !== undefined) {
                // If min and max are provided, search by price range
                const products = await this.productService.findByPriceRange(min, max);
                res.json(products);
            } else {
                // Otherwise return an error
                res.status(400).json({ error: 'Both min and max query parameters are required for price search' });
            }
        } catch (error) {
            console.error('Error searching products:', error);
            res.status(500).json({ error: 'Failed to search products' });
        }
    }

    @httpGet('/type/:type')
    public async getProductsByType(req: Request, res: Response): Promise<void> {
        try {
            const products = await this.productService.findByType(req.params.type);
            res.json(products);
        } catch (error) {
            console.error(`Error getting products with type ${req.params.type}:`, error);
            res.status(500).json({ error: 'Failed to get products by type' });
        }
    }

    @httpGet('/:id')
    public async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.productService.findById(req.params.id);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error) {
            console.error(`Error getting product with ID ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to get product' });
        }
    }

    @httpPost('/')
    public async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const productData: CreateProductDTO = req.body;
            const newProduct = await this.productService.create(productData);
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(400).json({ error: 'Failed to create product' });
        }
    }

    @httpPut('/:id')
    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const productData: UpdateProductDTO = req.body;
            const updatedProduct = await this.productService.update(req.params.id, productData);
            if (!updatedProduct) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(updatedProduct);
        } catch (error) {
            console.error(`Error updating product with ID ${req.params.id}:`, error);
            res.status(400).json({ error: 'Failed to update product' });
        }
    }

    @httpDelete('/:id')
    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.productService.delete(req.params.id);
            if (!deleted) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting product with ID ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
}
