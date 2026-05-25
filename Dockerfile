# =============================================================================
# Dockerfile — LifeManager Application
# =============================================================================
# Purpose:
#   Multi-stage Docker build for the LifeManager full-stack application.
#   Stage 1 (frontend-builder): Builds the React/Vite frontend into static assets.
#   Stage 2 (runtime): Installs Python backend dependencies, copies backend code
#   and the pre-built frontend assets, then serves the FastAPI application via uvicorn.
#
# Inputs:
#   - frontend/ directory (React source)
#   - app/ directory (FastAPI backend source)
#   - requirements.txt (Python dependencies)
#   - alembic.ini + alembic/ (database migrations)
#
# Outputs:
#   - Docker image exposing port 8000, running uvicorn on app.main:app
#
# Side effects:
#   - Installs system packages (gcc) for Python native extensions
#   - Creates runtime.txt for Render deployment compatibility
# =============================================================================

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM python:3.12.7-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/
COPY alembic.ini ./
COPY alembic/ ./alembic/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Create runtime.txt for Render
RUN echo "python-3.12.7" > runtime.txt

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]