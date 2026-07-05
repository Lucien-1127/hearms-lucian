import { useState } from "react";
import { Scale, MessageSquare, Search, FileText } from "lucide-react";
import ChatInterface from "./components/ChatInterface";
import LegalSearch from "./components/LegalSearch";
import DocumentAnalyzer from "./components/DocumentAnalyzer";

const TABS = [
  { id: "chat", label: "法律諮詢", icon: MessageSquare },
  { id: "search", label: "判例搜尋", icon: Search },
  { id: "docs", label: "文件分析", icon: FileText },
];

export default function App() {
  const [tab, setTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Scale size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">智研 AI</h1>
          <p className="text-xs text-gray-400">台灣法律研究與諮詢平台</p>
        </div>
        <nav className="ml-auto flex gap-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {tab === "chat" && <ChatInterface />}
        {tab === "search" && (
          <div className="flex-1 overflow-y-auto">
            <LegalSearch />
          </div>
        )}
        {tab === "docs" && (
          <div className="flex-1 overflow-y-auto">
            <DocumentAnalyzer />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 px-6 py-2 text-center">
        <p className="text-xs text-gray-400">
          智研 AI 提供之資訊僅供參考，不構成法律意見。如有具體法律問題，請諮詢執業律師。
        </p>
      </footer>
    </div>
  );
}
