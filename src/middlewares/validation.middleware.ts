import { Request, Response, NextFunction } from 'express';

/**
 * Type for validation rules - each property is a validation function that returns true if valid
 */
type ValidationRules<T> = {
  [K in keyof T]?: (value: any) => boolean;
};

/**
 * Type for validation errors - contains error messages for each field
 */
type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Creates a validation middleware for request body
 * @param rules Validation rules object
 * @param errorMessages Custom error messages for each field
 * @returns Express middleware function
 */
export const validateBody = <T extends object>(
  rules: ValidationRules<T>,
  errorMessages: Partial<Record<keyof T, string>> = {}
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body) {
      res.status(400).json({ message: 'Request body is required' });
      return;
    }

    const errors: ValidationErrors<T> = {};
    let hasErrors = false;

    // Validate each field according to its rule
    for (const [field, validateFn] of Object.entries(rules)) {
      const value = req.body[field];
      
      // Skip validation if field is not required and value is not provided
      if (value === undefined) {
        continue;
      }
      
      const validator = validateFn as (value: any) => boolean;
      if (validator && !validator(value)) {
        hasErrors = true;
        errors[field as keyof T] = errorMessages[field as keyof T] || `Invalid ${field}`;
      }
    }

    if (hasErrors) {
      res.status(400).json({ errors });
    } else {
      next();
    }
  };
};

/**
 * Common validation functions for reuse
 */
export const Validators = {
  /**
   * Validates that a value is not empty (undefined, null, empty string)
   */
  required: (value: any): boolean => {
    return value !== undefined && value !== null && value !== '';
  },
  
  /**
   * Validates that a value is a string with minimum and maximum length
   */
  string: (minLength = 1, maxLength = Infinity) => {
    return (value: any): boolean => {
      return typeof value === 'string' && 
        value.length >= minLength && 
        value.length <= maxLength;
    };
  },
  
  /**
   * Validates that a value is a number within a range
   */
  number: (min = -Infinity, max = Infinity) => {
    return (value: any): boolean => {
      return typeof value === 'number' && 
        !isNaN(value) && 
        value >= min && 
        value <= max;
    };
  },
  
  /**
   * Validates that a value matches a regular expression
   */
  regex: (pattern: RegExp) => {
    return (value: any): boolean => {
      return typeof value === 'string' && pattern.test(value);
    };
  },
  
  /**
   * Validates that a value is a valid email address
   */
  email: (value: any): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return typeof value === 'string' && emailRegex.test(value);
  },

  /**
   * Validates that a value is a valid UUID
   */
  uuid: (value: any): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && uuidRegex.test(value);
  },
  
  /**
   * Validates that a value is a valid date
   */
  date: (value: any): boolean => {
    if (value instanceof Date) return !isNaN(value.getTime());
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }
};

/**
 * Example usage of the validation middleware:
 * 
 * // User validation middleware
 * export const validateUserCreate = validateBody<CreateUserDTO>(
 *   {
 *     email: Validators.email,
 *     name: Validators.string(2, 100),
 *     password: Validators.string(8, 100)
 *   },
 *   {
 *     email: 'Please provide a valid email address',
 *     name: 'Name must be between 2 and 100 characters',
 *     password: 'Password must be at least 8 characters long'
 *   }
 * );
 */ 