import { Request, Response } from 'express';
import { validateBody, Validators } from '../validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Mock request, response, next
    mockRequest = {
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();
  });

  describe('validateBody', () => {
    it('should return 400 if request body is missing', () => {
      // Arrange
      mockRequest.body = undefined;
      const middleware = validateBody<any>({});

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Request body is required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if all validations pass', () => {
      // Arrange
      mockRequest.body = {
        email: 'user@example.com',
        name: 'John Doe',
        age: 30
      };

      const middleware = validateBody<typeof mockRequest.body>({
        email: Validators.email,
        name: Validators.string(2, 100),
        age: Validators.number(18, 100)
      });

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return validation errors if some fields are invalid', () => {
      // Arrange
      mockRequest.body = {
        email: 'invalid-email',
        name: 'A', // too short
        age: 15    // too young
      };

      const middleware = validateBody<typeof mockRequest.body>(
        {
          email: Validators.email,
          name: Validators.string(2, 100),
          age: Validators.number(18, 100)
        },
        {
          email: 'Please provide a valid email address',
          name: 'Name must be between 2 and 100 characters',
          age: 'Age must be between 18 and 100'
        }
      );

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: {
          email: 'Please provide a valid email address',
          name: 'Name must be between 2 and 100 characters',
          age: 'Age must be between 18 and 100'
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should use default error messages if custom ones are not provided', () => {
      // Arrange
      mockRequest.body = {
        email: 'invalid-email'
      };

      const middleware = validateBody<{ email: string }>({
        email: Validators.email
      });

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: {
          email: 'Invalid email'
        }
      });
    });

    it('should skip validation for undefined fields', () => {
      // Arrange
      mockRequest.body = {
        email: 'user@example.com'
        // name is optional and not provided
      };

      const middleware = validateBody<{ email: string; name?: string }>({
        email: Validators.email,
        name: Validators.string(2, 100)
      });

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Validators', () => {
    describe('required', () => {
      it('should return false for undefined, null, or empty string', () => {
        expect(Validators.required(undefined)).toBe(false);
        expect(Validators.required(null)).toBe(false);
        expect(Validators.required('')).toBe(false);
      });

      it('should return true for non-empty values', () => {
        expect(Validators.required('value')).toBe(true);
        expect(Validators.required(0)).toBe(true);
        expect(Validators.required(false)).toBe(true);
        expect(Validators.required({})).toBe(true);
      });
    });

    describe('string', () => {
      it('should validate string length', () => {
        const validator = Validators.string(2, 5);

        expect(validator('a')).toBe(false);     // too short
        expect(validator('ab')).toBe(true);     // minimum length
        expect(validator('abcde')).toBe(true);  // maximum length
        expect(validator('abcdef')).toBe(false); // too long
      });

      it('should return false for non-string values', () => {
        const validator = Validators.string();

        expect(validator(123)).toBe(false);
        expect(validator(null)).toBe(false);
        expect(validator(undefined)).toBe(false);
        expect(validator({})).toBe(false);
      });
    });

    describe('number', () => {
      it('should validate number range', () => {
        const validator = Validators.number(5, 10);

        expect(validator(4)).toBe(false);  // too small
        expect(validator(5)).toBe(true);   // minimum value
        expect(validator(7)).toBe(true);   // in range
        expect(validator(10)).toBe(true);  // maximum value
        expect(validator(11)).toBe(false); // too large
      });

      it('should return false for non-number values', () => {
        const validator = Validators.number();

        expect(validator('123')).toBe(false);
        expect(validator(null)).toBe(false);
        expect(validator(undefined)).toBe(false);
        expect(validator(NaN)).toBe(false);
      });
    });

    describe('email', () => {
      it('should validate email format', () => {
        expect(Validators.email('user@example.com')).toBe(true);
        expect(Validators.email('user.name+tag@example.co.uk')).toBe(true);
        expect(Validators.email('invalid-email')).toBe(false);
        expect(Validators.email('@example.com')).toBe(false);
        expect(Validators.email('user@')).toBe(false);
        expect(Validators.email('')).toBe(false);
        expect(Validators.email(123 as any)).toBe(false);
      });
    });

    describe('uuid', () => {
      it('should validate UUID format', () => {
        expect(Validators.uuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        expect(Validators.uuid('invalid-uuid')).toBe(false);
        expect(Validators.uuid('')).toBe(false);
        expect(Validators.uuid(123 as any)).toBe(false);
      });
    });

    describe('date', () => {
      it('should validate date values', () => {
        expect(Validators.date(new Date())).toBe(true);
        expect(Validators.date('2023-01-01')).toBe(true);
        expect(Validators.date(1672531200000)).toBe(true); // timestamp
        expect(Validators.date('invalid-date')).toBe(false);
        expect(Validators.date('')).toBe(false);
        expect(Validators.date(null as any)).toBe(false);
      });
    });
  });
}); 