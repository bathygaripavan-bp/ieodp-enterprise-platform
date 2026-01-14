@echo off
echo Starting Python Service...
cd /d "%~dp0"
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing/Updating dependencies...
pip install -r requirements.txt --quiet
echo Starting FastAPI server on http://localhost:8000
echo.
echo API Documentation: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health/health
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
