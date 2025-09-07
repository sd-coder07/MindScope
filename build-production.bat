@echo off
REM Build script for MindScope Multilingual AI Therapist
REM Handles permission issues and optimizes the build process

echo Building MindScope Multilingual AI Therapist...
echo.

REM Set environment variables
set NEXT_TELEMETRY_DISABLED=1
set NODE_ENV=production

REM Navigate to project directory
cd /d "%~dp0"

REM Clean previous builds (with error handling)
echo Cleaning previous builds...
if exist ".next" (
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
    if exist ".next" (
        echo Warning: Could not remove .next directory completely
        echo Attempting to clean cache files...
        del /q ".next\*" 2>nul
        for /d %%d in (".next\*") do rmdir /s /q "%%d" 2>nul
    )
)

REM Clean node modules cache if needed
if exist "node_modules\.cache" (
    echo Cleaning node modules cache...
    rmdir /s /q "node_modules\.cache" 2>nul
)

echo.
echo Starting build process...
echo.

REM Run the build
call npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo ========================================
    echo.
    echo The multilingual AI therapist is ready for production.
    echo.
    echo Features included:
    echo - 7+ language support ^(EN, ES, FR, DE, ZH-CN, JA, AR^)
    echo - Cultural adaptation engine
    echo - Crisis detection and safety systems
    echo - Localized emergency resources
    echo - Voice recognition support
    echo - RTL language support
    echo.
    echo To start the production server:
    echo npm start
    echo.
) else (
    echo.
    echo ========================================
    echo Build failed with error code %ERRORLEVEL%
    echo ========================================
    echo.
    echo Troubleshooting steps:
    echo 1. Check if all dependencies are installed: npm install
    echo 2. Verify TypeScript compilation: npm run type-check
    echo 3. Check for syntax errors in the console output above
    echo 4. Ensure all required environment variables are set
    echo.
    echo For development testing, use: npm run dev
    echo.
)

pause
