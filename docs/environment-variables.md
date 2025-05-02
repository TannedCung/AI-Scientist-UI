# Environment Variables

This document lists all the environment variables used in the AI Scientist Paper Generator application.

## Overview

Environment variables are used for configuration across the entire application stack. These variables can be set in a `.env` file at the root of the project or provided directly to the Docker containers.

## Required Environment Variables

### Database Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `POSTGRES_USER` | PostgreSQL database username | `postgres` | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL database password | `postgres` | `your_secure_password` |
| `POSTGRES_SERVER` | PostgreSQL server hostname | `localhost` | `postgres` |
| `POSTGRES_PORT` | PostgreSQL server port | `5432` | `5432` |
| `POSTGRES_DB` | PostgreSQL database name | `ai_scientist` | `ai_scientist` |

### Cloudflare R2 Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `R2_ENDPOINT_URL` | Cloudflare R2 endpoint URL | None | `https://your-account.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key ID | None | `your_access_key_id` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret access key | None | `your_secret_access_key` |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name | `ai-scientist` | `your-bucket-name` |

### API Keys

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM access | None | `sk-...` |
| `S2_API_KEY` | Semantic Scholar API key (optional) | None | `your_s2_api_key` |

### Frontend Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_URL` | URL for the backend API | None | `http://localhost:8000/api` |

## Optional Environment Variables

### Server Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Port for the backend server | `8000` | `8080` |
| `HOST` | Host for the backend server | `0.0.0.0` | `127.0.0.1` |
| `LOG_LEVEL` | Logging level | `info` | `debug` |

### AI-Scientist-v2 Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DEFAULT_LLM_MODEL` | Default LLM model for AI-Scientist | `gpt-4o-2024-05-13` | `claude-3-5-sonnet` |
| `MAX_NUM_GENERATIONS` | Maximum number of generations for idea creation | `10` | `20` |
| `NUM_REFLECTIONS` | Number of reflections for idea generation | `3` | `5` |

## Docker-Specific Variables

When using Docker, some additional variables can be set in the `docker-compose.yml` file:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `TZ` | Timezone for containers | `UTC` | `America/New_York` |
| `PYTHONUNBUFFERED` | Python output buffering | `1` | `1` |

## Environment File Example

Here's a complete example `.env` file:

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_SERVER=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ai_scientist

# Cloudflare R2
R2_ENDPOINT_URL=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=ai-scientist

# API Keys
OPENAI_API_KEY=sk-your_openai_key
S2_API_KEY=your_semantic_scholar_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Server Configuration
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info

# AI-Scientist-v2 Configuration
DEFAULT_LLM_MODEL=gpt-4o-2024-05-13
MAX_NUM_GENERATIONS=10
NUM_REFLECTIONS=3
```

## Environment Variable Usage

### In Python Code

Environment variables are accessed in Python using the `os.getenv` function with a default value:

```python
import os

db_name = os.getenv("POSTGRES_DB", "ai_scientist")
```

### In JavaScript/TypeScript Code

In the frontend, environment variables are accessed using `process.env`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
```

Note that only variables prefixed with `NEXT_PUBLIC_` are available in the client-side code.

## Security Considerations

- Never commit `.env` files to version control
- Use different credentials for development and production
- Consider using a secret management solution for production deployments
- Limit API key permissions to only what is needed 