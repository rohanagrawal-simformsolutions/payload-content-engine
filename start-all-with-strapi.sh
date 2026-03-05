#!/bin/bash

# Start all services: Strapi + NestJS Backend + Next.js Frontend

echo "=== Starting All Services ==="
echo ""

# Kill any existing processes on these ports
cleanup() {
    echo "Cleaning up processes..."
    kill $(lsof -t -i:1337) 2>/dev/null || true
    kill $(lsof -t -i:3000) 2>/dev/null || true
    kill $(lsof -t -i:3001) 2>/dev/null || true
    sleep 2
}

trap cleanup EXIT

cleanup

# Start Strapi
if [ -d "strapi-poc" ]; then
    echo "🚀 Starting Strapi on port 1337..."
    cd strapi-poc
    npm run develop &
    STRAPI_PID=$!
    cd ..
    echo "   PID: $STRAPI_PID"
    sleep 5
else
    echo "⚠️  Strapi directory not found. Run setup-strapi.sh first"
fi

# Start NestJS Backend
echo ""
echo "🚀 Starting NestJS Backend on port 3000..."
npm run start:dev &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
sleep 5

# Start Next.js Frontend
echo ""
echo "🚀 Starting Next.js Frontend on port 3001..."
npm run frontend:dev &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:3001"
echo "   Backend: http://localhost:3000"
echo "   Strapi Admin: http://localhost:1337/admin"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

wait
