// For creating a new product
export interface CreateProductDTO {
    name: string;
    type: string;
    description?: string;
    price?: number;
    inventory?: number;
    isFeatured?: boolean;
}

// For updating a product
export interface UpdateProductDTO {
    name?: string;
    type?: string;
    description?: string;
    price?: number;
    inventory?: number;
    isFeatured?: boolean;
}

// For product responses
export interface ProductResponseDTO {
    productId: string;
    name: string;
    type: string;
    description?: string;
    price?: number;
    inventory?: number;
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}