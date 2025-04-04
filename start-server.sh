#!/bin/bash

echo "Setting up environment..."
export NODE_PATH=./src
export TS_NODE_PROJECT="./tsconfig.json"

echo "Starting server..."
npx ts-node-dev --transpile-only --respawn src/index.ts 