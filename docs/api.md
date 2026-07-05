# API 參考文件

完整互動式 API 文件請在後端啟動後訪問：http://localhost:8000/docs

## 端點總覽

| 方法 | 路徑 | 功能 |
|------|------|------|
| GET | `/` | 服務狀態 |
| GET | `/health` | 健康檢查 |
| POST | `/api/v1/consultation` | 法律諮詢 |
| POST | `/api/v1/search` | 判例搜尋 |
| POST | `/api/v1/documents/analyze` | 文件分析 |

## 法律領域枚舉值

- `民法` - 一般民事法律
- `刑法` - 刑事法律
- `行政法` - 行政程序法
- `商業法` - 公司法、商業交易
- `勞動法` - 勞動基準法、工會法
- `家事法` - 婚姻、繼承
- `智慧財產法` - 著作權、商標、專利
- `一般法律` - 跨領域或不確定領域

## 風險等級枚舉值

- `低風險` - 一般注意事項
- `中風險` - 需要關注並可能需要修改
- `高風險` - 強烈建議修改或諮詢律師

## cURL 範例

```bash
# 法律諮詢
curl -X POST http://localhost:8000/api/v1/consultation \
  -H "Content-Type: application/json" \
  -d '{"question":"租約到期房東不退押金怎麼辦","domain":"民法"}'

# 判例搜尋
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query":"押租金返還","domain":"民法","top_k":3}'

# 文件分析（上傳 PDF）
curl -X POST http://localhost:8000/api/v1/documents/analyze \
  -F "file=@contract.pdf" \
  -F "document_type=租賃契約" \
  -F "analysis_focus=押金條款"
```
