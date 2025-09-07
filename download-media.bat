@echo off
echo 🧘‍♀️ MindScope Media Downloader
echo ==============================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Install required packages
echo 📦 Installing required packages...
pip install requests >nul 2>&1

REM Run the download script
echo 🚀 Starting media downloader...
python download-media.py

pause
