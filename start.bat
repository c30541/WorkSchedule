@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo Work Schedule Management System
echo ========================================
echo.

echo [1/3] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found
    echo.
    echo Please install Docker Desktop first:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo OK - Docker is installed
docker --version
echo.

echo [2/3] Checking Docker Compose installation...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose not found
    echo.
    echo Docker Compose is usually installed with Docker Desktop
    echo Please make sure Docker Desktop is properly installed
    echo.
    pause
    exit /b 1
)
echo OK - Docker Compose is installed
docker-compose --version
echo.

echo [3/3] Starting services...
echo Starting database and application, please wait...
echo.
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start services!
    echo.
    echo Common troubleshooting:
    echo 1. Make sure Docker Desktop is running
    echo 2. Check if ports 3000 and 5432 are in use
    echo 3. Check error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: Services started!
echo ========================================
echo.
echo Services are starting up, please wait a moment then visit:
echo.
echo   Home:       http://localhost:3000
echo   Schedule:   http://localhost:3000/schedule
echo   Employees:  http://localhost:3000/employees
echo.
echo First startup may take 5-10 minutes to download images
echo Please wait for services to fully start before accessing
echo.
echo Tip: You can run "docker-compose ps" to check service status
echo ========================================
echo.
pause
