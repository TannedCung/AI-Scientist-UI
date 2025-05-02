# Backend API Documentation

The backend of the AI Scientist Paper Generator is built using FastAPI, providing a RESTful API for all functionality.

## API Structure

The API follows a structured organization pattern:

```
/api
  /research
    /ideas
    /experiments
```

## Database Models

### ResearchIdea

This model represents a research idea submitted by a user.

```python
class ResearchIdea:
    id: str  # UUID
    title: str
    keywords: str
    tldr: str
    abstract: str
    markdown_file_path: str
    code_file_path: str
    created_at: datetime
    updated_at: datetime
```

### ExperimentRun

This model represents an experiment run based on a research idea.

```python
class ExperimentRun:
    id: str  # UUID
    research_idea_id: str
    status: str  # "pending", "running", "completed", "failed"
    log_folder_path: str
    html_file_path: str
    started_at: datetime
    completed_at: datetime
    is_successful: bool
```

## API Endpoints

### Research Ideas

#### Create a Research Idea

- **URL**: `/api/research/ideas`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `title`: Title of the research idea
  - `keywords`: Comma-separated keywords
  - `tldr`: Short summary of the idea
  - `abstract`: Detailed abstract
  - `code_file`: Python code file for experimentation

**Response**:
```json
{
  "id": "uuid-string",
  "title": "Research Idea Title",
  "markdown_url": "https://r2-endpoint/ideas/uuid/file.md",
  "code_url": "https://r2-endpoint/ideas/uuid/file.py",
  "created_at": "2023-01-01T00:00:00Z"
}
```

#### Get All Research Ideas

- **URL**: `/api/research/ideas`
- **Method**: `GET`

**Response**: Array of ResearchIdea objects

#### Get Specific Research Idea

- **URL**: `/api/research/ideas/{idea_id}`
- **Method**: `GET`

**Response**: Single ResearchIdea object

#### Generate Research Hypotheses

- **URL**: `/api/research/ideas/{idea_id}/generate`
- **Method**: `POST`

**Response**:
```json
{
  "idea_id": "uuid-string",
  "status": "completed",
  "ideas_json_url": "https://r2-endpoint/ideas/uuid/file.json"
}
```

### Experiments

#### Run an Experiment

- **URL**: `/api/research/ideas/{idea_id}/experiments`
- **Method**: `POST`

**Response**:
```json
{
  "experiment_id": "uuid-string",
  "idea_id": "uuid-string",
  "status": "pending",
  "started_at": "2023-01-01T00:00:00Z"
}
```

#### Get All Experiments

- **URL**: `/api/research/experiments`
- **Method**: `GET`

**Response**: Array of ExperimentRun objects

#### Get Experiment Status

- **URL**: `/api/research/experiments/{experiment_id}`
- **Method**: `GET`

**Response**:
```json
{
  "experiment_id": "uuid-string",
  "idea_id": "uuid-string",
  "status": "completed",
  "started_at": "2023-01-01T00:00:00Z",
  "completed_at": "2023-01-01T01:00:00Z",
  "is_successful": true,
  "html_url": "https://r2-endpoint/experiments/uuid/unified_tree_viz.html"
}
```

## Services

### AIScientistService

This service handles interaction with the AI-Scientist-v2 engine:

- `create_research_idea()`: Creates a new research idea with files in R2 storage
- `generate_ideas()`: Generates research hypotheses using the AI-Scientist-v2
- `run_experiment()`: Starts an experiment as a background task
- `_run_experiment_task()`: Background task for running experiments
- `get_experiment_status()`: Gets the status of an experiment

### R2Storage

This service handles file operations with Cloudflare R2:

- `upload_file()`: Uploads a file to R2 storage
- `upload_file_obj()`: Uploads a file from a request to R2
- `upload_directory()`: Uploads a directory of files to R2
- `download_file()`: Downloads a file from R2

## Error Handling

The API uses standard HTTP status codes for errors:

- `404 Not Found`: Resource not found
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server-side errors

Errors are returned in a consistent format:

```json
{
  "detail": "Error message"
}
```

## Authentication and Security

The API currently does not implement authentication, but the following security measures are in place:

- CORS configuration to restrict cross-origin requests
- Input validation using Pydantic models
- File type validation for uploaded files 