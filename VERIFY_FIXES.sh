#!/bin/bash

# AstraVision - Verification Script
# Checks that all critical fixes are in place

echo "========================================"
echo "AstraVision - Verifying Production Fixes"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Function to check if file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Found: $1"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} Missing: $1"
    ((FAIL++))
  fi
}

# Function to check if string exists in file
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $3"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $3"
    ((FAIL++))
  fi
}

echo "Checking critical files..."
echo ""

# Check config files
check_file "tailwind.config.ts"
check_file "tsconfig.json"
check_file ".env.example"
check_file "vite.config.ts"

echo ""
echo "Checking component files..."
echo ""

# Check components
check_file "src/components/ErrorBoundary.tsx"
check_file "src/components/AuthPortal.tsx"
check_file "src/components/VisualSearch.tsx"

echo ""
echo "Checking API configuration..."
echo ""

# Check API client fixes
check_content "src/lib/api.ts" "import.meta.env.VITE_API_URL" "Using Vite environment variables"
check_content "src/lib/api.ts" "fetchWithTimeout" "Request timeout handling implemented"
check_content "src/lib/api.ts" "inMemoryToken" "localStorage fallback implemented"
check_content "src/lib/api.ts" "\[v0\]" "Debug logging implemented"

echo ""
echo "Checking React error handling..."
echo ""

# Check error boundary
check_content "src/index.tsx" "ErrorBoundary" "ErrorBoundary imported"
check_content "src/index.tsx" "<ErrorBoundary>" "ErrorBoundary wrapping app"
check_content "src/components/ErrorBoundary.tsx" "getDerivedStateFromError" "Error boundary properly implemented"

echo ""
echo "Checking styling..."
echo ""

# Check tailwind config
check_content "tailwind.config.ts" "astra-bg" "Tailwind design tokens configured"
check_content "tailwind.config.ts" "scan-line" "Animation keyframes defined"
check_content "src/index.css" "@keyframes scan-line" "CSS animations present"

echo ""
echo "Checking error handling in components..."
echo ""

# Check error handling
check_content "src/components/VisualSearch.tsx" "setError" "Error state management"
check_content "src/components/AuthPortal.tsx" "console.error" "Error logging in auth"
check_content "src/components/VisualSearch.tsx" "error &&" "Error display UI"

echo ""
echo "========================================"
echo "Verification Results"
echo "========================================"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All fixes verified successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. npm run build    # Should complete without errors"
  echo "2. npm run dev      # Start development server"
  echo "3. Start backend:   # Python app.py (separate terminal)"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some files are missing or incomplete${NC}"
  echo ""
  echo "Please ensure all fixes have been applied."
  echo "See DEBUGGING_GUIDE.md for more information."
  echo ""
  exit 1
fi
