# PipeWeave Backend - ML Workbench API

Production-grade FastAPI backend for automated ML pipeline construction, EDA, and model training.

## Overview

PipeWeave is an ML workbench that transforms raw datasets into production-ready models through:
- Automated schema detection and validation
- AI-powered exploratory data analysis
- Intelligent pipeline construction
- Distributed model training and evaluation

The backend implements a 7-layer clean architecture with strict separation of concerns, designed for maintainability, testability, and scalability.

## Architecture Layers

```
7. Configuration     ← Environment-based settings & structured logging
6. API              ← FastAPI routers & request/response schemas
5. Services         ← Business orchestration (cross-domain workflows)
4. Boundary         ← Database models (SQLAlchemy ORM) & external I/O
3. Core             ← Pure business logic (domain-specific algorithms)
2. Multi-Agent      ← LangChain agents for AI-powered decision making
1. Models           ← Pydantic domain models (in-memory representations)
```

## Technology Stack

### Core Framework
- **FastAPI** 0.109+ - Async web framework with automatic OpenAPI docs
- **Uvicorn** - ASGI server with hot reload support
- **Pydantic** 2.5+ - Data validation and serialization

### Data Persistence
- **PostgreSQL** 16 - Primary database (async via asyncpg)
- **SQLAlchemy** 2.0+ - Async ORM with type hints
- **Alembic** - Database migration management
- **Redis** 7+ - Caching and job queue broker

### AI/ML Stack
- **LangChain** - Agent framework for LLM orchestration
- **Google Gemini** - LLM for schema detection and EDA insights
- **scikit-learn** 1.3+ - ML algorithms and preprocessing
- **XGBoost** 2.0+ - Gradient boosting framework
- **pandas** 2.1+ - Data manipulation and analysis

### Async & Job Queue
- **Celery** 5.3+ - Distributed task queue for long-running jobs
- **aioredis** - Async Redis client

### Storage
- **AWS S3** (via boto3) - Object storage for datasets and models
- **LocalStack** - S3 emulation for local development

### Security
- **python-jose** - JWT token handling
- **passlib** - Password hashing with bcrypt

### Observability
- **structlog** - Structured logging with correlation IDs
- **Correlation ID middleware** - Request tracing across async boundaries

## Directory Structure

```
backend/
├── api/                    # Layer 6: API (Presentation)
│   ├── middleware/         # CORS, correlation ID, request timing
│   ├── schemas/            # Pydantic request/response models
│   ├── v1/                 # API v1 endpoint routers
│   │   ├── datasets.py     # Dataset upload & listing
│   │   ├── eda.py          # EDA report generation & retrieval
│   │   ├── pipelines.py    # Pipeline construction & validation
│   │   └── training.py     # Training job management
│   ├── dependencies.py     # FastAPI dependency injection
│   └── main.py             # FastAPI app factory & lifespan
│
├── boundary/               # Layer 4: Boundary (I/O Gateway)
│   ├── models/             # SQLAlchemy ORM models (9 tables)
│   ├── crud/               # CRUD operations with type safety
│   └── storage/            # S3 client wrapper
│
├── configuration/          # Layer 7: Configuration
│   ├── agent_configs/      # LangChain agent YAML configs
│   ├── settings.py         # Pydantic Settings with env validation
│   └── logging.py          # Structured logging setup
│
├── core/                   # Layer 3: Core (Business Logic)
│   ├── analysis/           # EDA algorithms & statistical analysis
│   ├── context_gathering/  # Dataset profiling & metadata extraction
│   ├── pipeline_construction/  # DAG generation & optimization
│   ├── evaluation/         # Model evaluation & metrics
│   └── training/           # Training orchestration
│
├── services/               # Layer 5: Services (Orchestration)
│   └── (TODO: Phase 3)     # Cross-domain workflows
│
├── agents/                 # Layer 2: Multi-Agent
│   └── (TODO: Phase 4)     # LangChain agents for AI tasks
│
├── models/                 # Layer 1: Domain Models
│   └── (TODO: Phase 1)     # Pydantic domain models
│
└── scripts/                # Database initialization & utilities
    ├── init_test_data.py   # Seed test data (3 users, 3 datasets)
    ├── init_db.sql         # PostgreSQL initialization
    └── init_s3.sh          # LocalStack S3 bucket creation
```

## Installation & Setup

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (for database, Redis, LocalStack)
- uv package manager

### 1. Clone Repository

```bash
cd C:\Users\User\Projects\PipeWeave
```

### 2. Install Dependencies

```bash
uv sync
```

This installs all dependencies from `pyproject.toml` including:
- Core framework (FastAPI, Uvicorn, Pydantic)
- Database (SQLAlchemy, asyncpg, psycopg2)
- AI/ML (LangChain, scikit-learn, XGBoost)
- Development tools (pytest, black, mypy, ruff)

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
# REQUIRED: Set your Google Gemini API key
GOOGLE_API_KEY=your_actual_gemini_api_key_here

# REQUIRED: Change in production
SECRET_KEY=your-production-secret-key-minimum-32-chars
JWT_SECRET_KEY=your-production-jwt-secret-minimum-32-chars
```

All other settings have sensible defaults for local development.

### 4. Start Infrastructure Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- LocalStack S3 (port 4566)
- pgAdmin (port 5050, optional)

Verify services are running:
```bash
docker-compose ps
```

### 5. Run Database Migrations

```bash
python -m alembic upgrade head
```

This creates all 8 database tables:
- users
- datasets
- schema_deductions
- eda_reports
- pipelines
- training_jobs
- models
- experiment_runs

### 6. Seed Test Data (Optional)

```bash
python -m backend.scripts.init_test_data
```

Creates:
- 3 test users (user1@pipeweave.test, user2@pipeweave.test, user3@pipeweave.test)
- 3 datasets with schema deductions
- 3 EDA reports (2 in PostgreSQL, 1 in S3)
- 3 ML pipelines
- 3 completed training jobs with models

Default password for all test users: `password123`

### 7. Start API Server

```bash
python -m uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

Access:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## API Endpoints

### System

- `GET /health` - Health check with service connectivity status

### Datasets (v1)

- `POST /api/v1/datasets/upload-url` - Request presigned S3 URL for upload
- `POST /api/v1/datasets/{dataset_id}/complete` - Signal upload completion
- `GET /api/v1/datasets` - List user datasets (with pagination)
- `GET /api/v1/datasets/{dataset_id}` - Get dataset details

### EDA (v1)

- `POST /api/v1/eda/{dataset_id}/generate` - Trigger EDA report generation
- `GET /api/v1/eda/{dataset_id}/reports` - List EDA reports for dataset
- `GET /api/v1/eda/reports/{report_id}` - Get EDA report by ID

### Pipelines (v1)

- `POST /api/v1/pipelines` - Create new pipeline (manual or AI-assisted)
- `GET /api/v1/pipelines` - List user pipelines (with pagination)
- `GET /api/v1/pipelines/{pipeline_id}` - Get pipeline details
- `POST /api/v1/pipelines/{pipeline_id}/validate` - Validate pipeline DAG
- `PUT /api/v1/pipelines/{pipeline_id}` - Update pipeline configuration

### Training (v1)

- `POST /api/v1/training/jobs` - Create training job
- `GET /api/v1/training/jobs/{job_id}` - Get training job status
- `GET /api/v1/training/jobs/{job_id}/logs` - Stream training logs
- `POST /api/v1/training/jobs/{job_id}/cancel` - Cancel running job

All endpoints use versioned responses (`VersionedResponse[T]`) and standardized error codes (`ErrorResponse`).

## Configuration

### Environment Variables

See `.env.example` for all configuration options. Key sections:

#### Database Configuration
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DB_POOL_SIZE=20              # Connection pool size
DB_MAX_OVERFLOW=10           # Max overflow connections
```

#### Redis Configuration
```bash
REDIS_URL=redis://:password@localhost:6379/0
REDIS_MAX_CONNECTIONS=50
```

#### S3 Storage Configuration
```bash
# LocalStack (development)
S3_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# AWS S3 (production)
S3_ENDPOINT_URL=              # Leave empty for real AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=pipeweave-production-storage
```

#### Storage Thresholds
```bash
EDA_REPORT_SIZE_THRESHOLD_MB=1    # Store large reports in S3
MAX_DATASET_SIZE_MB=1024          # Max upload size
MAX_MODEL_SIZE_MB=2048            # Max model artifact size
```

#### Celery Configuration
```bash
CELERY_BROKER_URL=redis://:password@localhost:6379/1
CELERY_RESULT_BACKEND=redis://:password@localhost:6379/2
CELERY_TASK_TIME_LIMIT=3600       # 1 hour timeout
```

#### Security Settings
```bash
SECRET_KEY=your-secret-key-minimum-32-chars
JWT_SECRET_KEY=your-jwt-secret-minimum-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Accessing Configuration in Code

```python
from backend.configuration import get_settings

settings = get_settings()  # Singleton with cached instance
db_url = settings.database.url
api_key = settings.gemini.api_key
```

## Development Workflow

### Code Style

The project enforces strict code quality standards:

```bash
# Format code (100 char line length)
python -m black backend/

# Lint code
python -m ruff backend/

# Type checking
python -m mypy backend/
```

### Database Migrations

```bash
# Create new migration after model changes
python -m alembic revision --autogenerate -m "Description"

# Apply migrations
python -m alembic upgrade head

# Rollback last migration
python -m alembic downgrade -1

# View migration history
python -m alembic history
```

### Logging

All logging uses structured logging with correlation IDs:

```python
import structlog

logger = structlog.get_logger(__name__)

logger.info("Processing dataset", dataset_id=dataset_id, user_id=user_id)
logger.warning("Large file detected", file_size_mb=500)
logger.error("Validation failed", errors=validation_errors)
```

Logs include:
- Timestamp (ISO 8601)
- Log level
- Module name
- Correlation ID (for request tracing)
- Structured fields (JSON in production)

### Error Handling

All endpoints return standardized error responses:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "errors": [...]
  }
}
```

Error codes defined in `backend.api.schemas.common`:
- `VALIDATION_ERROR` (422)
- `NOT_FOUND` (404)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `RATE_LIMITED` (429)
- `SERVICE_UNAVAILABLE` (503)
- `INTERNAL_ERROR` (500)

## Testing

### Run All Tests

```bash
python -m pytest tests/
```

### Run Tests with Coverage

```bash
python -m pytest tests/ --cov=backend --cov-report=html
```

### Test Structure

```
tests/
├── unit/               # Unit tests (mocked dependencies)
│   ├── api/
│   ├── services/
│   └── core/
├── integration/        # Integration tests (real DB)
│   ├── api/
│   └── boundary/
└── conftest.py         # Shared fixtures
```

### Writing Tests

```python
import pytest
from httpx import AsyncClient
from backend.api.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
```

## Deployment

### Docker Production Build

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependencies
COPY pyproject.toml ./
RUN uv sync --no-dev

# Copy application
COPY backend/ ./backend/

# Run migrations and start server
CMD ["sh", "-c", "python -m alembic upgrade head && python -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000"]
```

### Environment-Specific Settings

Development:
- `DEBUG=True`
- `LOG_LEVEL=DEBUG`
- LocalStack S3
- Colored console logs

Production:
- `DEBUG=False`
- `LOG_LEVEL=INFO`
- AWS S3
- JSON structured logs
- Strong secrets (32+ chars)
- CORS limited to specific origins

### Health Checks

Use `/health` endpoint for:
- Load balancer health checks
- Kubernetes liveness/readiness probes
- Monitoring systems

Response includes:
- Uptime seconds
- Application version
- Database connectivity
- Redis connectivity
- S3 connectivity

## Project Status

### Completed (Phase 2)
- Configuration layer (settings, logging)
- Database models (9 SQLAlchemy models)
- CRUD operations (type-safe async)
- S3 storage integration
- API schemas (request/response models)
- API endpoints (datasets, EDA, pipelines, training)
- Middleware (CORS, correlation ID, timing)
- Test data initialization

### Upcoming
- **Phase 3**: Service layer orchestration
- **Phase 4**: LangChain multi-agent system
- **Phase 5**: Celery workers for async jobs
- **Phase 6**: Authentication & authorization
- **Phase 7**: Model deployment & serving

## Documentation

- **Backend CLAUDE.md**: Architecture overview with file:line references
- **Boundary Layer**: `backend/boundary/CLAUDE.md`
- **CRUD Operations**: `backend/boundary/crud/CLAUDE.md`
- **Configuration**: `backend/configuration/CLAUDE.md`
- **Database ERD**: `backend/boundary/Database_ERD_Diagram.md`

## Contributing

1. Follow the 7-layer architecture pattern
2. Maximum 150 lines per file
3. Type hint all functions
4. Write docstrings (Google style)
5. Add tests for new features
6. Run linters before committing

## Support

For issues or questions:
- Check existing documentation in `CLAUDE.md` files
- Review API docs at `/docs` endpoint
- Check database schema in ERD diagram

## License

MIT
