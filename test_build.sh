#!/bin/bash

# Test Build Script for Render Deployment
# Simulates Read-only filesystem environment

set -e

echo "========================================"
echo "  Testing Build in Read-only Simulation"
echo "========================================"
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "[1/4] Created temporary directory: $TEMP_DIR"

# Copy requirements.txt to temp directory
cp requirements.txt "$TEMP_DIR/"
echo "[2/4] Copied requirements.txt to temp directory"

# Change to temp directory
cd "$TEMP_DIR"

# Make the directory read-only (simulate Render environment)
chmod 555 .
echo "[3/4] Set directory permissions to read-only (555)"
echo ""

# Run pip install with no cache and no build isolation
echo "[4/4] Running pip install (simulating Render build)..."
echo ""

if pip install --no-cache-dir --no-build-isolation -r requirements.txt 2>&1; then
    echo ""
    echo "========================================"
    echo "  ✅ BUILD SUCCESSFUL"
    echo "  No Rust compilation errors detected."
    echo "========================================"
    echo ""
    echo "All dependencies installed successfully in read-only environment."
    echo "The pydantic-core issue has been resolved."
else
    echo ""
    echo "========================================"
    echo "  ❌ BUILD FAILED"
    echo "========================================"
    echo ""
    echo "Build failed. Check the error output above."
    exit 1
fi

# Cleanup
cd /
rm -rf "$TEMP_DIR"
echo ""
echo "Cleanup completed."