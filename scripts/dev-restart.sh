#!/bin/bash

echo "🔄 Restarting development server..."

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Regenerate Prisma client
echo "📦 Regenerating Prisma client..."
npx prisma generate

# Start the development server
echo "🚀 Starting development server..."
npm run dev