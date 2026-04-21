import { useState, useEffect, useRef } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&family=Noto+Serif+SC:wght@300;400;600&display=swap');

  :root {
    --bg: #141210;
    --surface: #1C1915;
    --paper: #F0E8D5;
    --paper-dark: #E2D8C0;
    --ink: #1E1A14;
    --ink-light: #3D3526;
    --gold: #C9963C;
    --gold-dim: #8A6828;
    --muted: #6B5E48;
    --red-stamp: #8B2020;
    --font-display: 'Cormorant Garamond', serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --font-cjk: 'Noto Serif SC', serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .app {
    background: var(--bg);
    min-height: 100vh;
    max-width: 390px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    font-family: var(--font-cjk);
    color: var(--paper);
  }

  /* grain overlay */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 100;
    opacity: 0.6;
  }

  /* ── PAGE TRANSITIONS ── */
  .page {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.4,0,0.2,1);
  }
  .page.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateX(24px);
  }
  .page.visible {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── HEADER ── */
  .header {
    padding: 52px 24px 20px;
    border-bottom: 1px solid #2A2520;
    position: relative;
  }
  .header-eyebrow {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--gold-dim);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .header-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 300;
    font-style: italic;
    color: var(--paper);
    line-height: 1.1;
  }
  .header-sub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    margin-top: 4px;
    letter-spacing: 0.1em;
  }

  /* archive number badge */
  .archive-badge {
    position: absolute;
    top: 52px;
    right: 24px;
    text-align: right;
  }
  .archive-badge-num {
    font-family: var(--font-display);
    font-size: 42px;
    font-weight: 600;
    color: var(--gold);
    line-height: 1;
    opacity: 0.9;
  }
  .archive-badge-label {
    font-family: var(--font-mono);
    font-size: 8px;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* ── TODAY CARD ── */
  .today-section {
    padding: 20px 24px;
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--gold-dim);
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #2A2520;
  }

  .today-card {
    background: var(--paper);
    padding: 20px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .today-card:active { transform: scale(0.99); }

  .today-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(0,0,0,0.06) 27px,
      rgba(0,0,0,0.06) 28px
    );
    pointer-events: none;
  }

  .card-date {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.15em;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .stamp {
    font-family: var(--font-mono);
    font-size: 8px;
    color: var(--red-stamp);
    border: 1px solid var(--red-stamp);
    padding: 2px 6px;
    letter-spacing: 0.1em;
    opacity: 0.8;
    transform: rotate(-2deg);
    display: inline-block;
  }
  .card-question {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 400;
    color: var(--ink);
    line-height: 1.35;
    font-style: italic;
    margin-bottom: 16px;
  }
  .card-cta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--ink-light);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .cta-arrow {
    width: 24px;
    height: 1px;
    background: var(--ink-light);
    position: relative;
    transition: width 0.2s ease;
  }
  .today-card:hover .cta-arrow { width: 32px; }
  .cta-arrow::after {
    content: '';
    position: absolute;
    right: 0;
    top: -3px;
    width: 6px;
    height: 6px;
    border-right: 1px solid var(--ink-light);
    border-top: 1px solid var(--ink-light);
    transform: rotate(45deg);
  }

  /* already answered state */
  .answered-tag {
    background: var(--gold);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.15em;
    padding: 3px 8px;
    text-transform: uppercase;
  }

  /* ── MEMORY PEEK (一年前) ── */
  .memory-section {
    padding: 0 24px 20px;
  }
  .memory-card {
    border: 1px solid #2A2520;
    padding: 16px;
    position: relative;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }
  .memory-card:hover { border-color: var(--gold-dim); }
  .memory-year-line {
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    height: 2px;
    background: var(--gold);
    opacity: 0.4;
  }
  .memory-date {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--gold-dim);
    letter-spacing: 0.15em;
    margin-bottom: 8px;
    margin-top: 4px;
  }
  .memory-question {
    font-family: var(--font-display);
    font-size: 13px;
    font-style: italic;
    color: var(--muted);
    margin-bottom: 8px;
    line-height: 1.4;
  }
  .memory-answer {
    font-size: 13px;
    color: var(--paper);
    line-height: 1.6;
    opacity: 0.85;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── ARCHIVE LIST ── */
  .archive-section {
    padding: 0 24px 100px;
  }
  .archive-item {
    display: flex;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid #1E1B17;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .archive-item:hover { opacity: 0.7; }
  .archive-item-date {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.1em;
    min-width: 36px;
    padding-top: 2px;
    line-height: 1.6;
  }
  .archive-item-content { flex: 1; }
  .archive-item-q {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .archive-item-a {
    font-size: 13px;
    color: var(--paper);
    opacity: 0.75;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 390px;
    background: linear-gradient(transparent, var(--bg) 40%);
    padding: 24px 24px 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }
  .nav-btn {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--muted);
    text-transform: uppercase;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 0;
    transition: color 0.2s ease;
  }
  .nav-btn.active { color: var(--gold); }
  .nav-btn:hover { color: var(--paper); }

  /* ── WRITE PAGE ── */
  .write-header {
    padding: 52px 24px 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .back-btn {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    transition: color 0.2s;
  }
  .back-btn:hover { color: var(--paper); }
  .back-arrow {
    width: 20px;
    height: 1px;
    background: currentColor;
    position: relative;
  }
  .back-arrow::before {
    content: '';
    position: absolute;
    left: 0;
    top: -3px;
    width: 6px;
    height: 6px;
    border-left: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: rotate(45deg);
  }

  .write-body {
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .write-date-row {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.15em;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
  }
  .write-question {
    font-family: var(--font-display);
    font-size: 26px;
    font-style: italic;
    font-weight: 300;
    color: var(--paper);
    line-height: 1.3;
    margin-bottom: 28px;
  }
  .divider {
    width: 40px;
    height: 1px;
    background: var(--gold);
    margin-bottom: 28px;
    opacity: 0.6;
  }
  .write-area {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--paper);
    font-family: var(--font-cjk);
    font-size: 16px;
    line-height: 1.8;
    resize: none;
    min-height: 200px;
    caret-color: var(--gold);
  }
  .write-area::placeholder { color: var(--muted); font-style: italic; }
  .write-footer {
    padding: 16px 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .char-count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }
  .submit-btn {
    background: var(--gold);
    color: var(--ink);
    border: none;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 12px 24px;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  .submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .submit-btn:not(:disabled):hover { opacity: 0.85; }

  /* ── MEMORY DETAIL PAGE ── */
  .memory-detail {
    padding: 52px 24px 100px;
    flex: 1;
  }
  .memory-detail-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }
  .memory-detail-date {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--gold-dim);
    letter-spacing: 0.15em;
    line-height: 1.8;
  }
  .memory-detail-stamp {
    font-family: var(--font-mono);
    font-size: 8px;
    color: var(--red-stamp);
    border: 1px solid var(--red-stamp);
    padding: 3px 8px;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }
  .memory-detail-q {
    font-family: var(--font-display);
    font-size: 22px;
    font-style: italic;
    color: var(--muted);
    line-height: 1.35;
    margin-bottom: 20px;
  }
  .memory-detail-sep {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .sep-line { flex: 1; height: 1px; background: #2A2520; }
  .sep-label {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .memory-detail-text {
    font-size: 16px;
    line-height: 1.9;
    color: var(--paper);
    opacity: 0.9;
  }

  /* success animation */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.5s ease forwards; }

  @keyframes stampIn {
    0% { opacity: 0; transform: rotate(-8deg) scale(1.3); }
    60% { opacity: 1; transform: rotate(2deg) scale(0.95); }
    100% { opacity: 0.8; transform: rotate(-2deg) scale(1); }
  }
  .stamp-anim { animation: stampIn 0.6s cubic-bezier(0.2,0,0,1) forwards; }

  .success-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    text-align: center;
    gap: 24px;
  }
  .success-stamp {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--red-stamp);
    border: 2px solid var(--red-stamp);
    padding: 8px 20px;
    letter-spacing: 0.2em;
    opacity: 0;
  }
  .success-title {
    font-family: var(--font-display);
    font-size: 32px;
    font-style: italic;
    color: var(--paper);
    opacity: 0;
    animation-delay: 0.4s;
  }
  .success-sub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.15em;
    line-height: 1.8;
    opacity: 0;
    animation-delay: 0.6s;
  }
  .success-back {
    margin-top: 24px;
    background: none;
    border: 1px solid #2A2520;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 12px 32px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    opacity: 0;
    animation-delay: 0.8s;
  }
  .success-back:hover { border-color: var(--gold-dim); color: var(--paper); }
`;

const mockEntries = [
  {
    id: 1,
    date: "2024-04-20",
    dateDisplay: "04.20",
    yearDisplay: "2024",
    question: "如果今天是你人生中的最后一天，你会最想见谁？",
    answer: "我会想见我妈妈。不是为了说再见，而是想再坐在她旁边，什么都不用说，就那样待着。有些陪伴是语言无法替代的。",
  },
  {
    id: 2,
    date: "2024-04-19",
    dateDisplay: "04.19",
    yearDisplay: "2024",
    question: "最近什么事情让你感到出乎意料的快乐？",
    answer: "早上等地铁的时候，旁边的小孩突然对着空气大笑。我也跟着笑了。那一刻觉得世界很轻盈。",
  },
  {
    id: 3,
    date: "2024-04-18",
    dateDisplay: "04.18",
    yearDisplay: "2024",
    question: "你现在最想丢掉的一种习惯是什么？",
    answer: "在决定做一件事之前习惯性地问自己『值不值得』。有时候生活不需要这么算得清楚。",
  },
  {
    id: 4,
    date: "2024-04-17",
    dateDisplay: "04.17",
    yearDisplay: "2024",
    question: "你上一次真正全身心投入做一件事是什么时候？",
    answer: "上周末在画素描，画了三个小时，手机都忘记看了。那种感觉像是消失了一会儿。",
  },
];

const todayQuestion = "你生命中哪一段沉默，其实说了很多？";
const yearAgoEntry = mockEntries[0];
const todayDate = "2025.04.20";

export default function ArchiveApp() {
  const [view, setView] = useState("main"); // main | write | memory | success
  const [answer, setAnswer] = useState("");
  const [todayAnswered, setTodayAnswered] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (view === "write" && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [view]);

  const handleSubmit = () => {
    if (answer.trim().length < 5) return;
    setTodayAnswered(true);
    setView("success");
  };

  const openMemory = (entry) => {
    setSelectedEntry(entry);
    setView("memory");
  };

  return (
    <div className="app">
      <style>{style}</style>

      {/* ── MAIN PAGE ── */}
      <div className={`page ${view === "main" ? "visible" : "hidden"}`}>
        <div className="header">
          <div className="header-eyebrow">私人档案馆 · Archive</div>
          <div className="header-title">五分钟<br/>档案馆</div>
          <div className="header-sub">每日一问 · 归档记忆</div>
          <div className="archive-badge">
            <div className="archive-badge-num">{mockEntries.length + (todayAnswered ? 1 : 0)}</div>
            <div className="archive-badge-label">条记忆</div>
          </div>
        </div>

        {/* Today's question */}
        <div className="today-section">
          <div className="section-label">今日档案 · {todayDate}</div>
          <div className="today-card" onClick={() => !todayAnswered && setView("write")}>
            <div className="card-date">
              <span>NO.{String(mockEntries.length + 1).padStart(4, "0")}</span>
              {todayAnswered
                ? <span className="answered-tag">已归档</span>
                : <span className="stamp">PENDING</span>}
            </div>
            <div className="card-question">「{todayQuestion}」</div>
            {!todayAnswered && (
              <div className="card-cta">
                <span>写下今天的答案</span>
                <div className="cta-arrow" />
              </div>
            )}
            {todayAnswered && (
              <div className="card-cta">
                <span style={{ color: "var(--gold-dim)" }}>已在 {todayDate} 归档</span>
              </div>
            )}
          </div>
        </div>

        {/* 一年前的今天 */}
        <div className="memory-section">
          <div className="section-label">一年前的今天</div>
          <div className="memory-card" onClick={() => openMemory(yearAgoEntry)}>
            <div className="memory-year-line" />
            <div className="memory-date">2024.04.20 · NO.{String(yearAgoEntry.id).padStart(4, "0")}</div>
            <div className="memory-question">「{yearAgoEntry.question}」</div>
            <div className="memory-answer">{yearAgoEntry.answer}</div>
          </div>
        </div>

        {/* Archive list */}
        <div className="archive-section">
          <div className="section-label">往期档案</div>
          {mockEntries.slice(1).map((entry) => (
            <div key={entry.id} className="archive-item" onClick={() => openMemory(entry)}>
              <div className="archive-item-date">
                {entry.dateDisplay}<br />
                <span style={{ color: "var(--muted)", fontSize: "8px" }}>{entry.yearDisplay}</span>
              </div>
              <div className="archive-item-content">
                <div className="archive-item-q">「{entry.question}」</div>
                <div className="archive-item-a">{entry.answer}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bottom-nav">
          <button className="nav-btn active">档案馆</button>
          <button className="nav-btn" style={{ fontFamily: "var(--font-mono)", fontSize: "18px", color: "var(--gold)", letterSpacing: 0 }} onClick={() => setView("write")}>✦</button>
          <button className="nav-btn">统计</button>
        </div>
      </div>

      {/* ── WRITE PAGE ── */}
      <div className={`page ${view === "write" ? "visible" : "hidden"}`} style={{ background: "var(--bg)" }}>
        <div className="write-header">
          <button className="back-btn" onClick={() => setView("main")}>
            <div className="back-arrow" />
            返回
          </button>
        </div>
        <div className="write-body">
          <div className="write-date-row">
            <span>{todayDate}</span>
            <span>NO.{String(mockEntries.length + 1).padStart(4, "0")}</span>
          </div>
          <div className="write-question">「{todayQuestion}」</div>
          <div className="divider" />
          <textarea
            ref={textareaRef}
            className="write-area"
            placeholder="写下此刻的答案……"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={500}
          />
        </div>
        <div className="write-footer">
          <div className="char-count">{answer.length} / 500</div>
          <button
            className="submit-btn"
            disabled={answer.trim().length < 5}
            onClick={handleSubmit}
          >
            归档
          </button>
        </div>
      </div>

      {/* ── SUCCESS PAGE ── */}
      <div className={`page ${view === "success" ? "visible" : "hidden"}`}>
        <div className="success-screen">
          <div className="success-stamp stamp-anim" style={{ opacity: view === "success" ? undefined : 0 }}>
            ARCHIVED · {todayDate}
          </div>
          <div className="success-title fade-up">已归档。</div>
          <div className="success-sub fade-up">
            一年后的今天<br />
            你会再次遇见此刻的自己
          </div>
          <button className="success-back fade-up" onClick={() => setView("main")}>
            回到档案馆
          </button>
        </div>
      </div>

      {/* ── MEMORY DETAIL PAGE ── */}
      <div className={`page ${view === "memory" ? "visible" : "hidden"}`}>
        <div style={{ padding: "52px 24px 0" }}>
          <button className="back-btn" onClick={() => setView("main")}>
            <div className="back-arrow" />
            返回
          </button>
        </div>
        {selectedEntry && (
          <div className="memory-detail">
            <div className="memory-detail-top">
              <div className="memory-detail-date">
                {selectedEntry.yearDisplay}.{selectedEntry.dateDisplay}<br />
                <span style={{ color: "var(--gold-dim)" }}>
                  NO.{String(selectedEntry.id).padStart(4, "0")}
                </span>
              </div>
              <div className="memory-detail-stamp">ARCHIVED</div>
            </div>
            <div className="memory-detail-q">「{selectedEntry.question}」</div>
            <div className="memory-detail-sep">
              <div className="sep-line" />
              <div className="sep-label">你的回答</div>
              <div className="sep-line" />
            </div>
            <div className="memory-detail-text">{selectedEntry.answer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
