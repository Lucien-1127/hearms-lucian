"""
Legal data service: manages ChromaDB vector store for RAG-based retrieval
of Taiwan legal statutes and court decisions.
"""
import os
import json
from pathlib import Path
from typing import Optional

try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False

from models.schemas import CaseResult, SearchResponse

PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")

_client: Optional[object] = None
_statutes_collection: Optional[object] = None
_cases_collection: Optional[object] = None


def get_chroma_client():
    global _client
    if _client is None and CHROMA_AVAILABLE:
        Path(PERSIST_DIR).mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(
            path=PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_statutes_collection():
    global _statutes_collection
    if _statutes_collection is None and CHROMA_AVAILABLE:
        c = get_chroma_client()
        _statutes_collection = c.get_or_create_collection(
            name="taiwan_statutes",
            metadata={"hnsw:space": "cosine"},
        )
    return _statutes_collection


def get_cases_collection():
    global _cases_collection
    if _cases_collection is None and CHROMA_AVAILABLE:
        c = get_chroma_client()
        _cases_collection = c.get_or_create_collection(
            name="taiwan_cases",
            metadata={"hnsw:space": "cosine"},
        )
    return _cases_collection


async def search_cases(query: str, domain: Optional[str], top_k: int) -> SearchResponse:
    """
    Search court cases using ChromaDB vector similarity.
    Falls back to AI-generated results if ChromaDB unavailable or empty.
    """
    collection = get_cases_collection()

    if collection is not None and collection.count() > 0:
        results = collection.query(
            query_texts=[query],
            n_results=min(top_k, collection.count()),
            where={"domain": domain} if domain else None,
        )
        cases = []
        for i, doc_id in enumerate(results["ids"][0]):
            meta = results["metadatas"][0][i]
            distance = results["distances"][0][i] if results.get("distances") else 0.5
            cases.append(CaseResult(
                case_id=meta.get("case_id", doc_id),
                title=meta.get("title", ""),
                court=meta.get("court", ""),
                date=meta.get("date", ""),
                summary=results["documents"][0][i][:200],
                relevance_score=round(1 - distance, 4),
                url=meta.get("url"),
            ))
        return SearchResponse(query=query, results=cases, total=len(cases))

    from services.ai_service import semantic_search_ai
    import re

    raw = await semantic_search_ai(query, domain)
    try:
        json_match = re.search(r'\[.*\]', raw, re.DOTALL)
        if json_match:
            items = json.loads(json_match.group())
            cases = [CaseResult(**item) for item in items[:top_k]]
            return SearchResponse(query=query, results=cases, total=len(cases))
    except (json.JSONDecodeError, TypeError):
        pass

    return SearchResponse(query=query, results=[], total=0)


async def add_statute(statute_id: str, title: str, content: str, domain: str):
    collection = get_statutes_collection()
    if collection is None:
        raise RuntimeError("ChromaDB not available")
    collection.upsert(
        ids=[statute_id],
        documents=[content],
        metadatas=[{"title": title, "domain": domain}],
    )


async def add_case(case_id: str, title: str, summary: str, court: str, date: str, domain: str, url: str = ""):
    collection = get_cases_collection()
    if collection is None:
        raise RuntimeError("ChromaDB not available")
    collection.upsert(
        ids=[case_id],
        documents=[summary],
        metadatas=[{
            "case_id": case_id, "title": title,
            "court": court, "date": date, "domain": domain, "url": url,
        }],
    )
