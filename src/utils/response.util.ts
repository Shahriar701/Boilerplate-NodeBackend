import { Response } from 'express';
import { ApiError } from '@/middlewares/error.middleware';

/**
 * Utility class for standardized HTTP responses
 * Inspired by NetworkUtil from previous project but enhanced
 * to work with our ApiError class and provide more comprehensive responses
 */
export class ResponseUtil {
    /**
     * Send a successful 200 OK response
     * @param res Express Response object
     * @param data Response data
     */
    static ok(res: Response, data: any): Response {
        return res.status(200).json(data);
    }

    /**
     * Send a successful 201 Created response
     * @param res Express Response object
     * @param data Optional response data
     */
    static created(res: Response, data?: any): Response {
        return res.status(201).json(data);
    }

    /**
     * Send a successful 204 No Content response
     * @param res Express Response object
     */
    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    /**
     * Send a 400 Bad Request error response
     * @param res Express Response object
     * @param error Error object or message
     * @param validationErrors Optional validation errors
     */
    static badRequest(res: Response, error: ApiError | Error | string, validationErrors?: Record<string, string>): Response {
        const message = typeof error === 'string' ? error : error.message;
        return res.status(400).json({
            success: false,
            message,
            ...(validationErrors && { errors: validationErrors })
        });
    }

    /**
     * Send a 401 Unauthorized error response
     * @param res Express Response object
     * @param error Error object or message
     */
    static unauthorized(res: Response, error: ApiError | Error | string): Response {
        const message = typeof error === 'string' ? error : error.message;
        return res.status(401).json({
            success: false,
            message
        });
    }

    /**
     * Send a 403 Forbidden error response
     * @param res Express Response object
     * @param error Error object or message
     */
    static forbidden(res: Response, error: ApiError | Error | string): Response {
        const message = typeof error === 'string' ? error : error.message;
        return res.status(403).json({
            success: false,
            message
        });
    }

    /**
     * Send a 404 Not Found error response
     * @param res Express Response object
     * @param error Error object or message
     */
    static notFound(res: Response, error: ApiError | Error | string): Response {
        const message = typeof error === 'string' ? error : error.message;
        return res.status(404).json({
            success: false,
            message
        });
    }

    /**
     * Send a 500 Internal Server Error response
     * @param res Express Response object
     * @param error Error object or message
     */
    static serverError(res: Response, error: ApiError | Error | string): Response {
        const message = typeof error === 'string' ? error : error.message;
        return res.status(500).json({
            success: false,
            message,
            ...(process.env.NODE_ENV !== 'production' && typeof error !== 'string' && { stack: error.stack })
        });
    }
} 