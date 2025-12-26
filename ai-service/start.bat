@echo off
echo ========================================
echo AI Resume Screener - AI Service Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Check if requirements are installed
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
    
    echo Downloading spaCy model...
    python -m spacy download en_core_web_sm
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure your API keys
    echo.
    pause
    exit /b 1
)

REM Start the service
echo Starting AI Service...
echo API Documentation will be available at: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --port 8000
