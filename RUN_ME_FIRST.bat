@echo off
color 0A
echo ========================================================
echo    QUANTUM-RESISTANT PATENT REGISTRY
echo    Installation and Startup Script
echo ========================================================
echo.

echo [STEP 1/4] Installing Backend Dependencies...
cd backend
if not exist "node_modules" (
    call npm install express cors body-parser multer dotenv
    if %errorlevel% neq 0 (
        echo ERROR: Backend installation failed!
        pause
        exit /b 1
    )
)
echo Backend dependencies installed successfully!
echo.

echo [STEP 2/4] Installing Frontend Dependencies...
cd ..\frontend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Frontend installation failed!
        pause
        exit /b 1
    )
)
echo Frontend dependencies installed successfully!
echo.

echo [STEP 3/4] Starting Backend Server...
cd ..\backend
start cmd /k "title Patent Registry Backend && node index-simple.js"
timeout /t 3 /nobreak > nul
echo Backend server starting on http://localhost:4000
echo.

echo [STEP 4/4] Starting Frontend Application...
cd ..\frontend
start cmd /k "title Patent Registry Frontend && npm start"
echo Frontend will open at http://localhost:3000
echo.

echo ========================================================
echo    SETUP COMPLETE!
echo ========================================================
echo.
echo Two windows have been opened:
echo   1. Backend Server (Port 4000)
echo   2. Frontend App (Port 3000)
echo.
echo Your browser will automatically open to http://localhost:3000
echo.
echo To stop the application, close both terminal windows.
echo.
pause
