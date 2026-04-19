# Welfair AI

Welfair AI is an AI-powered crisis-navigation web app for urgent real-world document problems such as eviction notices, utility shutoff warnings, benefits denials, FAFSA issues, medical bills, court paperwork, and similar survival-mode crises.

The core flow is:
- upload a document or image
- analyze it with AI
- create a new case or attach it to an existing case
- review urgency, deadlines, missing information, next steps, and suggested resources
- generate a draft email, response, or call script from the case

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic, SQLModel
- AI: OpenAI Responses API with `gpt-5.4-mini`
- Database: SQLite
- Auth: guest-only session id stored client-side

## Repo Structure

```text
frontend/   Next.js app
backend/    FastAPI API, SQLite models, OpenAI integration
docs/       project notes and sample test documents
```

## Prerequisites

- Node.js `20.9+`
- Python `3.12+`
- An OpenAI API key with API billing enabled

## Quick Start

### 1. Create a Python virtual environment

From the repo root:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

### 2. Install backend dependencies

```powershell
cd backend
..\.venv\Scripts\python -m pip install -e .[dev]
```

### 3. Create the backend env file

```powershell
cd backend
Copy-Item .env.example .env
```

Then add your real OpenAI key to `backend/.env`:

```env
OPENAI_API_KEY=your_real_key_here
```

### 4. Install frontend dependencies

```powershell
cd frontend
npm install
```

## Run Locally

Run the backend and frontend in separate terminals.

### Backend

From the repo root:

```powershell
cd backend
..\.venv\Scripts\python -m uvicorn app.main:app --reload
```

Backend URLs:
- `http://localhost:8000`
- `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

### Frontend

From the repo root:

```powershell
cd frontend
npm run dev
```

Frontend URL:
- `http://localhost:3000`

## What Git Ignore Hides On Purpose

These files are intentionally not committed:

- `.venv/`
- `backend/.env`
- `backend/*.db`
- `backend/storage/uploads/`
- `frontend/node_modules/`
- `frontend/.next/`
- `frontend/.env.local`

That means a fresh clone will contain the source code and setup templates, but not:
- your secret API key
- your local Python environment
- your local SQLite database
- uploaded files from testing
- installed frontend packages or build output

This is expected. A new teammate or judge only needs to:
1. create a venv
2. install dependencies
3. create `backend/.env` from `backend/.env.example`
4. add an OpenAI API key
5. run backend and frontend

## Notes For Reviewers

- SQLite is file-based, so no separate database server is required.
- The app uses a guest session id stored in the browser instead of full auth.
- Local uploads are stored in `backend/storage/uploads/` during runtime.
- Resolved cases are archived for 21 days in the app experience.

## Sample Documents

You can test the app with the fictional sample files in:

```text
docs/test-documents/
```

Current sample set includes:
- eviction notice
- utility shutoff final notice
- medical bill statement
- financial aid verification request

## Backend Contract

Primary backend routes:
- `POST /api/analyze`
- `POST /api/cases`
- `GET /api/cases`
- `GET /api/cases/{case_id}`
- `POST /api/cases/{case_id}/documents`
- `PATCH /api/cases/{case_id}/resolve`
- `GET /api/history/uploads`
- `GET /api/history/resolved-cases`
- `POST /api/drafts`

## Current Limitation

Text-based PDFs and images are supported well. Scanned or image-only PDFs are a future improvement area because they still need an OCR or PDF-to-image fallback path for stronger real-world coverage.
