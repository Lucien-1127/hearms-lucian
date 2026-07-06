const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "請求失敗");
  }
  return res.json();
}

export const api = {
  consult: (question, domain = "一般法律", history = []) =>
    request("/consultation", {
      method: "POST",
      body: JSON.stringify({ question, domain, conversation_history: history }),
    }),

  search: (query, domain = null, top_k = 5) =>
    request("/search", {
      method: "POST",
      body: JSON.stringify({ query, domain, top_k }),
    }),

  analyzeDocument: (file, document_type = "合約", analysis_focus = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", document_type);
    form.append("analysis_focus", analysis_focus);
    return fetch(`${BASE_URL}/documents/analyze`, { method: "POST", body: form })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.detail) });
        return res.json();
      });
  },
};
