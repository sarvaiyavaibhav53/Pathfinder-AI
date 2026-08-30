import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure basic logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan event handler that loads and caches data on startup."""
    from utils.data_loader import preload_data
    from db.init_db import init_db
    logger.info("Initializing application startup sequence...")
    try:
        init_db()
        logger.info("Database tables initialized successfully.")
        preload_data()
        logger.info("Startup sequence complete. Cache preloaded successfully.")
    except Exception as e:
        logger.critical(f"Startup sequence failed! Could not load datasets: {e}", exc_info=True)
        raise e
    yield
    logger.info("Application shutting down...")

app = FastAPI(
    title="AI Career Intelligence Dashboard Backend",
    description="FastAPI Backend for Phase 1 exposing job analytics, company data, skills metadata, and career recommendations.",
    version="1.0",
    lifespan=lifespan
)

# --- CORS Configuration ---
# TEMPORARY / LOCAL-DEV SETTING: no frontend exists yet, so we don't know
# its real origin (port) to lock this down to. allow_origins=["*"] permits
# requests from ANY origin, which is fine for local development but is
# NOT safe for a real deployment.
#
# allow_credentials is set to False here on purpose: per the CORS spec,
# wildcard origins ("*") cannot be combined with allow_credentials=True -
# browsers will silently refuse to send cookies/auth headers in that
# combination even if no error is raised. Since your teammate's auth work
# will need real cookies/credentials eventually, this MUST change once
# the frontend's real origin is known:
#   allow_origins=["http://localhost:3000"],  # or whatever the real port is
#   allow_credentials=True,
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to real frontend origin(s) before deployment
    allow_credentials=False,  # TODO: set True once allow_origins is a specific real origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Register routers under /api/v1 prefix
from api.routes.analytics import router as analytics_router
from api.routes.jobs import router as jobs_router
from api.routes.skills import router as skills_router
from api.routes.recommendation import router as recommendation_router
from api.routes.role_fit import router as role_fit_router
from api.routes.routes_auth import router as auth_router
from api.routes.routes_profile import router as profile_router
from api.routes.routes_admin import router as admin_router
from api.routes.routes_chat import router as chat_router

app.include_router(analytics_router, prefix="/api/v1")
app.include_router(jobs_router, prefix="/api/v1")
app.include_router(skills_router, prefix="/api/v1")
app.include_router(recommendation_router, prefix="/api/v1")
app.include_router(role_fit_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")

# 2. Register Root Health endpoint
from api.schemas.analytics import HealthResponse

@app.get(
    "/",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check endpoint",
    description="Returns the status, project title, and version of the API."
)
async def health_check():
    return {
        "status": "running",
        "project": "AI Career Intelligence Dashboard",
        "version": "1.0"
    }

# 3. Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all exception handler to log errors and prevent traceback leakage."""
    logger.exception(f"Unhandled exception occurred at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )