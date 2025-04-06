import { IProduct } from '@/interfaces/DbInterfaces';
import { CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';

/**
 * Builder class for Product objects
 * Implements the Builder pattern to create complex Product objects step by step
 */
export class ProductBuilder {
    private readonly product: Partial<IProduct> = {};

    /**
     * Static factory method to create a builder from a DTO
     * @param dto The CreateProductDTO to use as a base
     * @returns A new ProductBuilder instance initialized with DTO values
     */
    static fromDTO(dto: CreateProductDTO | UpdateProductDTO): ProductBuilder {
        const builder = new ProductBuilder();

        if ('name' in dto && dto.name) {
            builder.setName(dto.name);
        }

        if ('type' in dto && dto.type) {
            builder.setType(dto.type);
        }

        if (dto.description !== undefined) {
            builder.setDescription(dto.description);
        }

        if (dto.price !== undefined) {
            builder.setPrice(dto.price);
        }

        if (dto.inventory !== undefined) {
            builder.setInventory(dto.inventory);
        }

        if (dto.isFeatured !== undefined) {
            builder.setFeatured(dto.isFeatured);
        }

        return builder;
    }

    /**
     * Static factory method to create a featured product
     * @param name Product name
     * @param type Product type
     * @returns A new ProductBuilder for a featured product
     */
    static featuredProduct(name: string, type: string): ProductBuilder {
        return new ProductBuilder()
            .setName(name)
            .setType(type)
            .setFeatured(true);
    }

    /**
     * Sets the product name
     * @param name Product name
     * @returns The builder instance for method chaining
     */
    setName(name: string): ProductBuilder {
        this.product.name = name;
        return this;
    }

    /**
     * Sets the product type
     * @param type Product type
     * @returns The builder instance for method chaining
     */
    setType(type: string): ProductBuilder {
        this.product.type = type;
        return this;
    }

    /**
     * Sets the product description
     * @param description Product description
     * @returns The builder instance for method chaining
     */
    setDescription(description?: string): ProductBuilder {
        this.product.description = description;
        return this;
    }

    /**
     * Sets the product price
     * @param price Product price
     * @returns The builder instance for method chaining
     */
    setPrice(price?: number): ProductBuilder {
        this.product.price = price;
        return this;
    }

    /**
     * Sets the product inventory
     * @param inventory Product inventory
     * @returns The builder instance for method chaining
     */
    setInventory(inventory?: number): ProductBuilder {
        this.product.inventory = inventory;
        return this;
    }

    /**
     * Sets whether the product is featured
     * @param isFeatured Whether the product is featured
     * @returns The builder instance for method chaining
     */
    setFeatured(isFeatured?: boolean): ProductBuilder {
        this.product.isFeatured = isFeatured;
        return this;
    }

    /**
     * Sets the creation date
     * @param createdAt Creation date
     * @returns The builder instance for method chaining
     */
    setCreatedAt(createdAt: Date): ProductBuilder {
        this.product.createdAt = createdAt;
        return this;
    }

    /**
     * Sets the update date
     * @param updatedAt Update date
     * @returns The builder instance for method chaining
     */
    setUpdatedAt(updatedAt: Date): ProductBuilder {
        this.product.updatedAt = updatedAt;
        return this;
    }

    /**
     * Builds and returns the product object
     * @returns The constructed product object
     * @throws Error if required fields are missing
     */
    build(): IProduct {
        // Validate required fields
        if (!this.product.name) {
            throw new Error('Product name is required');
        }
        if (!this.product.type) {
            throw new Error('Product type is required');
        }

        // Set default values if not provided
        if (this.product.price === undefined) {
            this.product.price = 0;
        }
        if (this.product.inventory === undefined) {
            this.product.inventory = 0;
        }
        if (this.product.isFeatured === undefined) {
            this.product.isFeatured = false;
        }

        // Set timestamps if not provided
        const now = new Date();
        if (!this.product.createdAt) {
            this.product.createdAt = now;
        }
        if (!this.product.updatedAt) {
            this.product.updatedAt = now;
        }

        return this.product as IProduct;
    }
} 