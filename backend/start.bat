@echo off
echo 🚀 Starting CargoCrazee Backend Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if config.env exists
if not exist "config.env" (
    echo ⚠️  config.env file not found. Please create it with your MongoDB URI and other configuration.
    echo 📝 Example config.env:
    echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
    echo PORT=5000
    echo JWT_SECRET=your_secret_key
    echo NODE_ENV=development
    pause
    exit /b 1
)

echo ✅ Configuration file found

REM Start the server
echo 🚀 Starting CargoCrazee Backend Server...
echo 📍 Server will be available at: http://localhost:5000
echo 🔗 Health check: http://localhost:5000/api/health
echo 📚 API Documentation: Check README.md for detailed API docs
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
