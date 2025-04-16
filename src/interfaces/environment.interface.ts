/**
 * Interface for environment configuration
 */
export interface IEnvironmentConfig {
    /** Node environment (development, production, test) */
    nodeEnv: string;

    /** Port for the server to listen on */
    port: number;

    /** Base URL for the API */
    apiBaseUrl?: string;

    /** Secret for JWT token signing */
    jwtSecret: string;

    /** Expiration time for JWT tokens */
    jwtExpiresIn: string;

    /** Database connection string */
    dbConnectionString?: string;

    /** Database name */
    dbName?: string;

    /** Whether to enable debug mode */
    debug?: boolean;
} 