@echo off
REM Quick Start Script for Express Extended Project (Windows)

color 0A
cls
echo ======================================
echo Express Extended - Quick Start
echo ======================================
echo.

echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo [OK] Node.js found
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker not found. Docker Compose setup will not work.
) else (
    echo [OK] Docker found
)

echo.
echo Select startup mode:
echo 1) Single Server (npm start on port 3000)
echo 2) Load Balanced (Docker Compose - 3 servers + NGINX)
echo 3) Manual Multi-Server (Run 3 instances manually)
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Starting single server...
    echo Installing dependencies...
    call npm install
    echo.
    echo [OK] Dependencies installed
    echo Starting server on port 3000...
    cmd /c "set PORT=3000 && npm start"
) else if "%choice%"=="2" (
    echo Starting with Docker Compose...
    where docker-compose >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo Docker Compose not found. Please install Docker Desktop.
        pause
        exit /b 1
    )
    echo Building images...
    call docker-compose build
    echo Starting services...
    call docker-compose up -d
    echo.
    echo [OK] Services started!
    echo.
    echo Access points:
    echo   NGINX Load Balancer: http://localhost
    echo   Server 1: http://localhost:3000
    echo   Server 2: http://localhost:3001
    echo   Server 3: http://localhost:3002
    echo.
    echo View logs:
    echo   docker-compose logs -f
    echo.
    echo Stop services:
    echo   docker-compose down
) else if "%choice%"=="3" (
    echo Manual multi-server setup
    echo Installing dependencies...
    call npm install
    echo.
    echo [OK] Dependencies installed
    echo.
    echo Instructions for manual setup:
    echo.
    echo 1. Open PowerShell/CMD Terminal 1:
    echo    $env:PORT=3000; npm start
    echo.
    echo 2. Open PowerShell/CMD Terminal 2:
    echo    $env:PORT=3001; npm start
    echo.
    echo 3. Open PowerShell/CMD Terminal 3:
    echo    $env:PORT=3002; npm start
    echo.
    echo 4. For NGINX (on Windows):
    echo    - Download NGINX from https://nginx.org/en/download.html
    echo    - Replace nginx.conf with the file from nginx/ directory
    echo    - Run: nginx.exe
    echo.
    echo Access via NGINX: http://localhost
    echo.
    pause
) else (
    color 0C
    echo Invalid choice
    pause
    exit /b 1
)

echo.
color 0A
echo [OK] Setup complete!
echo.
echo Next steps:
echo 1. Review SETUP_GUIDE.md for detailed documentation
echo 2. Check QUICK_REFERENCE.md for common commands
echo 3. Read COMPLETE_SETUP_SUMMARY.md for overview
echo.
echo Documentation files:
echo   docs/LOAD_BALANCING_NGINX.js - Load balancing guide
echo   docs/DATABASE_SHARDING.js - Sharding patterns
echo   docs/DATABASE_REPLICATION.js - Replication patterns
echo   middleware/rateLimiting.js - Rate limiting examples
echo   middleware/apiVersioning.js - API versioning examples
echo.
pause
