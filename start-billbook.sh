#!/bin/bash

# BillBook Electron Startup Script
# This script ensures the backend server is running before starting the Electron app

echo "🚀 Starting BillBook Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run BillBook."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to run BillBook."
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
FRONTEND_DIR="$SCRIPT_DIR"
BACKEND_DIR="$SCRIPT_DIR/../backend"

echo "📁 Frontend directory: $FRONTEND_DIR"
echo "📁 Backend directory: $BACKEND_DIR"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start backend if not running
start_backend() {
    if check_port 3000; then
        echo "✅ Backend server is already running on port 3000"
    else
        echo "🔧 Starting backend server..."
        cd "$BACKEND_DIR"
        
        # Check if backend dependencies are installed
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing backend dependencies..."
            npm install
        fi
        
        # Start backend in background
        nohup npm run dev > /dev/null 2>&1 &
        BACKEND_PID=$!
        echo "🌐 Backend server started with PID: $BACKEND_PID"
        
        # Wait for backend to start
        echo "⏳ Waiting for backend server to start..."
        for i in {1..30}; do
            if check_port 3000; then
                echo "✅ Backend server is ready!"
                break
            fi
            sleep 1
            if [ $i -eq 30 ]; then
                echo "❌ Backend server failed to start within 30 seconds"
                exit 1
            fi
        done
    fi
}

# Function to start frontend Electron app
start_frontend() {
    echo "🖥️  Starting Electron application..."
    cd "$FRONTEND_DIR"
    
    # Check if frontend dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Build the app if dist doesn't exist
    if [ ! -d "dist" ]; then
        echo "🔨 Building application..."
        npm run build
    fi
    
    # Start Electron app
    npm run electron
}

# Main execution
echo "🔍 Checking system requirements..."

# Start backend
start_backend

# Start frontend
start_frontend

echo "🎉 BillBook application started successfully!"