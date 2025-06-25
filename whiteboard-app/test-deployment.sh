#!/bin/bash
# Deployment verification script

echo "🔍 Checking frontend configuration..."
echo "Frontend URL: https://whiteboard-frontend-jade.vercel.app"
echo "Backend URL: https://whiteboard-backend-07zw.onrender.com"

echo ""
echo "🔍 Testing backend health..."
curl -v https://whiteboard-backend-07zw.onrender.com/api/health

echo ""
echo "🔍 Testing backend API..."
curl -v https://whiteboard-backend-07zw.onrender.com/api

echo ""
echo "🔍 Testing CORS..."
curl -v -H "Origin: https://whiteboard-frontend-jade.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://whiteboard-backend-07zw.onrender.com/api
