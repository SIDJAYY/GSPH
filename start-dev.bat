@echo off
echo Starting GSM Development Environment...
echo.

REM Kill any existing Node processes on ports 5173, 5174, and 5000
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do taskkill /F /PID %%a 2>nul

echo.
echo Starting services...
echo Frontend will run on: http://localhost:5173
echo API will run on: http://localhost:5000
echo.

cd GSM
npm run dev:full
