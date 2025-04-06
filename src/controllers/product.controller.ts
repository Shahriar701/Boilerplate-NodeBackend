import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, requestParam, queryParam } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { CreateProductDTO, UpdateProductDTO } from '@models/dto/product.dto';
import { IProductService } from '@/interfaces/product.service.interfaces';
import { ResponseUtil } from '@/utils/response.util';
import { createAuthMiddleware, hasRoles } from '@/middlewares/auth.middleware';
import { Container } from 'inversify';

// Get the container from the server context
const getContainer = (req: Request): Container => {
  return (req as any).container;
};

// Auth middleware factory
const auth = (req: Request, res: Response, next: NextFunction) => {
  return createAuthMiddleware(getContainer(req))(req, res, next);
};

// Admin role check middleware
const adminOnly = hasRoles(['admin']);

@controller('/products')
export class ProductController {
    constructor(
        @inject(TYPES.IProductService) private readonly productService: IProductService
    ) { }

    @httpGet('/')
    public async getAllProducts(_req: Request, res: Response): Promise<void> {
        try {
            const products = await this.productService.findAll();
            ResponseUtil.ok(res, products);
        } catch (error) {
            console.error('Error getting all products:', error);
            ResponseUtil.serverError(res, 'Failed to get products');
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
                ResponseUtil.ok(res, products);
            } else {
                // Otherwise return an error
                ResponseUtil.badRequest(res, 'Both min and max query parameters are required for price search');
            }
        } catch (error) {
            console.error('Error searching products:', error);
            ResponseUtil.serverError(res, 'Failed to search products');
        }
    }

    @httpGet('/type/:type')
    public async getProductsByType(req: Request, res: Response): Promise<void> {
        try {
            const products = await this.productService.findByType(req.params.type);
            ResponseUtil.ok(res, products);
        } catch (error) {
            console.error(`Error getting products with type ${req.params.type}:`, error);
            ResponseUtil.serverError(res, 'Failed to get products by type');
        }
    }

    @httpGet('/:id')
    public async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.productService.findById(req.params.id);
            if (!product) {
                ResponseUtil.notFound(res, `Product not found with id: ${req.params.id}`);
                return;
            }
            ResponseUtil.ok(res, product);
        } catch (error) {
            console.error(`Error getting product with ID ${req.params.id}:`, error);
            ResponseUtil.serverError(res, 'Failed to get product');
        }
    }

    @httpPost('/', auth, adminOnly)
    public async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const productData: CreateProductDTO = req.body;
            const newProduct = await this.productService.create(productData);
            ResponseUtil.created(res, newProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            ResponseUtil.badRequest(res, 'Failed to create product');
        }
    }

    @httpPut('/:id', auth, adminOnly)
    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const productData: UpdateProductDTO = req.body;
            const updatedProduct = await this.productService.update(req.params.id, productData);
            if (!updatedProduct) {
                ResponseUtil.notFound(res, `Product not found with id: ${req.params.id}`);
                return;
            }
            ResponseUtil.ok(res, updatedProduct);
        } catch (error) {
            console.error(`Error updating product with ID ${req.params.id}:`, error);
            ResponseUtil.badRequest(res, 'Failed to update product');
        }
    }

    @httpDelete('/:id', auth, adminOnly)
    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.productService.delete(req.params.id);
            if (!deleted) {
                ResponseUtil.notFound(res, `Product not found with id: ${req.params.id}`);
                return;
            }
            ResponseUtil.noContent(res);
        } catch (error) {
            console.error(`Error deleting product with ID ${req.params.id}:`, error);
            ResponseUtil.serverError(res, 'Failed to delete product');
        }
    }
}
