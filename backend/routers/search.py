from fastapi import APIRouter, HTTPException
from models.schemas import SearchRequest, SearchResponse
from services.legal_service import search_cases

router = APIRouter(prefix="/search", tags=["判例搜尋"])


@router.post("", response_model=SearchResponse, summary="語意搜尋相關判例")
async def search(request: SearchRequest) -> SearchResponse:
    """
    以語意搜尋方式查詢相關台灣司法判決。
    優先使用本地向量資料庫；若資料庫尚未建立，則由 AI 即時生成建議判例。
    """
    try:
        domain_value = request.domain.value if request.domain else None
        return await search_cases(request.query, domain_value, request.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜尋服務錯誤：{str(e)}")
