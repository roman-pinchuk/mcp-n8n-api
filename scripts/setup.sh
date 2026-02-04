#!/bin/bash

# Quick setup script for mcp-n8n-api

set -e

echo "🚀 Setting up mcp-n8n-api..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your n8n API credentials!"
    echo ""
    echo "Required variables:"
    echo "  - N8N_API_URL (e.g., http://localhost:5678/api/v1)"
    echo "  - N8N_API_KEY (get from n8n Settings → API)"
    echo ""
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your n8n credentials"
echo "  2. Run: npm start"
echo "  3. Configure Claude Desktop or OpenCode (see README.md)"
echo ""
