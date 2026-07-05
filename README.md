# 智研 AI 法律系統

> 智能法律研究與諮詢平台 — AI-Powered Legal Research & Consultation System

## 系統概覽

智研 AI 是一套針對台灣法律體系設計的智能法律輔助系統，整合大型語言模型 (LLM)、檢索增強生成 (RAG) 技術與台灣法律資料庫，提供：

- **法律諮詢**：自然語言問答，引用相關法條與判例
- **文件分析**：合約審查、法律文件摘要與風險評估
- **判例搜尋**：語意搜尋相關司法裁判
- **法規查詢**：即時查詢最新法條內容

## 系統架構

```
┌─────────────────────────────────────────────┐
│               Frontend (React)               │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Chat UI │  │ Doc Analyzer│  │  Search  │ │
│  └──────────┘  └────────────┘  └──────────┘ │
└──────────────────────┬──────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────┐
│              Backend (FastAPI)               │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │Consultation│ │  Document  │  │  Search  │ │
│  │  Router  │  │  Router    │  │  Router  │ │
│  └────┬─────┘  └─────┬──────┘  └────┬─────┘ │
│       └──────────────┼──────────────┘       │
│              ┌───────▼──────┐               │
│              │  AI Service  │               │
│              │ (Claude API) │               │
│              └───────┬──────┘               │
│              ┌───────▼──────┐               │
│              │ Legal Service│               │
│              │  (RAG + DB)  │               │
│              └──────────────┘               │
└─────────────────────────────────────────────┘
```

## 技術棧

| 層級 | 技術 |
|------|------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI 模型 | Claude (Anthropic API) |
| 向量資料庫 | ChromaDB |
| 資料來源 | 全國法規資料庫、司法院判決資料庫 |
| 部署 | Docker Compose |

## 快速開始

### 環境需求
- Python 3.11+
- Node.js 20+
- Docker (選用)

### 後端啟動

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env   # 填入 ANTHROPIC_API_KEY
uvicorn main:app --reload
```

### 前端啟動

```bash
cd frontend
npm install
npm run dev
```

### Docker 一鍵啟動

```bash
cp .env.example .env      # 填入 ANTHROPIC_API_KEY
docker compose up -d
```

系統預設在以下端口啟動：
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 環境變數

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 金鑰 | ✅ |
| `MODEL_ID` | 使用的 Claude 模型 | 否 (預設 claude-sonnet-5) |
| `CHROMA_PERSIST_DIR` | ChromaDB 持久化路徑 | 否 |
| `CORS_ORIGINS` | 允許的前端來源 | 否 |

## 專案結構

```
hearms-lucian/
├── backend/
│   ├── main.py              # FastAPI 應用入口
│   ├── requirements.txt
│   ├── routers/
│   │   ├── consultation.py  # 法律諮詢 API
│   │   ├── search.py        # 判例搜尋 API
│   │   └── documents.py     # 文件分析 API
│   ├── services/
│   │   ├── ai_service.py    # Claude AI 整合
│   │   └── legal_service.py # 法律資料 RAG 服務
│   └── models/
│       └── schemas.py       # Pydantic 資料模型
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── DocumentAnalyzer.jsx
│   │   │   └── LegalSearch.jsx
│   │   └── lib/
│   │       └── api.js
│   └── package.json
├── docs/
│   ├── architecture.md      # 深度架構研究
│   ├── research.md          # 法律 AI 系統研究
│   └── api.md               # API 文件
├── docker-compose.yml
└── .env.example
```

## 法律聲明

本系統提供之資訊僅供參考，不構成法律意見。如有具體法律問題，請諮詢執業律師。
