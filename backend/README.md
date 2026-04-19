# Welfair AI Backend

Backend API for Welfair AI document triage, case management, upload history, and draft generation.

## Setup

1. Create or activate your Python virtual environment.
2. Install backend dependencies:

```powershell
.\.venv\Scripts\python -m pip install -e .[dev]
```

3. Create a local env file:

```powershell
Copy-Item .env.example .env
```

4. Add your real `OPENAI_API_KEY` to `backend/.env`.

## Run Locally

From the `backend` directory:

```powershell
..\.venv\Scripts\python -m uvicorn app.main:app --reload
```

If you are already inside an activated virtual environment, you can also run:

```powershell
python -m uvicorn app.main:app --reload
```

The API will be available at:

- `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Guest Session Header

All stateful API requests require:

```text
x-guest-session-id: your-guest-session-id
```

For local manual testing, any stable value like `guest-local-1` is fine.

## Current API Routes

- `POST /api/analyze`
- `POST /api/cases`
- `GET /api/cases`
- `GET /api/cases/{case_id}`
- `POST /api/cases/{case_id}/documents`
- `PATCH /api/cases/{case_id}/resolve`
- `GET /api/history/uploads`
- `GET /api/history/resolved-cases`
- `POST /api/drafts`
