@echo off
echo ================================================
echo Installing Patent Registry Dependencies
echo ================================================

echo.
echo [1/2] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b %errorlevel%
)

cd ..

echo.
echo ================================================
echo Installation Complete!
echo ================================================
echo.
echo To start the application:
echo 1. Run "start-backend.bat" in one terminal
echo 2. Run "start-frontend.bat" in another terminal
echo.
pause
