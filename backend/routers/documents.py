import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.schemas import DocumentAnalysisRequest, DocumentAnalysisResponse, LegalDomain
from services.ai_service import analyze_document

router = APIRouter(prefix="/documents", tags=["文件分析"])


async def _extract_text(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename or ""

    if filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            raise HTTPException(status_code=422, detail="PDF 解析失敗，請確認檔案完整性")

    if filename.endswith(".docx"):
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception:
            raise HTTPException(status_code=422, detail="DOCX 解析失敗")

    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        return content.decode("big5", errors="replace")


@router.post("/analyze", response_model=DocumentAnalysisResponse, summary="法律文件分析")
async def analyze(
    file: UploadFile = File(..., description="上傳文件（支援 PDF、DOCX、TXT）"),
    document_type: str = Form(default="合約", description="文件類型"),
    analysis_focus: str = Form(default="", description="分析重點（選填）"),
) -> DocumentAnalysisResponse:
    """
    上傳法律文件（PDF / DOCX / TXT），AI 自動分析並回傳：
    - 文件摘要
    - 重要條款
    - 風險評估
    - 修改建議
    """
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="檔案過大，請上傳 10MB 以內的文件")

    text = await _extract_text(file)
    if not text.strip():
        raise HTTPException(status_code=422, detail="無法從文件中提取文字內容")

    req = DocumentAnalysisRequest(
        document_type=document_type,
        analysis_focus=analysis_focus or None,
    )

    try:
        return await analyze_document(text, req)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件分析失敗：{str(e)}")
