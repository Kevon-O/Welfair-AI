from fastapi import APIRouter

from app.api.routes.analyze import router as analyze_router
from app.api.routes.cases import router as cases_router
from app.api.routes.drafts import router as drafts_router
from app.api.routes.history import router as history_router

api_router = APIRouter()
api_router.include_router(analyze_router)
api_router.include_router(cases_router)
api_router.include_router(drafts_router)
api_router.include_router(history_router)
