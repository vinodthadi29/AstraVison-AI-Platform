#!/bin/bash
# Development setup script for AstraVision Backend

set -e

echo "🚀 AstraVision Backend Development Setup"
echo "========================================"

# Check Python version
echo "✓ Checking Python version..."
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "  Python $python_version found"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "✓ Creating virtual environment..."
    python -m venv venv
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "✓ Upgrading pip..."
pip install --upgrade pip setuptools wheel > /dev/null

# Install dependencies
echo "✓ Installing dependencies..."
pip install -r requirements.txt > /dev/null

# Setup environment variables
if [ ! -f ".env" ]; then
    echo "✓ Creating .env file from template..."
    cp .env.example .env
    echo "  Note: Update .env with your configuration"
else
    echo "✓ .env file already exists"
fi

# Check PostgreSQL
echo "✓ Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "  PostgreSQL is installed"
else
    echo "  ⚠ PostgreSQL not found. Install it for the local database."
    echo "  macOS: brew install postgresql@15"
    echo "  Ubuntu: sudo apt-get install postgresql"
fi

# Check Redis
echo "✓ Checking Redis..."
if command -v redis-cli &> /dev/null; then
    echo "  Redis is installed"
else
    echo "  ⚠ Redis not found. Install it for caching."
    echo "  macOS: brew install redis"
    echo "  Ubuntu: sudo apt-get install redis-server"
fi

# Check Docker
echo "✓ Checking Docker..."
if command -v docker &> /dev/null; then
    echo "  Docker is installed ($(docker --version))"
else
    echo "  ⚠ Docker not found. Install for containerized setup."
fi

echo ""
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Option A (Docker): docker-compose up --build"
echo "3. Option B (Manual): python -m flask --app wsgi run --debug"
echo ""
echo "Backend will run on http://localhost:5000"
echo "========================================"
