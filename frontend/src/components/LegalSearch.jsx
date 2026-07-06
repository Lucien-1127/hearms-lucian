import { useState } from "react";
import { Search, ExternalLink, Calendar, Building2 } from "lucide-react";
import { api } from "../lib/api";

const DOMAINS = [
  { value: null, label: "全部領域" },
  { value: "民法", label: "民法" },
  { value: "刑法", label: "刑法" },
  { value: "行政法", label: "行政法" },
  { value: "商業法", label: "商業法" },
  { value: "勞動法", label: "勞動法" },
];

const RISK_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

function scoreColor(score) {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.5) return "text-yellow-600";
  return "text-red-500";
}

export default function LegalSearch() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await api.search(query.trim(), domain, 8);
      setResults(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">判例語意搜尋</h2>
      <p className="text-sm text-gray-500 mb-6">輸入法律問題或關鍵字，AI 自動尋找相關台灣司法判決</p>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="例：勞工被非法解雇的損害賠償..."
            className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={domain || ""}
          onChange={e => setDomain(e.target.value || null)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {DOMAINS.map(d => <option key={d.label} value={d.value || ""}>{d.label}</option>)}
        </select>
        <button
          onClick={search}
          disabled={!query.trim() || loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? "搜尋中..." : "搜尋"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm mb-4">{error}</div>
      )}

      {results && (
        <>
          <p className="text-sm text-gray-500 mb-3">找到 <strong>{results.total}</strong> 筆相關判例</p>
          <div className="space-y-3">
            {results.results.map(c => (
              <div key={c.case_id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.case_id}</span>
                      <span className={`text-xs font-semibold ${scoreColor(c.relevance_score)}`}>
                        相關度 {Math.round(c.relevance_score * 100)}%
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 truncate">{c.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.summary}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Building2 size={12} />{c.court}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} />{c.date}</span>
                    </div>
                  </div>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 shrink-0">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {results?.total === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-40" />
          <p>找不到相關判例，請嘗試不同的搜尋關鍵字</p>
        </div>
      )}
    </div>
  );
}
