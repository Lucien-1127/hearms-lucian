import os
from anthropic import AsyncAnthropic
from models.schemas import (
    ConsultationRequest, ConsultationResponse, LegalReference,
    DocumentAnalysisRequest, DocumentAnalysisResponse, DocumentIssue, RiskLevel
)
import json
import re

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL_ID = os.getenv("MODEL_ID", "claude-sonnet-5")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "4096"))

SYSTEM_PROMPT = """你是「智研 AI」，一位精通台灣法律的智能法律研究助理。

你的角色：
- 提供準確、清晰的台灣法律資訊
- 引用相關法條（民法、刑法、特別法等）和司法院判例
- 以繁體中文回答，語氣專業但易於理解
- 主動說明相關法律風險與注意事項

回答格式（JSON）：
{
  "answer": "詳細的法律說明（使用 Markdown 格式）",
  "references": [
    {
      "title": "法規名稱",
      "article": "條文編號",
      "content": "條文內容摘要",
      "source": "來源（如：全國法規資料庫）"
    }
  ]
}

注意事項：
- 不提供具體個案的法律策略建議
- 法律資訊具有時效性，建議使用者確認最新版本
- 複雜法律問題建議諮詢執業律師"""


async def get_legal_consultation(request: ConsultationRequest) -> ConsultationResponse:
    messages = []

    for msg in request.conversation_history[-6:]:
        if msg.get("role") in ("user", "assistant"):
            messages.append({"role": msg["role"], "content": msg["content"]})

    domain_context = f"【法律領域：{request.domain.value}】\n\n" if request.domain else ""
    messages.append({"role": "user", "content": f"{domain_context}{request.question}"})

    response = await client.messages.create(
        model=MODEL_ID,
        max_tokens=MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    raw = response.content[0].text.strip()

    try:
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            references = [LegalReference(**ref) for ref in data.get("references", [])]
            return ConsultationResponse(
                answer=data.get("answer", raw),
                references=references,
                domain=request.domain.value,
            )
    except (json.JSONDecodeError, KeyError):
        pass

    return ConsultationResponse(answer=raw, domain=request.domain.value)


DOCUMENT_ANALYSIS_SYSTEM = """你是台灣法律文件分析專家，擅長審查合約、法律書狀與各類法律文件。

分析文件時請輸出 JSON 格式：
{
  "summary": "文件概要（100字以內）",
  "key_points": ["重點1", "重點2", ...],
  "issues": [
    {
      "clause": "問題條款或段落",
      "issue": "問題說明",
      "risk_level": "低風險|中風險|高風險",
      "suggestion": "修改建議"
    }
  ],
  "overall_risk": "低風險|中風險|高風險",
  "recommendations": ["建議1", "建議2", ...]
}"""


async def analyze_document(
    text: str,
    request: DocumentAnalysisRequest,
) -> DocumentAnalysisResponse:
    focus = f"\n\n分析重點：{request.analysis_focus}" if request.analysis_focus else ""
    user_content = f"文件類型：{request.document_type}{focus}\n\n文件內容：\n{text[:8000]}"

    response = await client.messages.create(
        model=MODEL_ID,
        max_tokens=MAX_TOKENS,
        system=DOCUMENT_ANALYSIS_SYSTEM,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = response.content[0].text.strip()
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not json_match:
        raise ValueError("AI 回應格式錯誤")

    data = json.loads(json_match.group())

    issues = [
        DocumentIssue(
            clause=i["clause"],
            issue=i["issue"],
            risk_level=RiskLevel(i["risk_level"]),
            suggestion=i["suggestion"],
        )
        for i in data.get("issues", [])
    ]

    return DocumentAnalysisResponse(
        document_type=request.document_type,
        summary=data.get("summary", ""),
        key_points=data.get("key_points", []),
        issues=issues,
        overall_risk=RiskLevel(data.get("overall_risk", "低風險")),
        recommendations=data.get("recommendations", []),
    )


async def semantic_search_ai(query: str, domain: str | None = None) -> str:
    domain_hint = f"（限定法律領域：{domain}）" if domain else ""
    prompt = f"""請針對以下法律查詢{domain_hint}，列出 5 筆相關的台灣司法判決或法律見解，
以 JSON 陣列格式輸出：
[
  {{
    "case_id": "判決字號",
    "title": "案由摘要",
    "court": "法院名稱",
    "date": "判決日期 YYYY-MM-DD",
    "summary": "判決摘要（50字）",
    "relevance_score": 0.0~1.0
  }}
]

查詢：{query}"""

    response = await client.messages.create(
        model=MODEL_ID,
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()
