#!/bin/bash

echo "Testing API server..."
curl -s http://localhost:3000/api/v1 || echo "Server not responding on default API path"

echo -e "\n\nTesting Swagger documentation..."
curl -s http://localhost:3000/api-docs || echo "Swagger documentation not available"

echo -e "\n\nTesting Swagger JSON..."
curl -s http://localhost:3000/api-docs.json || echo "Swagger JSON not available" 