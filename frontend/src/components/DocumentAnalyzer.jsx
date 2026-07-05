import { useState, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { api } from "../lib/api";

const DOC_TYPES = ["合約","租賃契約","勞動契約","聲請狀","起訴書","判決書","公司章程","遺囑","其他"];
const RISK_CONFIG = {
  "低風險": { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  "中風險": { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  "高風險": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

export default function DocumentAnalyzer() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("合約");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx|txt)$/i)) {
      setError("僅支援 PDF、DOCX、TXT 格式"); return;
    }
    setFile(f); setError(""); setResult(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await api.analyzeDocument(file, docType, focus);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const RiskBadge = ({ level }) => {
    const cfg = RISK_CONFIG[level] || RISK_CONFIG["低風險"];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
        <Icon size={12} /> {level}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">法律文件分析</h2>
      <p className="text-sm text-gray-500 mb-6">上傳合約或法律文件，AI 自動識別風險條款並提供修改建議</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">文件類型</label>
          <select value={docType} onChange={e => setDocType(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分析重點（選填）</label>
          <input value={focus} onChange={e => setFocus(e.target.value)}
            placeholder="例：違約條款、智財權歸屬..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("file-input").click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 ${
          dragging ? "border-blue-500 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input id="file-input" type="file" accept=".pdf,.docx,.txt" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <FileText size={32} className="mx-auto mb-2 text-green-500" />
            <p className="font-medium text-green-700">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 font-medium">拖曳或點擊上傳文件</p>
            <p className="text-sm text-gray-400 mt-1">支援 PDF、DOCX、TXT（最大 10MB）</p>
          </>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4">{error}</div>}

      <button onClick={analyze} disabled={!file || loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors mb-6">
        {loading ? "AI 分析中..." : "開始分析"}
      </button>

      {result && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">分析結果</h3>
              <RiskBadge level={result.overall_risk} />
            </div>
            <p className="text-sm text-gray-700">{result.summary}</p>
          </div>

          {result.key_points.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">重要條款</h3>
              <ul className="space-y-1.5">
                {result.key_points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">風險條款 ({result.issues.length})</h3>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${RISK_CONFIG[issue.risk_level]?.bg || ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <code className="text-xs bg-white/70 px-2 py-0.5 rounded text-gray-700 line-clamp-1">{issue.clause}</code>
                      <RiskBadge level={issue.risk_level} />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{issue.issue}</p>
                    <p className="text-sm text-blue-700"><strong>建議：</strong>{issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
              <h3 className="font-semibold text-blue-800 mb-3">整體建議</h3>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">›</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
