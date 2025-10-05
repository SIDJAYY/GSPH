@echo off
echo Starting GoServePH Services...

echo.
echo Starting Auth Service (Port 8000)...
start "Auth Service" cmd /k "cd /d D:\esmv2-main\microservices\auth_service && php artisan serve --port=8000"

echo.
echo Starting Frontend Service (Port 5173)...
start "Frontend Service" cmd /k "cd /d D:\esmv2-main\GSM && npm run dev"

echo.
echo Services are starting...
echo Auth Service: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
