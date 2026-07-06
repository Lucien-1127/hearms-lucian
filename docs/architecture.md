# 系統架構文件

## API 設計

### 法律諮詢 POST /api/v1/consultation

```json
// Request
{
  "question": "勞工被強迫簽本票有效嗎？",
  "domain": "勞動法",
  "conversation_history": []
}

// Response
{
  "answer": "根據**勞動基準法第 26 條**...",
  "references": [
    {
      "title": "勞動基準法",
      "article": "26",
      "content": "雇主不得預扣勞工工資作為違約金或賠償費用。",
      "source": "全國法規資料庫"
    }
  ],
  "disclaimer": "本回答僅供參考，不構成法律意見...",
  "domain": "勞動法"
}
```

### 判例搜尋 POST /api/v1/search

```json
// Request
{ "query": "非法解雇損害賠償", "domain": "勞動法", "top_k": 5 }

// Response
{
  "query": "非法解雇損害賠償",
  "results": [
    {
      "case_id": "109年度勞上字第12號",
      "title": "終止勞動契約損害賠償",
      "court": "台灣高等法院",
      "date": "2020-08-15",
      "summary": "雇主未依法定程序終止勞動契約...",
      "relevance_score": 0.92
    }
  ],
  "total": 5
}
```

### 文件分析 POST /api/v1/documents/analyze

```
Content-Type: multipart/form-data

file: [binary]
document_type: "合約"
analysis_focus: "違約條款"
```

```json
// Response
{
  "document_type": "合約",
  "summary": "本合約為軟體開發服務合約...",
  "key_points": ["智財歸屬", "保密條款", "違約金"],
  "issues": [
    {
      "clause": "第8條：違約金為合約總價之100%",
      "issue": "違約金過高，可能違反民法第252條",
      "risk_level": "高風險",
      "suggestion": "建議調降至合約總價的10-20%"
    }
  ],
  "overall_risk": "中風險",
  "recommendations": ["建議請律師審查第8條違約金條款"]
}
```

## 資料流程圖

```
用戶 → React UI → FastAPI → AI Service (Claude)
                           ↕
                     Legal Service (ChromaDB RAG)
                           ↕
                     法律資料庫（法條 + 判例）
```

## ChromaDB 資料模型

```python
# 法規集合 (taiwan_statutes)
{
  "id": "civil_law_184",
  "document": "因故意或過失，不法侵害他人之權利者...",
  "metadata": {
    "title": "民法",
    "domain": "民法",
    "article": "184"
  }
}

# 判例集合 (taiwan_cases)
{
  "id": "109-tai-shang-1234",
  "document": "判決摘要文字...",
  "metadata": {
    "case_id": "109年度台上字第1234號",
    "title": "侵權行為損害賠償",
    "court": "最高法院",
    "date": "2020-12-15",
    "domain": "民法",
    "url": "https://judgment.judicial.gov.tw/..."
  }
}
```
