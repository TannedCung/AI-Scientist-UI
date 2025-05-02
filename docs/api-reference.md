# API Reference

This document provides a detailed reference for all the endpoints in the AI Scientist Paper Generator API.

## Base URL

The base URL for all API endpoints is:

```
http://localhost:8000/api
```

## Authentication

The API currently does not implement authentication. This is planned for future releases.

## Error Responses

All endpoints use standard HTTP status codes and return errors in the following format:

```json
{
  "detail": "Error message describing the issue"
}
```

Common error codes:
- `400 Bad Request`: Invalid input or parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Research Ideas API

### Create a Research Idea

Creates a new research idea with metadata and a code file.

**URL**: `/research/ideas`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Title of the research idea |
| `keywords` | string | Yes | Comma-separated keywords |
| `tldr` | string | Yes | Short summary of the research idea |
| `abstract` | string | Yes | Detailed abstract of the research idea |
| `code_file` | file | Yes | Python code file (.py) for experimentation |

**Response**:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Research Idea Title",
  "markdown_url": "https://r2-endpoint/ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.md",
  "code_url": "https://r2-endpoint/ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.py",
  "created_at": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `201 Created`: Research idea created successfully
- `400 Bad Request`: Invalid input or missing parameters
- `500 Internal Server Error`: Server-side error

### Get All Research Ideas

Retrieves a list of all research ideas.

**URL**: `/research/ideas`  
**Method**: `GET`  

**Response**:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Research Idea Title",
    "keywords": "ai, deep learning, research",
    "tldr": "Short summary of the research idea",
    "abstract": "Detailed abstract of the research idea",
    "markdown_file_path": "ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.md",
    "code_file_path": "ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.py",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
]
```

**Status Codes**:
- `200 OK`: Research ideas retrieved successfully
- `500 Internal Server Error`: Server-side error

### Get a Specific Research Idea

Retrieves details of a specific research idea.

**URL**: `/research/ideas/{idea_id}`  
**Method**: `GET`  

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idea_id` | string (UUID) | Yes | ID of the research idea |

**Response**:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Research Idea Title",
  "keywords": "ai, deep learning, research",
  "tldr": "Short summary of the research idea",
  "abstract": "Detailed abstract of the research idea",
  "markdown_file_path": "ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.md",
  "code_file_path": "ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.py",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200 OK`: Research idea retrieved successfully
- `404 Not Found`: Research idea not found
- `500 Internal Server Error`: Server-side error

### Generate Research Hypotheses

Generates research hypotheses based on a research idea.

**URL**: `/research/ideas/{idea_id}/generate`  
**Method**: `POST`  

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idea_id` | string (UUID) | Yes | ID of the research idea |

**Response**:

```json
{
  "idea_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "ideas_json_url": "https://r2-endpoint/ideas/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6.json"
}
```

**Status Codes**:
- `200 OK`: Hypotheses generated successfully
- `404 Not Found`: Research idea not found
- `500 Internal Server Error`: Server-side error or generation failure

## Experiments API

### Run an Experiment

Starts a new experiment based on a research idea.

**URL**: `/research/ideas/{idea_id}/experiments`  
**Method**: `POST`  

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idea_id` | string (UUID) | Yes | ID of the research idea |

**Response**:

```json
{
  "experiment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "idea_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending",
  "started_at": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `201 Created`: Experiment started successfully
- `404 Not Found`: Research idea not found
- `500 Internal Server Error`: Server-side error

### Get All Experiments

Retrieves a list of all experiments.

**URL**: `/research/experiments`  
**Method**: `GET`  

**Response**:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "research_idea_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "completed",
    "log_folder_path": "experiments/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "html_file_path": "experiments/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6/unified_tree_viz.html",
    "started_at": "2023-01-01T00:00:00.000Z",
    "completed_at": "2023-01-01T01:00:00.000Z",
    "is_successful": true,
    "html_url": "https://r2-endpoint/experiments/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6/unified_tree_viz.html"
  }
]
```

**Status Codes**:
- `200 OK`: Experiments retrieved successfully
- `500 Internal Server Error`: Server-side error

### Get Experiment Status

Retrieves the status and details of a specific experiment.

**URL**: `/research/experiments/{experiment_id}`  
**Method**: `GET`  

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `experiment_id` | string (UUID) | Yes | ID of the experiment |

**Response**:

```json
{
  "experiment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "idea_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "started_at": "2023-01-01T00:00:00.000Z",
  "completed_at": "2023-01-01T01:00:00.000Z",
  "is_successful": true,
  "html_url": "https://r2-endpoint/experiments/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6/unified_tree_viz.html"
}
```

**Status Codes**:
- `200 OK`: Experiment status retrieved successfully
- `404 Not Found`: Experiment not found
- `500 Internal Server Error`: Server-side error

## Data Models

### ResearchIdea

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier for the research idea |
| `title` | string | Title of the research idea |
| `keywords` | string | Comma-separated keywords |
| `tldr` | string | Short summary of the research idea |
| `abstract` | string | Detailed abstract of the research idea |
| `markdown_file_path` | string | Path to the markdown file in R2 storage |
| `code_file_path` | string | Path to the code file in R2 storage |
| `created_at` | string (datetime) | Creation timestamp |
| `updated_at` | string (datetime) | Last update timestamp |

### ExperimentRun

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier for the experiment |
| `research_idea_id` | string (UUID) | Reference to the associated research idea |
| `status` | string | Status of the experiment (pending, running, completed, failed) |
| `log_folder_path` | string | Path to the log folder in R2 storage (if available) |
| `html_file_path` | string | Path to the HTML visualization file in R2 storage (if available) |
| `started_at` | string (datetime) | Start timestamp |
| `completed_at` | string (datetime) | Completion timestamp (if completed) |
| `is_successful` | boolean | Whether the experiment was successful (if completed) |
| `html_url` | string | URL to the HTML visualization (if available) |

## OpenAPI Specification

The complete OpenAPI specification is available at:

```
http://localhost:8000/api/openapi.json
```

Interactive API documentation is available at:

```
http://localhost:8000/api/docs
``` 