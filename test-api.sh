#!/bin/bash

# Test API connection
echo "Testing API connection..."

# Try to login (adjust credentials if needed)
echo "Attempting login..."
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' > /tmp/login.json

TOKEN=$(cat /tmp/login.json | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Response:"
  cat /tmp/login.json
  echo ""
  echo "Please create a user or use correct credentials"
  exit 1
fi

echo "✓ Login successful"
echo ""

# Test transaction search
echo "Testing transaction search..."
curl -s -X POST http://localhost:8080/api/v1/transactions/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"criteria":[],"page":0,"size":20,"sortBy":"date","sortOrder":"DESC"}'

echo ""
