@echo off
title BAVI Website - Developer Environment
echo ===================================================
echo   Starting BAVI Local Web Server and Folder Watcher
echo ===================================================
echo.
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to run dev script. Make sure Node.js is installed.
    pause
)
