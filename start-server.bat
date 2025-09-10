@echo off
echo Starting IMTTI Website Server...
echo.
echo Opening website at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try Python first
python -m http.server 8080 2>nul
if %errorlevel% neq 0 (
    echo Python not found, trying Node.js...
    npx http-server -p 8080 -c-1 2>nul
    if %errorlevel% neq 0 (
        echo Neither Python nor Node.js found.
        echo Please install Python or Node.js to run a local server.
        echo.
        echo Alternatively, you can:
        echo 1. Use a code editor like VS Code with Live Server extension
        echo 2. Upload to a hosting service like Netlify or Vercel
        echo.
        pause
    )
)
