# Docker Setup for AI Scientist Paper Generator

This document explains the Docker configuration for the AI Scientist Paper Generator, including port setup and potential issues.

## Docker Components

The application is containerized using Docker Compose with three main services:

1. **PostgreSQL Database**: Stores research ideas and experiment runs
2. **FastAPI Backend**: Provides the API endpoints and business logic
3. **Next.js Frontend**: Provides the user interface

## Port Configuration

To avoid conflicts with commonly used ports, the following port mappings are used:

| Service   | Container Port | Host Port | Purpose                   |
|-----------|----------------|-----------|---------------------------|
| PostgreSQL| 5432           | 5433      | Database connection       |
| Backend   | 8000           | 8001      | API endpoints             |
| Frontend  | 3000           | 3001      | Web interface             |

These mappings allow you to run the application alongside other services that might be using the standard ports (3000, 5432, 8000).

## Environment Configuration

The application uses environment variables for configuration, which are loaded from a `.env` file. Key environment variables include:

- Database connection parameters
- API keys for OpenAI and Semantic Scholar
- Frontend API URL configuration (`NEXT_PUBLIC_API_URL=http://localhost:8001/api`)

## Building the Frontend Container

The frontend is built using a multi-stage Docker build process:

1. The **builder** stage installs dependencies and builds the Next.js application
2. The **runner** stage copies the built application and runs it

This approach results in a smaller, more efficient production container.

## Version Control Configuration

The project includes comprehensive `.gitignore` files to ensure that only source code and configuration files are tracked in version control, while generated files, dependencies, and environment-specific files are excluded.

### Main `.gitignore`

The root `.gitignore` file covers general patterns for both JavaScript/TypeScript and Python projects, as well as environment files, IDE configurations, and operating system-specific files.

### Frontend-specific `.gitignore`

Located in the `frontend/` directory, this file excludes:
- Node.js dependencies (`node_modules/`)
- Next.js build output (`.next/`, `out/`)
- TypeScript build information
- Local environment files

### Backend-specific `.gitignore`

Located in the `backend/` directory, this file excludes:
- Python bytecode and cache files
- Virtual environments
- AI-Scientist-v2 cloned repository
- Generated data and result files

These configurations ensure that sensitive information like API keys in `.env` files and large generated files are not committed to the repository.

## Common Issues and Solutions

### Port Conflicts

If you encounter errors like `Bind for 0.0.0.0:3001 failed: port is already allocated`, you can modify the port mappings in `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "3002:3000"  # Change 3001 to another available port
```

Remember to update corresponding references to the port in your documentation.

### Accessing the Application

After running `docker compose up`, you can access:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001/api
- API Documentation: http://localhost:8001/api/docs

### Stopping the Containers

To stop the application, use:

```bash
docker compose down
```

To remove all containers, networks, and volumes:

```bash
docker compose down -v
```

## Development Workflow

When developing, you can use volume mounts to reflect changes in real-time:

1. Changes to frontend code will be reflected after a browser refresh
2. Backend code changes require restarting the backend container: `docker compose restart backend` 