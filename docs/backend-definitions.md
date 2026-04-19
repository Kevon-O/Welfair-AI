# Backend Definitions

This file tracks what each backend folder and file is for as we create them.

## Folders

### `.venv/`
Local Python virtual environment used to isolate backend packages on one developer machine.

### `backend/app/`
Main backend application code.

### `backend/app/api/`
HTTP API layer for routes and shared request dependencies.

### `backend/app/api/routes/`
Route files grouped by feature, such as analysis, cases, drafts, and history.

### `backend/app/core/`
Global backend configuration and app-wide settings logic.

### `backend/app/db/`
Database engine, sessions, table models, and database startup helpers.

### `backend/app/schemas/`
Pydantic models that define request and response shapes.

### `backend/app/services/`
Business logic for storage, parsing, AI analysis, case updates, and draft generation.

### `backend/app/prompts/`
Prompt text files used for AI analysis and draft generation.

### `backend/app/utils/`
Small helper logic that does not belong in routes or services.

### `backend/storage/uploads/`
Local storage location for uploaded files during the MVP.

### `backend/tests/`
Backend tests for routes, services, and schema behavior.

## Files

### `.gitignore`
Prevents local secrets, Python cache files, virtual environments, and uploaded documents from being committed.
 
### `backend/.env.example`
Safe template showing which backend environment variables each developer needs locally.

### `backend/pyproject.toml`
Central Python project config for backend dependencies, metadata, and tool settings.

### `backend/app/core/config.py`
Loads typed backend settings from environment variables and exposes one shared settings object for the app.

### `backend/app/db/session.py`
Creates the database engine, provides reusable database sessions, and initializes SQLModel tables.
