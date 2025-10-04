@echo off

echo WARNING: This will delete ALL Docker containers, images, and volumes!
echo This action cannot be undone.
echo.
set /p confirm="Are you sure you want to continue? (Y/N): "

if /i "%confirm%" NEQ "Y" (
    echo Operation cancelled.
    exit /b 0
)

echo.
echo Stopping all running Docker containers...
docker stop $(docker ps -q) 2>nul

echo.
echo Removing all containers...
docker rm -f $(docker ps -aq) 2>nul

echo Removing all images...
docker rmi -f $(docker images -q) 2>nul

echo Removing all volumes...
docker volume rm $(docker volume ls -q) 2>nul

echo.
echo Docker cleanup completed successfully!
pause
