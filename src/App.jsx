import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

// ── ICONS (inline SVG to avoid import issues) ─────────────
const Icon = {
  dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  jd:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  screen:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pipeline:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  chat:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  send:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  trash:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
  download:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chevron:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  zap:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  loader:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  alert:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  users:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  trend:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
}

// ── SCORE RING ────────────────────────────────────────────
function ScoreRing({ score }) {
  const c = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"
  const r = 38, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <svg width="96" height="96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#1e2d47" strokeWidth="7" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={c} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: c }}>{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
    </div>
  )
}

// ── PILL ──────────────────────────────────────────────────
function Pill({ label, type }) {
  const s = {
    green: "bg-emerald-950 text-emerald-300 border border-emerald-800",
    red:   "bg-red-950 text-red-300 border border-red-900",
    blue:  "bg-blue-950 text-blue-300 border border-blue-900",
  }
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs m-0.5 font-medium ${s[type]}`}>{label}</span>
}

// ── SECTION HEADER ────────────────────────────────────────
function SectionHeader({ color = "bg-blue-500", children }) {
  return (
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
      <span className={`w-0.5 h-4 ${color} rounded`} />
      {children}
    </h3>
  )
}

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard")
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const nav = [
    { id: "dashboard", label: "Dashboard",       I: Icon.dashboard },
    { id: "jd",        label: "JD Generator",    I: Icon.jd },
    { id: "screen",    label: "Resume Screener", I: Icon.screen },
    { id: "pipeline",  label: "Hiring Pipeline", I: Icon.pipeline },
  ]

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    setChatInput("")
    setChatMessages(m => [...m, { role: "user", content: msg }])
    setChatLoading(true)
    try {
      const res = await axios.post(`${API}/api/chat`, { message: msg, session_id: "bubble" })
      setChatMessages(m => [...m, { role: "assistant", content: res.data.reply }])
    } catch {
      setChatMessages(m => [...m, { role: "assistant", content: "Backend offline. Run: python main.py" }])
    }
    setChatLoading(false)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
         className="min-h-screen bg-[#080d14] text-slate-200 flex">

      {/* ── SIDEBAR ── */}
      <aside className="w-52 bg-[#0a0f1a] border-r border-[#1a2540] flex flex-col fixed h-full z-40">
        <div className="p-5 border-b border-[#1a2540]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white
                            font-black text-sm"
                 style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>S</div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">SmartHire</div>
              <div className="text-xs text-slate-500">AI Platform</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 pt-4">
          <p className="text-xs text-slate-600 uppercase tracking-widest px-2 mb-3">Navigation</p>
          {nav.map(({ id, label, I }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1
                         transition-all duration-150
                         ${page === id
                ? "text-white font-semibold"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
              style={page === id ? {
                background: "linear-gradient(135deg,rgba(37,99,235,0.3),rgba(124,58,237,0.2))",
                boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.3)"
              } : {}}>
              <I />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a2540]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Claude Sonnet · Live</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ml-52 flex-1 min-h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-[#080d14]/90 backdrop-blur border-b
                        border-[#1a2540] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {nav.find(n => n.id === page)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-slate-500">SmartHire AI · Recruitment Intelligence</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400
                          bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            API Connected
          </div>
        </div>

        <div className="p-8">
          {page === "dashboard" && <Dashboard goTo={setPage} />}
          {page === "jd"        && <JDGenerator />}
          {page === "screen"    && <ResumeScreener />}
          {page === "pipeline"  && <HiringPipeline />}
        </div>
      </main>

      {/* ── CHAT BUBBLE ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-80 bg-[#0f1623] border border-[#1a2540] rounded-2xl
                          shadow-2xl flex flex-col overflow-hidden"
               style={{ height: 420, boxShadow: "0 25px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(99,102,241,0.15)" }}>
            <div className="px-4 py-3 flex items-center gap-3"
                 style={{ background: "linear-gradient(135deg,#1e3a8a,#4c1d95)" }}>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center
                              justify-center text-sm">🤖</div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">SmartHire Assistant</div>
                <div className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Online
                </div>
              </div>
              <button onClick={() => setChatOpen(false)}
                      className="text-white/60 hover:text-white text-lg leading-none w-6 h-6
                                 flex items-center justify-center rounded-full hover:bg-white/10">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {chatMessages.length === 0 && (
                <div className="bg-[#1a2438] border border-[#1e2d47] rounded-2xl rounded-tl-sm
                                p-3 text-xs text-slate-300 leading-relaxed">
                  👋 Hi! Ask me anything about the <strong className="text-blue-400">Python Developer</strong> role.
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                    ${m.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-[#1a2438] border border-[#1e2d47] text-slate-300 rounded-bl-sm"}`}
                    style={m.role === "user" ? { background: "linear-gradient(135deg,#2563eb,#7c3aed)" } : {}}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a2438] border border-[#1e2d47] rounded-2xl rounded-bl-sm
                                  px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
                    <span className="flex gap-0.5">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </span>
                    Thinking
                  </div>
                </div>
              )}
            </div>

            {chatMessages.length === 0 && (
              <div className="px-3 pb-2 flex gap-1 flex-wrap">
                {["What's the salary?", "Is it remote?", "Tech stack?"].map(q => (
                  <button key={q} onClick={() => setChatInput(q)}
                    className="text-xs bg-[#1e2d47] hover:bg-[#263550] text-slate-400
                               hover:text-slate-200 px-2.5 py-1 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-[#1a2540] flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Ask about the role..."
                className="flex-1 bg-[#0d1420] border border-[#1a2540] rounded-xl px-3 py-2
                           text-xs text-slate-200 placeholder-slate-600
                           focus:outline-none focus:border-blue-600" />
              <button onClick={sendChat} disabled={chatLoading}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white
                           transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                <Icon.send />
              </button>
              <button onClick={() => setChatMessages([])}
                className="w-8 h-8 rounded-xl bg-[#1e2d47] hover:bg-[#263550]
                           flex items-center justify-center text-slate-400 transition-colors">
                <Icon.trash />
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setChatOpen(o => !o)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white
                     shadow-2xl hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                   boxShadow: "0 8px 32px rgba(99,102,241,0.5)" }}>
          <Icon.chat />
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════
function Dashboard({ goTo }) {
  const stats = [
    { label: "JDs Generated",       value: "247",   delta: "↑ 12 this week",  I: Icon.jd,       grad: "#2563eb,#1d4ed8" },
    { label: "Resumes Screened",     value: "1,842", delta: "↑ 89 this week",  I: Icon.users,    grad: "#7c3aed,#6d28d9" },
    { label: "Interviews Scheduled", value: "134",   delta: "↑ 7 this week",   I: Icon.check,    grad: "#059669,#047857" },
    { label: "Avg Screen Time",      value: "3.2s",  delta: "↓ 0.4s faster",   I: Icon.clock,    grad: "#d97706,#b45309" },
  ]

  const modules = [
    { id: "jd",       label: "JD Generator",    desc: "Generate professional job descriptions with tone control.",              phase: "Phase 1",  color: "#2563eb", glow: "rgba(37,99,235,0.3)" },
    { id: "screen",   label: "Resume Screener", desc: "Score resumes — zero-shot, few-shot, chain-of-thought.",                phase: "Phase 2",  color: "#7c3aed", glow: "rgba(124,58,237,0.3)" },
    { id: "pipeline", label: "Hiring Pipeline", desc: "LangGraph state machine: screen → route → interview or reject.",       phase: "Phase 5–6",color: "#059669", glow: "rgba(5,150,105,0.3)" },
    { id: "dashboard",label: "RAG Search",      desc: "Semantic candidate search powered by ChromaDB vector embeddings.",     phase: "Phase 4",  color: "#d97706", glow: "rgba(217,119,6,0.3)" },
  ]

  const activity = [
    { name: "Sneha Krishnan", initials: "SK", action: "Proceeded to interview", score: 91, time: "2m ago" },
    { name: "Rahul Sharma",   initials: "RS", action: "Proceeded to interview", score: 84, time: "15m ago" },
    { name: "Arjun Reddy",    initials: "AR", action: "Not selected",           score: 38, time: "1h ago" },
    { name: "Priya Patel",    initials: "PP", action: "Proceeded to interview", score: 79, time: "2h ago" },
  ]

  const pipelineSteps = [
    { label: "Input",       state: "done" },
    { label: "Screener",    state: "done" },
    { label: "Router",      state: "done" },
    { label: "Interviewer", state: "active" },
    { label: "Email",       state: "idle" },
    { label: "Decision",    state: "idle" },
  ]

  return (
    <div>
      {/* ── HERO ── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 p-8"
           style={{ background: "linear-gradient(135deg,#0f1e3d 0%,#1a1040 50%,#0f2030 100%)",
                    boxShadow: "inset 0 0 80px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.2)" }}>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.06]"
             style={{ backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)",
                      backgroundSize: "48px 48px" }} />
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
             style={{ background: "radial-gradient(circle,#7c3aed,transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-15 blur-3xl"
             style={{ background: "radial-gradient(circle,#2563eb,transparent 70%)", transform: "translate(-30%,30%)" }} />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold
                            border border-indigo-500/30 text-indigo-300"
                 style={{ background: "rgba(99,102,241,0.15)" }}>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              7 Phases Complete · Production Ready
            </div>
            <h1 className="text-4xl font-black text-white mb-3 leading-tight tracking-tight">
              SmartHire<br />
              <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Intelligence
              </span>
            </h1>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
              End-to-end AI recruitment — Claude API, LangChain, LangGraph, RAG pipelines, and agentic workflows.
            </p>
            <div className="flex gap-3">
              <button onClick={() => goTo("pipeline")}
                className="flex items-center gap-2 text-white text-sm font-semibold
                           px-5 py-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                         boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                <Icon.zap /> Run Pipeline
              </button>
              <button onClick={() => goTo("jd")}
                className="flex items-center gap-2 text-slate-300 hover:text-white text-sm
                           px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20
                           bg-white/5 hover:bg-white/10 transition-all">
                <Icon.jd /> Generate JD
              </button>
            </div>
          </div>

          {/* Big decorative text */}
          <div className="hidden lg:flex flex-col items-end opacity-10 select-none">
            <span className="text-8xl font-black text-white leading-none">AI</span>
            <span className="text-5xl font-black text-white leading-none tracking-widest">HIRE</span>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label}
            className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-5
                       hover:border-slate-600/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px"
                 style={{ background: `linear-gradient(90deg,transparent,${s.grad.split(",")[0]},transparent)` }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
                <p className="text-3xl font-black text-white mb-1 tracking-tight">{s.value}</p>
                <p className="text-xs text-emerald-400 font-medium">{s.delta}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: `linear-gradient(135deg,${s.grad})` }}>
                <s.I />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODULES + ACTIVITY ── */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="col-span-2">
          <SectionHeader color="bg-indigo-500">Platform Modules</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((m) => (
              <button key={m.id}
                onClick={() => { console.log("navigating to", m.id); goTo(m.id); }}
                className="text-left bg-[#0f1623] border border-[#1a2540] rounded-xl p-5
                           transition-all duration-200 hover:scale-[1.02] group"
                style={{ cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "66"; e.currentTarget.style.boxShadow = `0 8px 32px ${m.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                     style={{ background: `linear-gradient(135deg,${m.color},${m.color}aa)` }}>
                  {m.id === "jd" && <Icon.jd />}
                  {m.id === "screen" && <Icon.screen />}
                  {m.id === "pipeline" && <Icon.pipeline />}
                  {m.id === "dashboard" && <Icon.trend />}
                </div>
                <h4 className="text-sm font-bold text-slate-100 mb-1.5">{m.label}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{m.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ background: m.color + "22", color: m.color, border: `1px solid ${m.color}33` }}>
                    {m.phase}
                  </span>
                  <span className="text-slate-600 group-hover:text-slate-400 transition-colors">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Activity */}
          <div>
            <SectionHeader color="bg-emerald-500">Recent Activity</SectionHeader>
            <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
              {activity.map((a, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2540]
                             last:border-0 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center
                                  text-xs font-bold text-white flex-shrink-0"
                       style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                    {a.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{a.name}</p>
                    <p className={`text-xs truncate ${a.score >= 55 ? "text-emerald-400" : "text-red-400"}`}>
                      {a.action}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${a.score >= 70 ? "text-emerald-400" : a.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                      {a.score}
                    </p>
                    <p className="text-xs text-slate-600">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <SectionHeader color="bg-violet-500">Quick Actions</SectionHeader>
            <div className="flex flex-col gap-2">
              {[
                { label: "Generate new JD",    id: "jd",       color: "#2563eb" },
                { label: "Screen a resume",     id: "screen",   color: "#7c3aed" },
                { label: "Run hiring pipeline", id: "pipeline", color: "#059669" },
              ].map(a => (
                <button key={a.id} onClick={() => goTo(a.id)}
                  className="w-full text-white text-xs font-semibold py-2.5 px-4
                             rounded-xl transition-all hover:scale-[1.02] flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg,${a.color},${a.color}bb)` }}>
                  {a.label}
                  <Icon.chevron />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PIPELINE FLOW ── */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionHeader color="bg-blue-500">LangGraph Pipeline</SectionHeader>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium
                          bg-emerald-950/50 border border-emerald-800/40 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Active
          </div>
        </div>
        <div className="flex items-center">
          {pipelineSteps.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                text-xs font-bold border-2 transition-all`}
                     style={
                       s.state === "done" ? { background: "#064e3b", borderColor: "#10b981", color: "#34d399", boxShadow: "0 0 12px rgba(16,185,129,0.3)" }
                       : s.state === "active" ? { background: "#1e1b4b", borderColor: "#6366f1", color: "#a5b4fc", boxShadow: "0 0 16px rgba(99,102,241,0.4)", animation: "pulse 2s infinite" }
                       : { background: "#0f1623", borderColor: "#1a2540", color: "#475569" }
                     }>
                  {s.state === "done" ? "✓" : s.state === "active" ? "→" : i + 1}
                </div>
                <span className="text-xs mt-2 font-medium"
                      style={{ color: s.state === "done" ? "#10b981" : s.state === "active" ? "#818cf8" : "#475569" }}>
                  {s.label}
                </span>
              </div>
              {i < pipelineSteps.length - 1 && (
                <div className="h-0.5 w-10 mx-2 mb-5 rounded transition-all"
                     style={{ background: pipelineSteps[i].state === "done" && pipelineSteps[i+1].state !== "idle" ? "#10b981"
                              : pipelineSteps[i].state === "done" ? "linear-gradient(90deg,#10b981,#1a2540)"
                              : "#1a2540" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// JD GENERATOR
// ══════════════════════════════════════════════════════════
function JDGenerator() {
  const [form, setForm] = useState({ job_title: "", company: "", experience: "2-3 years", tone: "Professional" })
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function generate() {
    if (!form.job_title || !form.company) { setError("Fill in Job Title and Company."); return }
    setError(""); setLoading(true)
    try {
      const res = await axios.post(`${API}/api/generate-jd`, form)
      setResult(res.data.job_description)
    } catch { setError("Backend offline. Make sure python main.py is running.") }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1 tracking-tight">JD Generator</h2>
      <p className="text-sm text-slate-500 mb-6">Phase 1 · GenAI Foundations · Claude API</p>

      <div className="bg-[#0f1623] border border-[#1a2540] rounded-2xl p-6 mb-5">
        <SectionHeader>Configuration</SectionHeader>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Job Title</label>
            <input value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})}
              placeholder="e.g. Python Developer"
              className="w-full bg-[#080d14] border border-[#1a2540] rounded-xl px-3 py-2.5
                         text-sm text-slate-200 placeholder-slate-700
                         focus:outline-none focus:border-indigo-600 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Company</label>
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              placeholder="e.g. SmartHire"
              className="w-full bg-[#080d14] border border-[#1a2540] rounded-xl px-3 py-2.5
                         text-sm text-slate-200 placeholder-slate-700
                         focus:outline-none focus:border-indigo-600 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Experience</label>
            <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}
              className="w-full bg-[#080d14] border border-[#1a2540] rounded-xl px-3 py-2.5
                         text-sm text-slate-200 focus:outline-none focus:border-indigo-600">
              {["0-1 years","1-2 years","2-3 years","3-5 years","5+ years"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs text-slate-500 mb-2 block font-medium">Tone</label>
          <div className="flex gap-2">
            {["Professional","Friendly & Casual","Startup Vibe"].map(t => (
              <button key={t} onClick={() => setForm({...form, tone: t})}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={form.tone === t
                  ? { background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white" }
                  : { background: "#1a2540", color: "#94a3b8" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-red-400 mb-3 flex items-center gap-1"><Icon.alert />{error}</p>}
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl
                     text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>
          {loading ? <><Icon.loader /> Generating...</> : <><Icon.zap /> Generate JD</>}
        </button>
      </div>

      {result && (
        <div className="bg-[#0f1623] border border-[#1a2540] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader>Generated Job Description</SectionHeader>
            <button onClick={() => { const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([result],{type:"text/plain"})); a.download=`${form.job_title}_JD.txt`; a.click(); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200
                         bg-[#1a2540] px-3 py-1.5 rounded-lg transition-colors">
              <Icon.download /> Download
            </button>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap
                          bg-[#080d14] rounded-xl p-5 border border-[#1a2540]">{result}</div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// RESUME SCREENER
// ══════════════════════════════════════════════════════════
function ResumeScreener() {
  const [jd, setJd] = useState("")
  const [resume, setResume] = useState("")
  const [technique, setTechnique] = useState("zero-shot")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfInfo, setPdfInfo] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  async function handlePdfUpload(file) {
    if (!file || !file.name.endsWith(".pdf")) { alert("Please upload a PDF file."); return }
    setPdfLoading(true); setPdfInfo(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await axios.post(`${API}/api/extract-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setResume(res.data.text)
      setPdfInfo({ name: res.data.filename, pages: res.data.pages })
    } catch { alert("Failed to extract PDF. Try pasting text manually.") }
    setPdfLoading(false)
  }

  async function screen() {
    if (!jd || !resume) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/screen-resume`, { job_description: jd, resume, technique })
      setResult(res.data)
    } catch { alert("Backend offline.") }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1 tracking-tight">Resume Screener</h2>
      <p className="text-sm text-slate-500 mb-6">Phase 2 · Prompt Engineering · PDF Upload + Structured JSON</p>

      <div className="bg-[#0f1623] border border-[#1a2540] rounded-2xl p-6 mb-5">
        <SectionHeader>Input</SectionHeader>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* JD */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Job Description</label>
            <textarea value={jd} onChange={e => setJd(e.target.value)}
              placeholder="Paste job description..." rows={8}
              className="w-full bg-[#080d14] border border-[#1a2540] rounded-xl px-3 py-2.5
                         text-sm text-slate-200 placeholder-slate-700 resize-none
                         focus:outline-none focus:border-indigo-600 transition-colors" />
          </div>

          {/* Resume — PDF upload + paste */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-500 font-medium">Candidate Resume</label>
              {pdfInfo && (
                <span className="text-xs text-emerald-400">
                  ✓ {pdfInfo.name} · {pdfInfo.pages} pages
                </span>
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handlePdfUpload(e.dataTransfer.files[0]) }}
              onClick={() => document.getElementById("pdf-upload").click()}
              className={`border-2 border-dashed rounded-xl text-center cursor-pointer
                          transition-all duration-200
                          flex flex-col items-center justify-center
                          ${dragOver ? "border-indigo-500 bg-indigo-950/30"
                            : "border-[#1a2540] hover:border-indigo-700 bg-[#080d14]"}`}
              style={{ minHeight: "260px" }}>
              {pdfLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-5xl animate-pulse">📄</div>
                  <Icon.loader />
                  <span className="text-sm text-slate-400">Extracting text from PDF...</span>
                </div>
              ) : pdfInfo ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-5xl">✅</div>
                  <p className="text-sm font-semibold text-emerald-400">{pdfInfo.name}</p>
                  <p className="text-xs text-slate-500">{pdfInfo.pages} pages extracted successfully</p>
                  <p className="text-xs text-indigo-400 mt-1">Click to upload a different PDF</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 px-8">
                  <div className="text-6xl">📄</div>
                  <div>
                    <p className="text-base text-slate-200 font-semibold mb-1">
                      Drop your resume PDF here
                    </p>
                    <p className="text-sm text-slate-500">
                      or <span className="text-indigo-400 font-medium">click to browse</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Supports .pdf · Text extracted automatically by AI
                  </p>
                </div>
              )}
              <input id="pdf-upload" type="file" accept=".pdf" className="hidden"
                onChange={e => handlePdfUpload(e.target.files[0])} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-slate-500 font-medium">Technique:</span>
          {["zero-shot","few-shot","chain-of-thought"].map(t => (
            <button key={t} onClick={() => setTechnique(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={technique === t
                ? { background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white" }
                : { background: "#1a2540", color: "#94a3b8" }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={screen} disabled={loading || !jd || !resume}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl
                     text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>
          {loading ? <><Icon.loader /> Screening...</> : <><Icon.screen /> Screen Resume</>}
        </button>
      </div>

      {result && (
        <div className="bg-[#0f1623] border border-[#1a2540] rounded-2xl p-6">
          <SectionHeader color="bg-violet-500">Results</SectionHeader>
          <div className="grid grid-cols-3 gap-6 mb-5">
            <div className="flex flex-col items-center justify-center bg-[#080d14]
                            rounded-xl border border-[#1a2540] py-4">
              <ScoreRing score={result.overall_score} />
              <span className="text-xs text-slate-500 mt-1">Overall Score</span>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recommendation</p>
                <span className={`inline-block px-3 py-2 rounded-xl text-sm font-bold
                  ${result.recommendation?.includes("Yes")
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-red-950 text-red-300 border border-red-900"}`}>
                  {result.recommendation}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Experience</p>
                <span className={`text-sm font-semibold ${result.experience_match ? "text-emerald-400" : "text-red-400"}`}>
                  {result.experience_match ? "✓ Matches requirement" : "✗ Below requirement"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Matched Skills</p>
              <div className="mb-3">{result.skills_match?.matched?.map(s => <Pill key={s} label={s} type="green" />)}</div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Missing Skills</p>
              <div>{result.skills_match?.missing?.map(s => <Pill key={s} label={s} type="red" />)}</div>
            </div>
          </div>
          <div className="bg-[#080d14] rounded-xl border border-[#1a2540] p-4 mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Summary</p>
            <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
          </div>
          {result.red_flags?.length > 0 && (
            <div className="bg-red-950/20 rounded-xl border border-red-900/40 p-4">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Icon.alert /> Red Flags
              </p>
              {result.red_flags.map((f, i) => <p key={i} className="text-sm text-red-300">⚠ {f}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// HIRING PIPELINE
// ══════════════════════════════════════════════════════════
function HiringPipeline() {
  const candidates = ["Rahul Sharma","Priya Patel","Arjun Reddy","Sneha Krishnan"]
  const [mode, setMode] = useState("database")
  const [selected, setSelected] = useState("Rahul Sharma")
  const [resume, setResume] = useState("")
  const [pdfInfo, setPdfInfo] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)

  async function handlePdfUpload(file) {
    if (!file || !file.name.endsWith(".pdf")) { alert("Please upload a PDF file."); return }
    setPdfLoading(true); setPdfInfo(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await axios.post(`${API}/api/extract-pdf`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      setResume(res.data.text)
      setPdfInfo({ name: res.data.filename, pages: res.data.pages })
    } catch { alert("Failed to extract PDF.") }
    setPdfLoading(false)
  }

  async function runPipeline() {
    if (mode === "upload" && !resume) { alert("Please upload a resume first."); return }
    setLoading(true); setResult(null); setStep(0)
    for (let s = 1; s <= 5; s++) { await new Promise(r => setTimeout(r, 500)); setStep(s) }
    try {
      const payload = mode === "upload"
        ? { candidate_name: "", resume_text: resume }
        : { candidate_name: selected, resume_text: "" }
      const res = await axios.post(`${API}/api/run-pipeline`, payload)
      setResult(res.data)
    } catch { alert("Backend offline.") }
    setLoading(false)
  }

  const nodes = ["Input","Screener","Router",
    result?.path === "interviewer" ? "Interviewer ✓" : result ? "Rejector ✗" : "Branch",
    "Email","Done"]

  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1 tracking-tight">Hiring Pipeline</h2>
      <p className="text-sm text-slate-500 mb-6">Phase 5–6 · Agentic AI · LangGraph State Machine</p>
      <div className="grid grid-cols-3 gap-5">
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f1623] border border-[#1a2540] rounded-2xl p-5">
            <SectionHeader>Input Mode</SectionHeader>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[["database","Sample Candidates"],["upload","Upload Resume"]].map(([m, label]) => (
                <button key={m} onClick={() => { setMode(m); setResult(null); setStep(0); setResume(""); setPdfInfo(null) }}
                  className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={mode === m ? { background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white" } : { background: "#1a2540", color: "#64748b" }}>
                  {label}
                </button>
              ))}
            </div>
            {mode === "database" && (
              <div className="flex flex-col gap-2">
                {candidates.map(c => (
                  <button key={c} onClick={() => { setSelected(c); setResult(null); setStep(0) }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between"
                    style={selected === c
                      ? { background: "rgba(37,99,235,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "white" }
                      : { color: "#64748b", border: "1px solid transparent" }}>
                    <span className="font-medium">{c}</span>
                    {selected === c && <span className="text-indigo-400 text-xs">selected</span>}
                  </button>
                ))}
              </div>
            )}
            {mode === "upload" && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handlePdfUpload(e.dataTransfer.files[0]) }}
                onClick={() => document.getElementById("pipeline-pdf").click()}
                className="border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center"
                style={{ minHeight: "180px", borderColor: dragOver ? "#6366f1" : "#1a2540", background: dragOver ? "rgba(99,102,241,0.1)" : "#080d14" }}>
                {pdfLoading ? (
                  <div className="flex flex-col items-center gap-2"><div className="text-3xl animate-pulse">📄</div><span className="text-xs text-slate-400">Extracting...</span></div>
                ) : pdfInfo ? (
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-3xl">✅</div>
                    <p className="text-xs font-semibold text-emerald-400">{pdfInfo.name}</p>
                    <p className="text-xs text-slate-500">{pdfInfo.pages} pages ready</p>
                    <p className="text-xs text-indigo-400">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-4xl">📄</div>
                    <p className="text-sm text-slate-300 font-semibold">Drop resume PDF</p>
                    <p className="text-xs text-slate-500">or <span className="text-indigo-400">click to upload</span></p>
                  </div>
                )}
                <input id="pipeline-pdf" type="file" accept=".pdf" className="hidden" onChange={e => handlePdfUpload(e.target.files[0])} />
              </div>
            )}
          </div>
          <button onClick={runPipeline} disabled={loading || (mode === "upload" && !resume)}
            className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>
            {loading ? <><Icon.loader /> Running...</> : <><Icon.zap /> Run Pipeline</>}
          </button>
        </div>
        <div className="col-span-2 bg-[#0f1623] border border-[#1a2540] rounded-2xl p-6">
          <SectionHeader>Execution</SectionHeader>
          <div className="flex items-center mb-6">
            {nodes.map((n, i) => (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                       style={result && i <= 4 ? { background:"#064e3b", borderColor:"#10b981", color:"#34d399", boxShadow:"0 0 12px rgba(16,185,129,0.3)" }
                         : step > i ? { background:"#1e1b4b", borderColor:"#6366f1", color:"#a5b4fc" }
                         : { background:"#0f1623", borderColor:"#1a2540", color:"#475569" }}>
                    {result && i <= 4 ? "✓" : step > i ? "→" : i+1}
                  </div>
                  <span className="text-xs mt-1.5 text-center max-w-14 leading-tight"
                        style={{ color: result && i<=4 ? "#10b981" : step>i ? "#818cf8" : "#475569" }}>{n}</span>
                </div>
                {i < nodes.length-1 && (
                  <div className="h-0.5 w-7 mx-1 mb-5 rounded"
                       style={{ background: result && i<4 ? "#10b981" : step>i+1 ? "#6366f1" : "#1a2540" }} />
                )}
              </div>
            ))}
          </div>
          {result ? (
            <div className="space-y-4">
              {mode === "upload" && result.candidate?.name && (
                <div className="bg-[#080d14] rounded-xl border border-[#1a2540] p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Extracted Candidate</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                         style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                      {result.candidate.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{result.candidate.name}</p>
                      <p className="text-xs text-slate-500">{result.candidate.experience} yrs · {result.candidate.location} · ₹{result.candidate.salary_expectation} LPA</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Score", value: <span className="text-2xl font-black" style={{ color: result.score>=70?"#10b981":result.score>=50?"#f59e0b":"#ef4444" }}>{result.score}<span className="text-sm text-slate-500">/100</span></span> },
                  { label: "Decision", value: <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${result.path==="interviewer" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-red-950 text-red-300 border border-red-900"}`}>{result.path==="interviewer"?"✓ PROCEED":"✗ REJECTED"}</span> },
                  { label: "Path", value: <span className="text-xs text-slate-300 font-mono">{result.path==="interviewer"?"→ Interviewer":"→ Rejector"}</span> },
                ].map(c => (
                  <div key={c.label} className="bg-[#080d14] rounded-xl border border-[#1a2540] p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{c.label}</p>
                    {c.value}
                  </div>
                ))}
              </div>
              <div className="bg-[#080d14] rounded-xl border border-[#1a2540] p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Score Breakdown</p>
                {result.score_breakdown.map((b,i) => <p key={i} className="text-xs text-slate-400 py-0.5">· {b}</p>)}
              </div>
              <div className="bg-[#080d14] rounded-xl border border-[#1a2540] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Drafted Email</p>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => {
                      const lines = result.email_draft.split("\n")
                      const toLine = lines.find(l => l.toLowerCase().includes("to:"))
                      const subjectLine = lines.find(l => l.toLowerCase().includes("subject:"))
                      const to = toLine ? toLine.replace(/.*to:\*?\*?\s*/i, "").trim() : result.candidate?.email || ""
                      const subject = subjectLine ? subjectLine.replace(/.*subject:\*?\*?\s*/i, "").trim() : "SmartHire Update"
                      const bodyStart = lines.findIndex(l => l.toLowerCase().startsWith("dear") || l.toLowerCase().startsWith("hi "))
                      const body = bodyStart >= 0 ? lines.slice(bodyStart).join("\n") : result.email_draft
                      if (!to) { alert("Could not find email address in drafted email."); return }
                      try {
                        await axios.post(`${API}/api/send-email`, { to_email: to, subject, body })
                        alert(`✅ Email sent successfully to ${to}`)
                      } catch(e) {
                        alert("Failed to send. Check SMTP credentials in .env file.")
                      }
                    }}
                      className="flex items-center gap-1.5 text-xs text-white font-semibold
                                 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
                      📧 Send Email
                    </button>
                    <button onClick={() => { const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([result.email_draft],{type:"text/plain"})); a.download="email.txt"; a.click(); }}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      <Icon.download /> Download
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-mono bg-[#0a0f1a] rounded-lg p-3 border border-[#1a2540]">{result.email_draft}</pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600 gap-3">
              <div className="text-5xl opacity-20">⚡</div>
              <p className="text-sm">{loading ? "Pipeline running..." : "Select a candidate or upload a resume, then run"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}