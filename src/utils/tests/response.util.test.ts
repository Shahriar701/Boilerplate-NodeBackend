import { ResponseUtil } from '../response.util';
import { ApiError } from '@/middlewares/error.middleware';

describe('ResponseUtil', () => {
    // Mock Express response
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ok', () => {
        it('should send a 200 response with data', () => {
            const data = { id: 1, name: 'Test' };
            ResponseUtil.ok(mockRes as any, data);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(data);
        });
    });

    describe('created', () => {
        it('should send a 201 response with data', () => {
            const data = { id: 1, name: 'Test' };
            ResponseUtil.created(mockRes as any, data);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(data);
        });

        it('should send a 201 response without data', () => {
            ResponseUtil.created(mockRes as any);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(undefined);
        });
    });

    describe('noContent', () => {
        it('should send a 204 response', () => {
            ResponseUtil.noContent(mockRes as any);

            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.send).toHaveBeenCalled();
        });
    });

    describe('badRequest', () => {
        it('should send a 400 response with string error', () => {
            ResponseUtil.badRequest(mockRes as any, 'Bad request');

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad request'
            });
        });

        it('should send a 400 response with Error object', () => {
            const error = new Error('Bad request');
            ResponseUtil.badRequest(mockRes as any, error);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad request'
            });
        });

        it('should send a 400 response with ApiError and validation errors', () => {
            const error = ApiError.badRequest('Validation failed');
            const validationErrors = { field: 'Field is required' };

            ResponseUtil.badRequest(mockRes as any, error, validationErrors);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        });
    });

    describe('notFound', () => {
        it('should send a 404 response', () => {
            ResponseUtil.notFound(mockRes as any, 'Resource not found');

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Resource not found'
            });
        });
    });

    describe('serverError', () => {
        it('should send a 500 response', () => {
            ResponseUtil.serverError(mockRes as any, 'Server error');

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });

        it('should include stack trace in development', () => {
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const error = new Error('Server error');
            ResponseUtil.serverError(mockRes as any, error);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                stack: error.stack
            });

            process.env.NODE_ENV = originalNodeEnv;
        });
    });
}); 