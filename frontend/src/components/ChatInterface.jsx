import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

const DOMAINS = ["一般法律","民法","刑法","行政法","商業法","勞動法","家事法","智慧財產法"];

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "您好！我是智研 AI，您的台灣法律研究助理。請問有什麼法律問題需要協助？" }
  ]);
  const [input, setInput] = useState("");
  const [domain, setDomain] = useState("一般法律");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await api.consult(question, domain, history);
      const refBlock = res.references?.length
        ? "\n\n---\n**相關法條**\n" + res.references.map(r =>
            `- **${r.title}${r.article ? ` 第${r.article}條` : ""}**：${r.content}`
          ).join("\n")
        : "";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.answer + refBlock,
        disclaimer: res.disclaimer,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "error", content: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
        <select
          value={domain}
          onChange={e => setDomain(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {DOMAINS.map(d => <option key={d}>{d}</option>)}
        </select>
        <span className="text-sm text-gray-500">選擇法律領域以提升回答準確度</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role !== "user" && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "error" ? "bg-red-100" : "bg-blue-600"
              }`}>
                {msg.role === "error" ? <AlertCircle size={16} className="text-red-600" /> : <Bot size={16} className="text-white" />}
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" :
              msg.role === "error" ? "bg-red-50 text-red-700 border border-red-200" :
              "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
            }`}>
              {msg.role === "user"
                ? <p>{msg.content}</p>
                : <ReactMarkdown className="prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
              }
              {msg.disclaimer && (
                <p className="mt-2 text-xs text-gray-400 italic border-t border-gray-100 pt-2">{msg.disclaimer}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User size={16} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="輸入您的法律問題... (Enter 送出，Shift+Enter 換行)"
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none max-h-32"
            rows={2}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
