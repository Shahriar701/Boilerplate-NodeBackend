# Serverless Implementation with AWS and DynamoDB

This document outlines the serverless implementation of the Node.js backend boilerplate using AWS Lambda, API Gateway, and DynamoDB.

## Overview

The serverless implementation maintains the same code architecture and design patterns as the original boilerplate, including:
- Dependency Injection using Inversify
- Interface-based design
- SOLID principles
- Repository pattern
- Service pattern

## Changes and Additions

### 1. DynamoDB Support

- Added DynamoDB as a new database option alongside MongoDB and PostgreSQL
- Created database connection for DynamoDB (`src/database/dynamodb.connection.ts`)
- Implemented repository pattern for DynamoDB (`src/repositories/dynamodb/base.repository.ts`)
- Added specific repositories for User and Product entities

### 2. Configuration

- Updated environment configuration to include DynamoDB settings
- Added DynamoDB tables definition in serverless.yml
- Updated the Inversify container to support DynamoDB repositories

### 3. AWS Lambda Integration

- Created a Lambda handler to wrap the Express application
- Configured API Gateway integration
- Set up proper IAM permissions for DynamoDB access

## How It Works

The implementation follows these key principles:

1. **Unified Architecture**: The codebase works with all database types (PostgreSQL, MongoDB, DynamoDB) using the same architectural patterns
2. **Database Selection**: The database type is selected via the `DB_TYPE` environment variable
3. **Dependency Injection**: All components are properly wired using Inversify
4. **API Consistency**: The API remains the same regardless of the underlying database

## Using DynamoDB

To use DynamoDB:

1. Set the environment variable `DB_TYPE=dynamodb`
2. Configure DynamoDB settings:
   - `DYNAMO_REGION`: AWS region for DynamoDB
   - `DYNAMO_ENDPOINT`: Endpoint URL (for local development)
   - `DYNAMO_TABLE_PREFIX`: Prefix for DynamoDB tables

## Deployment

For serverless deployment:

```bash
npm install
serverless deploy
```

For local development:

```bash
npm install
serverless offline
```

## DynamoDB Tables

The implementation uses two main DynamoDB tables:

1. **Users Table**:
   - Primary key: `id` (string)
   - Global Secondary Index: `EmailIndex` on `email` attribute

2. **Products Table**:
   - Primary key: `id` (string)
   - Global Secondary Index: `TypeIndex` on `type` attribute

## Architecture Consistency

This implementation strictly follows the same architecture as the original boilerplate:

- **Repository Layer**: Provides abstract data access
- **Service Layer**: Contains business logic
- **Controller Layer**: Handles HTTP requests and responses
- **Model Layer**: Defines data structures and DTOs

The repositories implement the same interfaces, ensuring that services don't need to change when switching database types. 