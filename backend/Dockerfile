FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    wget \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Clone AI-Scientist-v2 repository if not already cloned during build
RUN if [ ! -d "/app/app/services/AI-Scientist-v2" ]; then \
        mkdir -p /app/app/services && \
        git clone https://github.com/SakanaAI/AI-Scientist-v2.git /app/app/services/AI-Scientist-v2; \
    fi

# Install AI-Scientist-v2 requirements
RUN pip install --no-cache-dir -r /app/app/services/AI-Scientist-v2/requirements.txt

# Expose the port the app will run on
EXPOSE 8000

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8000/api/health || exit 1

# Start the FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "5"] 