@echo off
REM AstraVision Development Startup Script for Windows
REM This script starts both frontend and backend in development mode

title AstraVision Development Mode
color 0A

echo.
echo ============================================
echo 🚀 AstraVision AI Platform - Development Mode
echo ============================================
echo.

REM Check if .env files exist
echo 📋 Checking environment configuration...
echo.

if not exist "backend\.env" (
    echo ⚠️  backend\.env not found. Creating from .env.example...
    copy backend\.env.example backend\.env
    echo Please edit backend\.env and set your DATABASE_URL
    echo.
)

if not exist ".env.local" (
    echo ⚠️  .env.local not found. Creating...
    echo VITE_API_URL=http://localhost:5000/api > .env.local
    echo ✓ Created .env.local
    echo.
)

REM Create uploads directory
if not exist "backend\uploads" (
    mkdir backend\uploads
    echo ✓ Created backend\uploads directory
    echo.
)

echo 🔧 Starting services...
echo.

REM Start backend
echo Starting Backend (Port 5000)...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements if needed
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
)

REM Start backend in new window
set FLASK_ENV=development
set FLASK_DEBUG=True
start "AstraVision Backend" python wsgi.py
echo ✓ Backend started
echo.

cd ..

REM Wait for backend to start
echo Waiting for backend to be ready...
timeout /t 3 /nobreak

REM Test backend connectivity
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend not responding yet, starting frontend anyway...
) else (
    echo ✓ Backend is responding
)

echo.

REM Start frontend
echo Starting Frontend (Port 5173)...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Start frontend in new window
start "AstraVision Frontend" npm run dev

echo ✓ Frontend started
echo.

REM Display information
echo ===========================================
echo ✓ All services started!
echo ===========================================
echo.
echo 📱 Access the application:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   API:      http://localhost:5000/api
echo.
echo 📚 Quick Links:
echo   Health Check: curl http://localhost:5000/api/health
echo.
echo ⚠️  New windows will open for Backend and Frontend
echo ⚠️  Close those windows to stop the services
echo ⚠️  Close this window to complete shutdown
echo.

pause
