#!/bin/bash
# Enhanced deployment verification script

echo "🔍 DEPLOYMENT STATUS CHECK"
echo "=========================="
echo ""

# Test basic connectivity
echo "1️⃣ Testing basic connectivity..."
if curl -s https://whiteboard-backend-07zw.onrender.com/api > /dev/null; then
    echo "✅ Backend is reachable"
else
    echo "❌ Backend is NOT reachable"
    exit 1
fi

echo ""
echo "2️⃣ Checking API response..."
API_RESPONSE=$(curl -s https://whiteboard-backend-07zw.onrender.com/api)
echo "Response: $API_RESPONSE"

# Check if updated code is deployed
if echo "$API_RESPONSE" | grep -q "cors_origins"; then
    echo "✅ Updated backend code is deployed"
else
    echo "❌ Backend code needs to be redeployed with latest changes"
fi

echo ""
echo "3️⃣ Testing health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://whiteboard-backend-07zw.onrender.com/api/health)
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint not found (HTTP $HEALTH_STATUS) - backend needs update"
fi

echo ""
echo "4️⃣ Testing CORS from Vercel domain..."
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: https://whiteboard-frontend-jade.vercel.app" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    https://whiteboard-backend-07zw.onrender.com/api)

if [ "$CORS_RESPONSE" = "204" ]; then
    echo "✅ CORS preflight successful"
    # Check if the origin is allowed
    CORS_ORIGIN=$(curl -s -H "Origin: https://whiteboard-frontend-jade.vercel.app" \
        https://whiteboard-backend-07zw.onrender.com/api | \
        curl -s -I -H "Origin: https://whiteboard-frontend-jade.vercel.app" \
        https://whiteboard-backend-07zw.onrender.com/api | \
        grep -i "access-control-allow-origin" | cut -d' ' -f2-)
    
    if echo "$CORS_ORIGIN" | grep -q "whiteboard-frontend-jade.vercel.app"; then
        echo "✅ Vercel domain is allowed by CORS"
    else
        echo "❌ CORS is not configured for Vercel domain"
        echo "   Current allowed origin: $CORS_ORIGIN"
    fi
else
    echo "❌ CORS preflight failed (HTTP $CORS_RESPONSE)"
fi

echo ""
echo "5️⃣ Testing frontend connectivity..."
if curl -s https://whiteboard-frontend-jade.vercel.app > /dev/null; then
    echo "✅ Frontend is reachable"
else
    echo "❌ Frontend is NOT reachable"
fi

echo ""
echo "📋 SUMMARY:"
echo "==========="
echo "Backend URL: https://whiteboard-backend-07zw.onrender.com"
echo "Frontend URL: https://whiteboard-frontend-jade.vercel.app"
echo ""
echo "🔧 RECOMMENDED ACTIONS:"
if [ "$HEALTH_STATUS" != "200" ]; then
    echo "1. Redeploy backend on Render with latest code"
fi
echo "2. Check Render environment variables:"
echo "   - FRONTEND_URL=https://whiteboard-frontend-jade.vercel.app"
echo "   - NODE_ENV=production"
echo "3. Redeploy frontend on Vercel if backend was updated"
