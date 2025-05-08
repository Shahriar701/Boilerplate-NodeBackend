import { IAuthLoginDTO, IAuthRegisterDTO } from '@/interfaces/auth.service.interface';

/**
 * Validates login input
 * @param data Login data to validate
 * @returns Array of error messages
 */
export const validateLoginInput = (data: Partial<IAuthLoginDTO>): string[] => {
    const errors: string[] = [];

    if (!data.email) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Email format is invalid');
    }

    if (!data.password) {
        errors.push('Password is required');
    }

    return errors;
};

/**
 * Validates registration input
 * @param data Registration data to validate
 * @returns Array of error messages
 */
export const validateRegisterInput = (data: Partial<IAuthRegisterDTO>): string[] => {
    const errors: string[] = [];

    if (!data.email) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Email format is invalid');
    }

    if (!data.password) {
        errors.push('Password is required');
    } else if (data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!data.name) {
        errors.push('Name is required');
    }

    return errors;
}; 