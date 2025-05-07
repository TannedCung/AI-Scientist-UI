# AI Scientist Paper Generator

A platform for generating workshop-level scientific papers using AI-driven research and experimentation.

![AI Scientist](https://github.com/SakanaAI/AI-Scientist-v2/raw/main/docs/logo_v1.png)

## Overview

The AI Scientist Paper Generator is a full-stack application that automates the process of scientific research paper generation. It integrates with the [AI-Scientist-v2](https://github.com/SakanaAI/AI-Scientist-v2) framework to:

- Generate research hypotheses from your ideas
- Run autonomous experiments
- Produce scientific papers with visualizations
- Track experiment progress and results

## Features

- **Research Idea Creation**: Upload your research idea and code file to start the process
- **AI-Driven Hypothesis Generation**: Automatically generate research hypotheses
- **Autonomous Experimentation**: Run experiments using agentic tree search
- **Paper Generation**: Create workshop-level scientific papers
- **Modern Web Interface**: Track progress and view results through a user-friendly UI

## Architecture

- **Backend**: FastAPI, PostgreSQL, Cloudflare R2
- **Frontend**: Next.js, Material UI
- **AI Engine**: AI-Scientist-v2

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Cloudflare R2 account (or compatible S3 storage)
- OpenAI API key

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AI-Scientist-UI
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3001
   - API: http://localhost:8001/api
   - API Docs: http://localhost:8001/api/docs

## Documentation

For detailed documentation, please see the [docs](./docs) directory:

- [Project Overview](./docs/overview.md)
- [System Architecture](./docs/architecture.md)
- [Setup and Installation](./docs/setup.md)
- [Usage Guide](./docs/usage-guide.md)
- [API Reference](./docs/api-reference.md)

## Development

### Database Migrations

The project uses Alembic for database migrations. Here's how to work with migrations:

1. **Initial Setup**:
   ```bash
   cd backend
   pip install alembic
   alembic init migrations
   ```

2. **Configure Alembic**:
   - Update `alembic.ini` with your database URL:
     ```ini
     sqlalchemy.url = postgresql://postgres:postgres@localhost:5432/ai_scientist
     ```
   - Update `migrations/env.py` to use your models:
     ```python
     from app.models.research_idea import Base
     target_metadata = Base.metadata
     ```

3. **Create a Migration**:
   ```bash
   # Create a new migration
   alembic revision --autogenerate -m "description of changes"
   
   # Apply the migration
   alembic upgrade head
   ```

4. **Common Migration Commands**:
   ```bash
   # View migration history
   alembic history
   
   # Upgrade to latest version
   alembic upgrade head
   
   # Downgrade one version
   alembic downgrade -1
   
   # Downgrade to specific version
   alembic downgrade <revision_id>
   ```

5. **Development Workflow**:
   - After making changes to models, create a new migration
   - Review the generated migration file in `migrations/versions/`
   - Apply the migration to update your database schema
   - Commit both model changes and migration files

### Development Environment Setup

#### Backend Development

1. Set up a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. For debugging in VS Code/Cursor:
   - Create a `.vscode/launch.json` file with the following configuration:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "FastAPI",
         "type": "python",
         "request": "launch",
         "module": "uvicorn",
         "args": [
           "app.main:app",
           "--reload",
           "--host",
           "0.0.0.0",
           "--port",
           "8001"
         ],
         "jinja": true,
         "justMyCode": true
       }
     ]
   }
   ```
   - Start debugging by pressing F5 or using the Run and Debug panel
   - Set breakpoints in your code by clicking the left margin of the editor

3. For manual development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

#### Frontend Development

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. For debugging in VS Code/Cursor:
   - Create a `.vscode/launch.json` file with the following configuration:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Next.js: debug",
         "type": "node-terminal",
         "request": "launch",
         "command": "npm run dev"
       }
     ]
   }
   ```
   - Start debugging by pressing F5 or using the Run and Debug panel
   - Set breakpoints in your TypeScript/JavaScript code

3. For manual development server:
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Backend Development**:
   - The backend runs on http://localhost:8001
   - API documentation is available at http://localhost:8001/api/docs
   - Changes to Python files will trigger automatic reload
   - Use the debugger to set breakpoints and inspect variables

2. **Frontend Development**:
   - The frontend runs on http://localhost:3001
   - Changes to TypeScript/JavaScript files will trigger hot reload
   - Use the browser's developer tools for frontend debugging
   - The frontend will automatically connect to the backend API

3. **Database Development**:
   - For local development, you can use the Docker PostgreSQL instance:
     ```bash
     docker compose up -d postgres
     ```
   - Or connect to your local PostgreSQL instance by updating the database URL in `.env`

4. **Environment Variables**:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables as needed for your development environment
   - Frontend environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser

### Version Control

This project includes comprehensive Git configuration:

- `.gitignore` files (root, frontend, and backend) to exclude build artifacts, dependencies, and environment-specific files
- `.gitattributes` for consistent line endings and binary file handling

When contributing to this project, please make sure your IDE respects these configurations to maintain a clean repository and minimize potential merge conflicts.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

This project integrates with the [AI-Scientist-v2](https://github.com/SakanaAI/AI-Scientist-v2) framework developed by SakanaAI.

## Accessing the Application

After running the application with Docker Compose, you can access:

- Frontend: http://localhost:3001 
- Backend API: http://localhost:8001/api
- API Documentation: http://localhost:8001/api/docs 

> Note: The ports have been configured to avoid conflicts with standard ports that might be in use on your system (3000, 5432, 8000).
