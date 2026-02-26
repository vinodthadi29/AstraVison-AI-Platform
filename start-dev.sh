#!/bin/bash

# AstraVision Development Startup Script
# This script starts both frontend and backend in development mode

set -e

echo "🚀 AstraVision AI Platform - Development Mode"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
echo -e "${BLUE}📋 Checking environment configuration...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Creating from .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please edit backend/.env and set your DATABASE_URL${NC}"
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating...${NC}"
    echo "VITE_API_URL=http://localhost:5000/api" > .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "backend/uploads" ]; then
    mkdir -p backend/uploads
    echo -e "${GREEN}✓ Created backend/uploads directory${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Starting services...${NC}"
echo ""

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Services stopped${NC}"
}

trap cleanup EXIT

# Start backend in background
echo -e "${BLUE}Starting Backend (Port 5000)...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install/update requirements
if ! pip show flask > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install -r requirements.txt
fi

# Start backend server
export FLASK_ENV=development
export FLASK_DEBUG=True
python wsgi.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 2

# Test backend connectivity
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not responding yet, starting frontend anyway...${NC}"
fi

echo ""

# Start frontend in background
echo -e "${BLUE}Starting Frontend (Port 5173)...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}✓ All services started!${NC}"
echo ""
echo -e "${BLUE}📱 Access the application:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:5000${NC}"
echo -e "  API:      ${GREEN}http://localhost:5000/api${NC}"
echo ""
echo -e "${BLUE}📚 Quick Links:${NC}"
echo -e "  Health Check: curl http://localhost:5000/api/health"
echo -e "  Register:     curl -X POST http://localhost:5000/api/auth/register -H \"Content-Type: application/json\" -d '{\"email\":\"test@example.com\",\"password\":\"Password123\"}'"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait
