import { injectable, inject } from 'inversify';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { IDatabaseConnection } from '@database/database.interface';
import { TYPES } from '@config/types';
import { IBaseRepository } from '../../interfaces/base.repository.interface';
import { IEnvironmentConfig } from '@config/env.config';

@injectable()
export abstract class DynamoBaseRepository<T extends { id: string }> implements IBaseRepository<T> {
    protected client: DynamoDBDocumentClient;
    protected tableName: string;
    protected abstract readonly entityName: string;

    constructor(
        @inject(TYPES.IDatabaseConnection) private dbConnection: IDatabaseConnection,
        @inject(TYPES.IEnvironmentConfig) private config: IEnvironmentConfig
    ) {
        this.client = dbConnection.getConnection() as DynamoDBDocumentClient;
        this.tableName = '';
    }

    /**
     * Initialize the table name based on entity name
     * This should be called in the derived class constructor
     */
    protected initTableName(): void {
        if (this.entityName) {
            this.tableName = `${this.config.dynamoTablePrefix}${this.entityName}`;
        }
    }

    /**
     * Creates a new item in DynamoDB
     * @param entity Item to create
     * @returns Created item
     */
    async create(entity: Partial<T>): Promise<T> {
        const now = new Date().toISOString();
        const id = uuidv4();

        const newItem = {
            id,
            ...entity,
            createdAt: now,
            updatedAt: now
        };

        await this.client.send(
            new PutCommand({
                TableName: this.tableName,
                Item: newItem
            })
        );

        return newItem as unknown as T;
    }

    /**
     * Finds an item by ID
     * @param id Item ID
     * @returns Found item or null
     */
    async findById(id: string): Promise<T | null> {
        const result = await this.client.send(
            new GetCommand({
                TableName: this.tableName,
                Key: { id }
            })
        );

        return (result.Item as T) || null;
    }

    /**
     * Finds all items in the table
     * @returns Array of items
     */
    async findAll(): Promise<T[]> {
        const result = await this.client.send(
            new ScanCommand({
                TableName: this.tableName
            })
        );

        return result.Items as T[] || [];
    }

    /**
     * Updates an item
     * @param id Item ID
     * @param item Item data to update
     * @returns Updated item or null if not found
     */
    async update(id: string, item: Partial<T>): Promise<T | null> {
        // First check if the item exists
        const existingItem = await this.findById(id);
        if (!existingItem) {
            return null;
        }

        const updates = Object.entries(item).filter(([_, value]) => value !== undefined);

        if (updates.length === 0) {
            return existingItem;
        }

        const now = new Date().toISOString();

        // Build update expression and attribute values
        let updateExpression = 'SET updatedAt = :updatedAt';
        const expressionAttributeValues: Record<string, any> = {
            ':updatedAt': now
        };

        updates.forEach(([key, value]) => {
            updateExpression += `, ${key} = :${key}`;
            expressionAttributeValues[`:${key}`] = value;
        });

        const result = await this.client.send(
            new UpdateCommand({
                TableName: this.tableName,
                Key: { id },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            })
        );

        return result.Attributes as T;
    }

    /**
     * Deletes an item
     * @param id Item ID
     * @returns True if deleted, false if not found
     */
    async delete(id: string): Promise<boolean> {
        // First check if the item exists
        const existingItem = await this.findById(id);
        if (!existingItem) {
            return false;
        }

        await this.client.send(
            new DeleteCommand({
                TableName: this.tableName,
                Key: { id }
            })
        );

        return true;
    }

    /**
     * Queries items by a secondary index
     * @param indexName Name of the index
     * @param keyName Key name for the condition
     * @param keyValue Value to match
     * @returns Array of matching items
     */
    protected async queryByIndex(indexName: string, keyName: string, keyValue: string): Promise<T[]> {
        const result = await this.client.send(
            new QueryCommand({
                TableName: this.tableName,
                IndexName: indexName,
                KeyConditionExpression: `${keyName} = :value`,
                ExpressionAttributeValues: {
                    ':value': keyValue
                }
            })
        );

        return result.Items as T[] || [];
    }
} 