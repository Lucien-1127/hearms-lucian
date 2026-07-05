from fastapi import APIRouter, HTTPException
from models.schemas import ConsultationRequest, ConsultationResponse
from services.ai_service import get_legal_consultation

router = APIRouter(prefix="/consultation", tags=["法律諮詢"])


@router.post("", response_model=ConsultationResponse, summary="法律問題諮詢")
async def consult(request: ConsultationRequest) -> ConsultationResponse:
    """
    提交法律問題，獲得 AI 分析與相關法條引用。
    支援多輪對話（透過 conversation_history 傳入歷史訊息）。
    """
    try:
        return await get_legal_consultation(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 服務暫時無法使用：{str(e)}")
