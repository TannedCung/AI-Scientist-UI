# Setup and Installation

This guide will walk you through setting up and running the AI Scientist Paper Generator.

## Prerequisites

- Docker and Docker Compose
- Node.js v16+ (for local development)
- Python 3.11+ (for local development)
- Cloudflare R2 account (for file storage)
- OpenAI API key (for AI models)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ai_scientist

# Cloudflare R2
R2_ENDPOINT_URL=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=ai-scientist

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Semantic Scholar API (optional)
S2_API_KEY=your_semantic_scholar_api_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Docker Setup (Recommended)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Scientist-UI
```

### 2. Build and Start the Containers

```bash
docker-compose up -d
```

This will start the following services:
- PostgreSQL database (port 5432)
- FastAPI backend (port 8000)
- Next.js frontend (port 3000)

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Documentation: http://localhost:8000/api/docs

## Local Development Setup

### Backend Setup

1. Create a Python virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Run the backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run the development server

```bash
npm run dev
```

## Setting Up AI-Scientist-v2

The application requires the AI-Scientist-v2 framework to be installed and properly configured.

1. Clone the AI-Scientist-v2 repository into the backend/app/services directory

```bash
git clone https://github.com/SakanaAI/AI-Scientist-v2.git backend/app/services/AI-Scientist-v2
```

2. Install AI-Scientist-v2 dependencies

```bash
cd backend/app/services/AI-Scientist-v2
# Create a conda environment
conda create -n ai_scientist python=3.11
conda activate ai_scientist

# Install PyTorch with CUDA support
conda install pytorch torchvision torchaudio pytorch-cuda=12.4 -c pytorch -c nvidia

# Install PDF and LaTeX tools
conda install anaconda::poppler
conda install conda-forge::chktex

# Install Python package requirements
pip install -r requirements.txt
```

3. Configure AI-Scientist-v2 environment variables

Make sure to set the required API keys in your main `.env` file:
- `OPENAI_API_KEY`: Required for LLM access
- `S2_API_KEY`: Optional for Semantic Scholar API access

## Database Setup

If you want to set up the database manually rather than using Docker:

1. Install PostgreSQL

2. Create a database

```bash
createdb ai_scientist
```

3. Update the database connection string in `backend/app/db/database.py` if needed

```python
SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
```

## Cloudflare R2 Setup

1. Create a Cloudflare R2 account if you don't have one
2. Create a new bucket named `ai-scientist` (or choose your own name)
3. Create API tokens with read/write access
4. Add the credentials to your `.env` file

## Troubleshooting

### Common Issues

#### Database Connection Error

If you encounter errors connecting to the database:
- Check if PostgreSQL is running
- Verify the database credentials in the `.env` file
- Ensure the database exists

#### R2 Storage Issues

If files aren't uploading to R2:
- Verify your R2 credentials
- Check if the bucket exists
- Ensure the application has write permissions

#### AI-Scientist-v2 Integration Issues

If the AI-Scientist-v2 integration is not working:
- Ensure the repository is cloned to the correct location
- Verify the API keys are set correctly
- Check if the correct Python packages are installed

#### Frontend Connection Issues

If the frontend can't connect to the API:
- Check if the backend server is running
- Verify the `NEXT_PUBLIC_API_URL` environment variable
- Check for CORS issues in the browser console 