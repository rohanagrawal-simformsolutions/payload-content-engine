#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Payload Content Engine...${NC}"
echo ""

# Check if backend node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing backend dependencies...${NC}"
    npm install
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${GREEN}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo ""
echo -e "${GREEN}Starting services...${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:3000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend in background
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${GREEN}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for both processes
wait
