# Welfair AI

Welfair AI is an AI-powered crisis-navigation web app for urgent real-world document problems such as eviction notices, utility shutoff warnings, benefits denials, FAFSA issues, medical bills, court paperwork, and similar survival-mode crises.

The core experience is:
1. Upload a document or image.
2. Analyze it with AI.
3. Create a new case or attach it to an existing one.
4. Review urgency, deadlines, missing information, next steps, and suggested resources.
5. Generate a draft email, response, or call script from the case.

## What The App Does

Welfair AI is designed around a simple but high-value workflow: turning stressful, hard-to-read documents into a clearer case summary with recommended actions. Instead of only extracting text, the app tries to identify the issue type, explain why it matters in plain language, detect deadlines, surface missing information, and suggest grounded next steps the user can take.

## Key Features

1. AI-powered document analysis for PDFs, images, and text files.
2. Case creation from analyzed uploads.
3. Additional document uploads for existing cases.
4. Urgency and deadline-aware case prioritization.
5. Plain-English summaries with possible consequences of inaction.
6. Draft generation for emails, written responses, and call scripts.
7. Guest-only flow for quick local setup and testing.

## Stack

1. Frontend: Next.js, TypeScript, Tailwind CSS
2. Backend: FastAPI, Pydantic, SQLModel
3. AI: OpenAI Responses API with `gpt-5.4-mini`
4. Database: SQLite
5. Auth: guest-only session id stored client-side

## Repo Structure

```text
frontend/   Next.js app
backend/    FastAPI API, SQLite models, OpenAI integration
docs/       project notes and sample test documents
```

## Requirements

You will need:
1. Node.js `20.9+`
2. Python `3.12+`
3. An OpenAI API key with API billing enabled

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

### 5. Start the app

Run the backend and frontend in separate terminals.

Backend:

```powershell
cd backend
..\.venv\Scripts\python -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm run dev
```

## Run Locally

### Backend

From the repo root:

```powershell
cd backend
..\.venv\Scripts\python -m uvicorn app.main:app --reload
```

Backend URLs:
1. `http://localhost:8000`
2. `http://127.0.0.1:8000`
3. Swagger docs: `http://127.0.0.1:8000/docs`

### Frontend

From the repo root:

```powershell
cd frontend
npm run dev
```

Frontend URL:
1. `http://localhost:3000`

## Local Files Created During Setup

A fresh clone includes the application source code and setup templates, but it does not include local runtime files such as secrets, installed packages, databases, or uploaded test files.

You will need to create those locally by:
1. Creating a Python virtual environment.
2. Installing backend and frontend dependencies.
3. Copying `backend/.env.example` to `backend/.env`.
4. Adding your own OpenAI API key.
5. Starting the backend and frontend locally.

That includes files such as:

1. `.venv/`
2. `backend/.env`
3. `backend/*.db`
4. `backend/storage/uploads/`
5. `frontend/node_modules/`
6. `frontend/.next/`
7. `frontend/.env.local`

## Notes For Reviewers

1. SQLite is file-based, so no separate database server is required.
2. The app uses a guest session id stored in the browser instead of full auth.
3. Local uploads are stored in `backend/storage/uploads/` during runtime.
4. Resolved cases are archived for 21 days in the app experience.

## Suggested Reviewer Flow

If you want to evaluate the project quickly after setup:

1. Open `http://localhost:3000`
2. Continue as guest
3. Upload one of the fictional sample documents from `docs/test-documents/`
4. Review the AI analysis
5. Create a case or attach the upload to an existing case
6. Open the case detail view
7. Generate a draft response
8. Mark the case resolved and review the archive in Settings

## Sample Documents

You can test the app with the fictional sample files in:

```text
docs/test-documents/
```

Current sample set includes:
1. Eviction notice
2. Utility shutoff final notice
3. Medical bill statement
4. Financial aid verification request

