#!/bin/bash
set -e

echo "🧪 Testing local build..."

# Step 1: Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv .venv_test
source .venv_test/bin/activate

# Step 2: Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Step 3: Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Step 4: Verify pydantic-core installation
echo "✅ Verifying pydantic-core..."
python -c "import pydantic_core; print(f'pydantic-core version: {pydantic_core.__version__}')"

# Step 5: Verify pydantic and pydantic-settings
echo "✅ Verifying pydantic..."
python -c "import pydantic; print(f'pydantic version: {pydantic.__version__}')"
python -c "import pydantic_settings; print(f'pydantic-settings version: {pydantic_settings.__version__}')"

# Step 6: Test app import
echo "✅ Testing app import..."
python -c "from app.config import settings; print(f'App config loaded: {settings.APP_NAME}')"

# Step 7: Cleanup
echo "🧹 Cleaning up..."
deactivate
rm -rf .venv_test

echo "🎉 All tests passed!"