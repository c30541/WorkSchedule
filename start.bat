@echo off
chcp 65001 >nul
echo ========================================
echo 班表管理系統啟動腳本
echo ========================================
echo.

echo [1/3] 檢查 Docker 是否已安裝...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：找不到 Docker
    echo.
    echo 請先安裝 Docker Desktop：
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo ✓ Docker 已安裝
docker --version
echo.

echo [2/3] 檢查 Docker Compose 是否已安裝...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：找不到 Docker Compose
    echo.
    echo Docker Compose 通常隨 Docker Desktop 一起安裝
    echo 請確認 Docker Desktop 已正確安裝
    echo.
    pause
    exit /b 1
)
echo ✓ Docker Compose 已安裝
docker-compose --version
echo.

echo [3/3] 啟動服務...
echo 正在啟動資料庫和應用程式，請稍候...
echo.
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ❌ 啟動失敗！
    echo.
    echo 常見問題排除：
    echo 1. 確認 Docker Desktop 是否正在運行
    echo 2. 檢查 3000 和 5432 port 是否已被占用
    echo 3. 查看錯誤訊息並根據提示操作
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ 啟動成功！
echo ========================================
echo.
echo 服務正在啟動中，請稍候片刻後訪問：
echo.
echo   主頁：      http://localhost:3000
echo   班表管理：  http://localhost:3000/schedule
echo   員工管理：  http://localhost:3000/employees
echo.
echo 首次啟動可能需要 5-10 分鐘下載相關映像檔
echo 請等待服務完全啟動後再訪問網站
echo.
echo 提示：您可以執行 docker-compose ps 查看服務狀態
echo ========================================
echo.
pause
