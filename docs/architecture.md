# System Architecture

This document provides a detailed overview of the AI Scientist Paper Generator's system architecture, explaining how the various components work together.

## Architecture Overview

The AI Scientist Paper Generator follows a modern, microservices-oriented architecture with three main components:

1. **Frontend**: A Next.js web application that provides the user interface
2. **Backend API**: A FastAPI service that handles business logic and data persistence
3. **AI-Scientist Engine**: Integration with the AI-Scientist-v2 framework for running experiments

![Architecture Diagram](https://mermaid.ink/img/pako:eNqFkc1uwjAQhF_F2nOFaEqhUG65VT2g9lAOvbjOQixsb_AaAap4964TECCqcrI9385oZ08oTcuYYN9ax_dGbeHRQ8MCKGGgjYHnTmnnIORQiUDL9YaIpAqxC_xYK5uDpGi0Jfh4L0B60GFQvkuVnzOTi7zIVJHLfCHZaLwYZWI-zeaTRVnCOHvLshxuMpkp9HUfYh_0bjEPRulFR9U0bdvoK1XPQ0tFz9XS1UlJylnaG3eEO9NUwVq_hdqGI1RODk62gB_yQJbLbH9Srro2tVElnp1pqxiCr5G8oU25Q2-6kw5_Rqt6o1yDqXfHx87HwTRNh_7LHDlhKvhB4TslnDDx3kFPeOdjt4qJsPLO1ZjoRNjS2UnnUJFjf3pzb2xhLcJP3d_DZGSCX-xGgTE?type=png)

## Component Breakdown

### Frontend (Next.js)

- **Technology Stack**: Next.js, React, Material UI
- **Key Features**:
  - Modern, responsive UI
  - Client-side form validation
  - Asynchronous data fetching from the backend API
  - State management using React hooks
  - File upload capabilities

### Backend API (FastAPI)

- **Technology Stack**: FastAPI, SQLAlchemy, Pydantic
- **Components**:
  - **API Endpoints**: RESTful endpoints for research ideas and experiments
  - **Database Layer**: Models and repositories for data persistence
  - **Services**: Business logic implementation
  - **File Storage**: Integration with Cloudflare R2 for file storage
  - **AI-Scientist Integration**: Communication with the AI-Scientist engine

### Database (PostgreSQL)

- **Schema**:
  - `research_ideas`: Stores research idea metadata
  - `experiment_runs`: Tracks experiment execution and results
- **Relationships**:
  - One-to-many relationship between research ideas and experiments

### File Storage (Cloudflare R2)

- **Purpose**: Store user-uploaded code files and generated markdown files
- **Organization**:
  - `/research-ideas/{idea_id}/code.py`: User-uploaded code files
  - `/research-ideas/{idea_id}/markdown.md`: Generated hypothesis documents
  - `/experiments/{experiment_id}/results.json`: Experiment results

### AI-Scientist Engine

- **Integration**: API calls to the AI-Scientist-v2 framework
- **Functions**:
  - Generate research hypotheses
  - Run experiments
  - Analyze results
  - Generate scientific papers

## Data Flow

1. **User creates a research idea**:
   - Frontend collects user input and files
   - Backend validates and stores the research idea
   - Files are uploaded to Cloudflare R2

2. **User generates hypotheses**:
   - Backend invokes the AI-Scientist engine
   - Hypotheses are generated and stored
   - Frontend displays the generated hypotheses

3. **User runs an experiment**:
   - Backend creates an experiment record
   - AI-Scientist engine executes the experiment
   - Results are stored in Cloudflare R2
   - Frontend displays experiment progress and results

## API Communication

- **Frontend to Backend**: RESTful API calls using HTTP
- **Backend to AI-Scientist**: API integration using HTTP
- **Backend to Storage**: S3-compatible API calls to Cloudflare R2

## Security Considerations

- **API Security**: Future implementation will include JWT authentication
- **Storage Security**: S3 bucket policies and IAM credentials
- **Data Validation**: Input validation using Pydantic models
- **CORS**: Configured to restrict access to trusted origins

## Deployment Architecture

The application can be deployed using Docker Compose for development or Kubernetes for production:

- **Docker Compose**: Single-node deployment with containers for each service
- **Kubernetes (Production)**: Scalable deployment with pods for each service, horizontal scaling, and load balancing

## Scalability Considerations

- **API Scalability**: Stateless design allows horizontal scaling
- **Database Scalability**: Connection pooling and potential sharding
- **Storage Scalability**: Cloudflare R2 provides automatic scaling 