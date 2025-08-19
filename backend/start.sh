#!/bin/bash

echo "🚀 Starting CargoCrazee Backend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "⚠️  config.env file not found. Please create it with your MongoDB URI and other configuration."
    echo "📝 Example config.env:"
    echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    echo "PORT=5000"
    echo "JWT_SECRET=your_secret_key"
    echo "NODE_ENV=development"
    exit 1
fi

echo "✅ Configuration file found"

# Start the server
echo "🚀 Starting CargoCrazee Backend Server..."
echo "📍 Server will be available at: http://localhost:5000"
echo "🔗 Health check: http://localhost:5000/api/health"
echo "📚 API Documentation: Check README.md for detailed API docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
