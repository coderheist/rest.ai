#!/bin/bash

echo "========================================"
echo "AI Resume Screener - AI Service Startup"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Check if requirements are installed
if ! pip show fastapi > /dev/null 2>&1; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
    
    echo "Downloading spaCy model..."
    python -m spacy download en_core_web_sm
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and configure your API keys"
    echo ""
    exit 1
fi

# Start the service
echo "Starting AI Service..."
echo "API Documentation will be available at: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --port 8000
