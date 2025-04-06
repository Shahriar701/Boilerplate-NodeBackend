import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, requestParam, queryParam } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { CreateProductDTO, UpdateProductDTO } from '@models/dto/product.dto';
import { IProductService } from '@/interfaces/product.service.interfaces';
import { ResponseUtil } from '@/utils/response.util';
import { createAuthMiddleware, hasRoles } from '@/middlewares/auth.middleware';
import { Container } from 'inversify';
import { ApiError } from '@/middlewares/error.middleware';

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

/**
 * Product Controller
 * 
 * Demonstrates best practices for handling HTTP requests in Express:
 * 1. Uses ResponseUtil for successful responses
 * 2. Throws ApiError instances for error cases
 * 3. Lets the global error middleware handle errors consistently
 */
@controller('/products')
export class ProductController {
    constructor(
        @inject(TYPES.IProductService) private readonly productService: IProductService
    ) { }

    @httpGet('/')
    public async getAllProducts(_req: Request, res: Response): Promise<void> {
        const products = await this.productService.findAll();
        ResponseUtil.ok(res, products);
    }

    @httpGet('/search')
    public async searchProducts(req: Request, res: Response): Promise<void> {
        const min = req.query.min ? Number(req.query.min) : undefined;
        const max = req.query.max ? Number(req.query.max) : undefined;

        if (min !== undefined && max !== undefined) {
            // If min and max are provided, search by price range
            const products = await this.productService.findByPriceRange(min, max);
            ResponseUtil.ok(res, products);
        } else {
            // Otherwise return an error
            throw ApiError.badRequest('Both min and max query parameters are required for price search');
        }
    }

    @httpGet('/type/:type')
    public async getProductsByType(req: Request, res: Response): Promise<void> {
        const products = await this.productService.findByType(req.params.type);
        ResponseUtil.ok(res, products);
    }

    @httpGet('/:id')
    public async getProductById(req: Request, res: Response): Promise<void> {
        const product = await this.productService.findById(req.params.id);
        if (!product) {
            throw ApiError.notFound(`Product not found with id: ${req.params.id}`);
        }
        ResponseUtil.ok(res, product);
    }

    @httpPost('/', auth, adminOnly)
    public async createProduct(req: Request, res: Response): Promise<void> {
        const productData: CreateProductDTO = req.body;
        const newProduct = await this.productService.create(productData);
        ResponseUtil.created(res, newProduct);
    }

    @httpPut('/:id', auth, adminOnly)
    public async updateProduct(req: Request, res: Response): Promise<void> {
        const productData: UpdateProductDTO = req.body;
        const updatedProduct = await this.productService.update(req.params.id, productData);
        if (!updatedProduct) {
            throw ApiError.notFound(`Product not found with id: ${req.params.id}`);
        }
        ResponseUtil.ok(res, updatedProduct);
    }

    @httpDelete('/:id', auth, adminOnly)
    public async deleteProduct(req: Request, res: Response): Promise<void> {
        const deleted = await this.productService.delete(req.params.id);
        if (!deleted) {
            throw ApiError.notFound(`Product not found with id: ${req.params.id}`);
        }
        ResponseUtil.noContent(res);
    }
}
