import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import consultation, search, documents

app = FastAPI(
    title="智研 AI 法律系統",
    description="AI 驅動的台灣法律研究與諮詢平台",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consultation.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")


@app.get("/", tags=["健康檢查"])
async def root():
    return {"service": "智研 AI 法律系統", "version": "1.0.0", "status": "running"}


@app.get("/health", tags=["健康檢查"])
async def health():
    return {"status": "healthy"}
