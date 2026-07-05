from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class LegalDomain(str, Enum):
    civil = "民法"
    criminal = "刑法"
    administrative = "行政法"
    commercial = "商業法"
    labor = "勞動法"
    family = "家事法"
    intellectual_property = "智慧財產法"
    general = "一般法律"


class ConsultationRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=2000, description="法律問題")
    domain: LegalDomain = Field(default=LegalDomain.general, description="法律領域")
    conversation_history: list[dict] = Field(default_factory=list, description="對話歷史")


class LegalReference(BaseModel):
    title: str
    article: Optional[str] = None
    content: str
    source: str


class ConsultationResponse(BaseModel):
    answer: str
    references: list[LegalReference] = []
    disclaimer: str = "本回答僅供參考，不構成法律意見。如有具體法律問題，請諮詢執業律師。"
    domain: str


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="搜尋查詢")
    domain: Optional[LegalDomain] = None
    top_k: int = Field(default=5, ge=1, le=20)


class CaseResult(BaseModel):
    case_id: str
    title: str
    court: str
    date: str
    summary: str
    relevance_score: float
    url: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    results: list[CaseResult]
    total: int


class DocumentAnalysisRequest(BaseModel):
    document_type: str = Field(description="文件類型，如：合約、聲請狀、判決書")
    analysis_focus: Optional[str] = Field(default=None, description="分析重點，如：風險條款、義務條款")


class RiskLevel(str, Enum):
    low = "低風險"
    medium = "中風險"
    high = "高風險"


class DocumentIssue(BaseModel):
    clause: str
    issue: str
    risk_level: RiskLevel
    suggestion: str


class DocumentAnalysisResponse(BaseModel):
    document_type: str
    summary: str
    key_points: list[str]
    issues: list[DocumentIssue]
    overall_risk: RiskLevel
    recommendations: list[str]
