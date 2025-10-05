@echo off
echo ========================================
echo    Starting Google OAuth Services
echo ========================================
echo.

echo [1/3] Starting Auth Service (Port 8000)...
start "Auth Service" cmd /k "cd /d D:\esmv2-main\microservices\auth_service && echo Starting Auth Service... && php artisan serve --port=8000"

echo [2/3] Waiting for auth service to start...
timeout /t 3 /nobreak > nul

echo [3/3] Starting Frontend Service (Port 5173)...
start "Frontend Service" cmd /k "cd /d D:\esmv2-main\GSM && echo Starting Frontend Service... && npm run dev"

echo.
echo ========================================
echo    Services Starting...
echo ========================================
echo Auth Service:    http://localhost:8000
echo Frontend:        http://localhost:5173
echo.
echo Wait 10-15 seconds for services to fully start, then:
echo 1. Go to http://localhost:5173
echo 2. Open Developer Tools (F12)
echo 3. Check Console for environment variables
echo 4. Try the "Continue with Google" button
echo.
echo Press any key to exit this window...
pause > nul
