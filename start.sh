#!/bin/bash

# Start the DFX replica in the background
echo "Starting DFX replica..."
cd backend
dfx stop
dfx start --clean --background

# Deploy all canisters
echo "Deploying canisters..."
dfx deploy

# Start the frontend
echo "Starting frontend..."
cd ../frontend
bun run dev --turbo
