#!/bin/bash

# Corbe Development Server Starter

echo "🚀 Starting Corbe Development Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed"
        exit 1
    fi
fi

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  Please update .env.local with your MongoDB URI and API keys"
    echo ""
fi

# Start the development server
echo "✨ Starting Next.js development server..."
echo "📍 Visit http://localhost:3000"
echo ""

npm run dev
