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
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api
   - API Docs: http://localhost:8000/api/docs

## Documentation

For detailed documentation, please see the [docs](./docs) directory:

- [Project Overview](./docs/overview.md)
- [System Architecture](./docs/architecture.md)
- [Setup and Installation](./docs/setup.md)
- [Usage Guide](./docs/usage-guide.md)
- [API Reference](./docs/api-reference.md)

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

This project integrates with the [AI-Scientist-v2](https://github.com/SakanaAI/AI-Scientist-v2) framework developed by SakanaAI.
