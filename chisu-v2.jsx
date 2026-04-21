import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300;400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

  :root {
    --bg:      #0C0A08;
    --bg2:     #131009;
    --bg3:     #181410;
    --paper:   #EAE2CE;
    --paper2:  #D4C9B0;
    --red:     #A83228;
    --gold:    #B8883A;
    --muted:   #564E42;
    --line:    #1E1A14;
    --serif:   'Noto Serif SC', serif;
    --roman:   'EB Garamond', serif;
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  .root {
    font-family: var(--serif);
    background: var(--bg);
    color: var(--paper);
    height: 100vh;
    max-width: 390px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .root::after {
    content:'';
    position:fixed;
    inset:0;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events:none;
    z-index:999;
  }

  /* ── SCROLL AREA ── */
  .body {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }
  .body::-webkit-scrollbar { display: none; }
  .body { -ms-overflow-style: none; scrollbar-width: none; }

  /* ── SCREENS ── */
  .screen {
    display: none;
    flex-direction: column;
    min-height: 100%;
    animation: fadeIn .3s ease;
  }
  .screen.active { display: flex; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── BOTTOM TABS ── */
  .tabs {
    display: flex;
    border-top: 1px solid var(--line);
    background: var(--bg);
    padding: 0 8px;
    padding-bottom: env(safe-area-inset-bottom, 8px);
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }
  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 4px 8px;
    cursor: pointer;
    gap: 4px;
    background: none;
    border: none;
    color: var(--muted);
    transition: color .2s;
    font-family: var(--serif);
  }
  .tab.active { color: var(--paper); }
  .tab-icon { font-size: 16px; line-height: 1; opacity: .7; }
  .tab.active .tab-icon { opacity: 1; }
  .tab-label { font-size: 10px; letter-spacing: .06em; }
  .tab-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--red);
    opacity: 0;
    transition: opacity .2s;
  }
  .tab.active .tab-dot { opacity: 1; }

  /* ── SHARED HEADER ── */
  .page-header {
    padding: 52px 28px 20px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }
  .page-header-left {}
  .page-eyebrow {
    font-family: var(--roman);
    font-style: italic;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: .15em;
    margin-bottom: 4px;
  }
  .page-title {
    font-size: 26px;
    font-weight: 200;
    letter-spacing: .14em;
  }
  .icon-btn {
    width: 34px; height: 34px;
    border: 1px solid var(--line);
    background: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted);
    transition: border-color .2s, color .2s;
    font-size: 15px;
    flex-shrink: 0;
  }
  .icon-btn:hover { border-color: var(--muted); color: var(--paper); }

  /* back button (sub-pages) */
  .sub-header {
    padding: 52px 28px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }
  .back-btn {
    background: none; border: none;
    color: var(--muted); cursor: pointer;
    font-family: var(--serif); font-size: 12px;
    letter-spacing: .06em;
    display: flex; align-items: center; gap: 8px;
    padding: 0; transition: color .2s;
  }
  .back-btn:hover { color: var(--paper); }
  .back-line {
    width: 18px; height: 1px;
    background: currentColor;
    position: relative;
  }
  .back-line::before {
    content:'';
    position:absolute; left:0; top:-3px;
    width:6px; height:6px;
    border-left:1px solid currentColor;
    border-bottom:1px solid currentColor;
    transform:rotate(45deg);
  }

  /* ── 今日 TAB ── */
  .home-hero {
    padding: 28px 28px 0;
  }
  .home-date {
    font-family: var(--roman);
    font-style: italic;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: .12em;
    margin-bottom: 8px;
  }
  .home-name {
    font-size: 52px;
    font-weight: 200;
    letter-spacing: .24em;
    line-height: 1;
    margin-bottom: 10px;
  }
  .home-tagline {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: .06em;
    line-height: 1.8;
    font-weight: 300;
  }
  .home-rule {
    margin: 24px 28px;
    height: 1px;
    background: var(--line);
    position: relative;
  }
  .home-rule::before {
    content:'';
    position:absolute; left:0; top:0;
    width:28px; height:1px;
    background: var(--red);
  }
  .home-section { padding: 0 28px 24px; }
  .home-section-label {
    font-family: var(--roman);
    font-style: italic;
    font-size: 10px;
    color: var(--gold);
    letter-spacing: .18em;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .home-section-label::after {
    content:''; flex:1; height:1px; background: var(--line);
  }
  .today-q-card {
    border: 1px solid var(--line);
    border-left: 2px solid var(--red);
    background: var(--bg2);
    padding: 18px 20px;
    cursor: pointer;
    transition: border-color .2s, transform .15s;
    margin-bottom: 16px;
  }
  .today-q-card:active { transform: scale(.99); }
  .today-q-text {
    font-size: 15px; font-weight: 300;
    line-height: 1.65; margin-bottom: 12px;
  }
  .today-q-foot {
    font-family: var(--roman); font-style: italic;
    font-size: 11px; color: var(--muted);
    display: flex; justify-content: space-between;
  }
  .streak-row {
    display: flex; gap: 8px; margin-top: 4px;
  }
  .streak-chip {
    border: 1px solid var(--line);
    padding: 10px 14px; flex: 1;
  }
  .streak-chip-num {
    font-family: var(--roman);
    font-size: 28px; color: var(--paper);
    opacity: .5; line-height: 1;
  }
  .streak-chip-label {
    font-size: 10px; color: var(--muted);
    letter-spacing: .06em; margin-top: 4px;
  }

  /* ── 随笔 TAB ── */
  .entries { padding: 0 28px; }
  .entry {
    display: flex; gap: 16px;
    padding: 18px 0;
    border-bottom: 1px solid var(--line);
    cursor: pointer; transition: opacity .15s;
  }
  .entry:hover { opacity: .6; }
  .entry-date {
    font-family: var(--roman); font-style: italic;
    font-size: 10px; color: var(--muted);
    min-width: 24px; padding-top: 2px; line-height: 1.8;
  }
  .entry-title {
    font-size: 14px; font-weight: 300;
    letter-spacing: .04em; margin-bottom: 5px;
  }
  .entry-preview {
    font-size: 12px; color: var(--muted);
    line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .fab {
    position: fixed;
    bottom: 80px; right: 50%;
    transform: translateX(calc(195px - 28px - 26px));
    width: 52px; height: 52px;
    background: var(--red); border: none;
    cursor: pointer; color: var(--paper);
    font-size: 22px;
    display: flex; align-items: center; justify-content: center;
    transition: opacity .2s, transform .2s;
    z-index: 20;
  }
  .fab:hover { opacity: .85; }

  /* ── 致未来 TAB ── */
  .future-intro {
    padding: 28px 28px 24px;
    border-bottom: 1px solid var(--line);
    text-align: center;
  }
  .future-intro-icon { font-size: 32px; margin-bottom: 10px; opacity: .5; }
  .future-intro-title {
    font-size: 20px; font-weight: 200;
    letter-spacing: .1em; margin-bottom: 6px;
  }
  .future-intro-sub {
    font-size: 11px; color: var(--muted);
    letter-spacing: .06em; line-height: 1.8;
  }
  .letters { padding: 20px 28px; display: flex; flex-direction: column; gap: 12px; }
  .letter-card {
    border: 1px solid var(--line);
    padding: 16px; cursor: pointer;
    transition: border-color .2s;
  }
  .letter-card:hover { border-color: var(--muted); }
  .letter-top {
    display: flex; justify-content: space-between;
    margin-bottom: 10px;
  }
  .letter-to {
    font-family: var(--roman); font-style: italic;
    font-size: 11px; color: var(--gold); letter-spacing: .1em;
  }
  .letter-when {
    font-family: var(--roman); font-size: 10px;
    color: var(--muted); letter-spacing: .08em;
  }
  .letter-preview {
    font-size: 13px; color: var(--paper);
    opacity: .75; line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── 邮箱 TAB ── */
  .mailbox-items { padding: 0 28px; }
  .mail-item {
    display: flex; gap: 14px;
    padding: 18px 0;
    border-bottom: 1px solid var(--line);
    cursor: pointer; transition: opacity .15s;
    align-items: flex-start;
  }
  .mail-item:hover { opacity: .6; }
  .mail-dot {
    width: 6px; height: 6px;
    border-radius: 50%; background: var(--red);
    margin-top: 6px; flex-shrink: 0;
    transition: opacity .2s;
  }
  .mail-dot.read { background: var(--line); }
  .mail-from {
    font-family: var(--roman); font-style: italic;
    font-size: 10px; color: var(--gold);
    letter-spacing: .1em; margin-bottom: 5px;
  }
  .mail-subject {
    font-size: 14px; font-weight: 300;
    margin-bottom: 5px; letter-spacing: .03em;
  }
  .mail-preview {
    font-size: 12px; color: var(--muted);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .mail-date {
    font-family: var(--roman);
    font-size: 10px; color: var(--muted);
    margin-left: auto; flex-shrink: 0;
    padding-top: 2px;
  }

  /* ── CALENDAR PAGE ── */
  .cal-month-nav {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--line);
  }
  .cal-month-label {
    font-family: var(--roman);
    font-size: 18px; letter-spacing: .1em;
  }
  .cal-nav-btn {
    background: none; border: none;
    color: var(--muted); cursor: pointer;
    font-size: 16px; padding: 4px 8px;
    transition: color .2s;
  }
  .cal-nav-btn:hover { color: var(--paper); }
  .cal-grid { padding: 16px 20px 20px; }
  .cal-weekdays {
    display: grid; grid-template-columns: repeat(7, 1fr);
    margin-bottom: 8px;
  }
  .cal-wd {
    text-align: center;
    font-family: var(--roman); font-size: 10px;
    color: var(--muted); letter-spacing: .08em;
    padding: 4px 0;
  }
  .cal-days {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .cal-day {
    aspect-ratio: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    cursor: default;
    position: relative;
    border-radius: 0;
  }
  .cal-day.has-entry { cursor: pointer; }
  .cal-day.has-entry:hover .cal-day-num { color: var(--paper); }
  .cal-day-num {
    font-family: var(--roman);
    font-size: 13px;
    color: var(--muted);
    transition: color .15s;
  }
  .cal-day.has-entry .cal-day-num { color: var(--paper2); }
  .cal-day.today .cal-day-num {
    color: var(--bg);
    background: var(--paper);
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
  }
  .cal-day.selected .cal-day-num {
    color: var(--bg);
    background: var(--gold);
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
  }
  .cal-day-dot {
    width: 3px; height: 3px;
    border-radius: 50%; background: var(--red);
    position: absolute; bottom: 4px;
    opacity: 0;
  }
  .cal-day.has-entry .cal-day-dot { opacity: 1; }
  .cal-day.empty .cal-day-num { opacity: 0; pointer-events: none; }

  .cal-entry-preview {
    margin: 0 28px;
    border: 1px solid var(--line);
    border-left: 2px solid var(--gold);
    background: var(--bg2);
    padding: 18px 20px;
    animation: fadeIn .25s ease;
  }
  .cep-date {
    font-family: var(--roman); font-style: italic;
    font-size: 10px; color: var(--gold);
    letter-spacing: .15em; margin-bottom: 10px;
  }
  .cep-title {
    font-size: 15px; font-weight: 300;
    margin-bottom: 8px; letter-spacing: .04em;
  }
  .cep-body {
    font-size: 13px; color: var(--paper);
    opacity: .8; line-height: 1.75;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cep-more {
    margin-top: 12px;
    font-family: var(--roman); font-style: italic;
    font-size: 11px; color: var(--muted);
    letter-spacing: .1em;
  }
`;

/* ── DATA ── */
const ENTRIES = [
  { date:"20", title:"关于那段沉默", preview:"有些话我们都知道，但选择用沉默来保护彼此。那个下午坐在河边，什么也没说，反而说了一切。", full:"有些话我们都知道，但选择用沉默来保护彼此。那个下午坐在河边，什么也没说，反而说了一切。\n\n我后来想，沉默有时候比语言更诚实。语言会选择，会修饰，会顾及。但沉默是直接的，它就是那个此刻的全部。" },
  { date:"18", title:"早晨的光", preview:"阳光从窗帘缝隙里漏进来，照在书脊上。我意识到很久没有这样安静地待着了。", full:"阳光从窗帘缝隙里漏进来，照在书脊上。我意识到很久没有这样安静地待着了。\n\n不看手机，不想今天要做的事，只是坐着，看光慢慢移动。那种感觉像是被允许存在。" },
  { date:"15", title:"一个决定", preview:"终于决定不去了。不是因为懦弱，而是因为我终于学会了区分「应该」和「想要」。", full:"终于决定不去了。不是因为懦弱，而是因为我终于学会了区分「应该」和「想要」。\n\n说不是一种能力。我花了很长时间才明白这件事。" },
  { date:"11", title:"重读旧信", preview:"翻到三年前写给自己的信，才发现那时候担心的事，现在早就不重要了。", full:"翻到三年前写给自己的信，才发现那时候担心的事，现在早就不重要了。\n\n不知道是解脱，还是又有点难过。那时候的自己那么认真地担心着那些事。" },
];

const LETTERS = [
  { to:"致一年后的自己", when:"2027.04.20 开封", preview:"如果你还记得今天，记得你是在什么心情下写下这封信的……" },
  { to:"致五年后的自己", when:"2031.04.20 开封", preview:"我不知道那时候的世界会变成什么样，但我希望你还保有现在这种好奇心……" },
];

const MAILS = [
  { from:"来自 2025.04.20 的你", subject:"你好，一年后的自己", preview:"那时候你刚换了工作，还在适应新环境……", date:"04.20", read: false },
  { from:"来自 2024.10.05 的你", subject:"秋天的某个下午", preview:"窗外在下雨，我在想你现在过得怎么样……", date:"10.05", read: true },
  { from:"来自 2024.01.01 的你", subject:"新年第一天", preview:"希望你还记得今天许下的那个愿望……", date:"01.01", read: true },
];

// Dates in April that have entries
const ENTRY_DATES = { 20: ENTRIES[0], 18: ENTRIES[1], 15: ENTRIES[2], 11: ENTRIES[3], 8: { date:"08", title:"一场梦", preview:"梦到了很久没联系的人。醒来之后想发消息，但最终还是没有。", full:"梦到了很久没联系的人。醒来之后想发消息，但最终还是没有。\n\n有些联系一旦断了，就让它留在梦里吧。" }, 3: { date:"03", title:"清明", preview:"扫墓回来，在路边买了一束野花。不知道为谁买的，就觉得应该买。", full:"扫墓回来，在路边买了一束野花。不知道为谁买的，就觉得应该买。\n\n有时候人会做一些自己也解释不清楚的事。那也没关系。" } };

const WEEKDAYS = ["日","一","二","三","四","五","六"];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ChiSu() {
  const [tab, setTab] = useState("home");
  const [subScreen, setSubScreen] = useState(null); // 'calendar' | 'entry'
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);

  const calCells = buildCalendar(2026, 4);

  const go = (s) => setSubScreen(s);
  const goBack = () => { setSubScreen(null); setSelectedDay(null); };

  const handleDayClick = (d) => {
    if (!ENTRY_DATES[d]) return;
    setSelectedDay(d);
  };

  const openEntry = (entry) => {
    setViewingEntry(entry);
    go("entry");
  };

  return (
    <div className="root">
      <style>{css}</style>

      <div className="body">

        {/* ══ SUB-SCREEN: CALENDAR ══ */}
        {subScreen === "calendar" && (
          <div className="screen active">
            <div className="sub-header">
              <button className="back-btn" onClick={goBack}>
                <div className="back-line"/>邮箱
              </button>
              <span style={{fontFamily:"var(--roman)",fontStyle:"italic",fontSize:12,color:"var(--muted)",marginLeft:"auto",letterSpacing:".1em"}}>日历视图</span>
            </div>
            <div className="cal-month-nav">
              <button className="cal-nav-btn">‹</button>
              <div className="cal-month-label">2026 · 四月</div>
              <button className="cal-nav-btn">›</button>
            </div>
            <div className="cal-grid">
              <div className="cal-weekdays">
                {WEEKDAYS.map(w => <div key={w} className="cal-wd">{w}</div>)}
              </div>
              <div className="cal-days">
                {calCells.map((d, i) => (
                  <div
                    key={i}
                    className={`cal-day ${!d ? "empty" : ""} ${d && ENTRY_DATES[d] ? "has-entry" : ""} ${d === 20 ? "today" : ""} ${d === selectedDay ? "selected" : ""}`}
                    onClick={() => d && handleDayClick(d)}
                  >
                    <span className="cal-day-num">{d || ""}</span>
                    <div className="cal-day-dot"/>
                  </div>
                ))}
              </div>
            </div>

            {selectedDay && ENTRY_DATES[selectedDay] && (
              <div
                className="cal-entry-preview"
                onClick={() => openEntry(ENTRY_DATES[selectedDay])}
              >
                <div className="cep-date">2026 · 04 · {String(selectedDay).padStart(2,"0")}</div>
                <div className="cep-title">{ENTRY_DATES[selectedDay].title}</div>
                <div className="cep-body">{ENTRY_DATES[selectedDay].preview}</div>
                <div className="cep-more">点击阅读全文 →</div>
              </div>
            )}

            {!selectedDay && (
              <div style={{padding:"12px 28px"}}>
                <div style={{fontFamily:"var(--roman)",fontStyle:"italic",fontSize:11,color:"var(--muted)",letterSpacing:".1em",textAlign:"center"}}>
                  点击有记录的日期查看内容
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SUB-SCREEN: ENTRY DETAIL ══ */}
        {subScreen === "entry" && viewingEntry && (
          <div className="screen active">
            <div className="sub-header">
              <button className="back-btn" onClick={() => go("calendar")}>
                <div className="back-line"/>日历
              </button>
            </div>
            <div style={{padding:"28px 28px 60px"}}>
              <div style={{fontFamily:"var(--roman)",fontStyle:"italic",fontSize:10,color:"var(--gold)",letterSpacing:".18em",marginBottom:16}}>
                2026 · 04 · {viewingEntry.date}
              </div>
              <div style={{fontSize:22,fontWeight:200,letterSpacing:".1em",marginBottom:20,lineHeight:1.3}}>
                {viewingEntry.title}
              </div>
              <div style={{width:28,height:1,background:"var(--red)",marginBottom:24,opacity:.7}}/>
              <div style={{fontSize:15,lineHeight:2,color:"var(--paper)",opacity:.9,whiteSpace:"pre-line",fontWeight:300}}>
                {viewingEntry.full}
              </div>
            </div>
          </div>
        )}

        {/* ══ MAIN TABS (hidden when sub-screen active) ══ */}
        {!subScreen && (
          <>
            {/* 今日 */}
            <div className={`screen ${tab==="home" ? "active" : ""}`}>
              <div className="home-hero">
                <div style={{paddingTop:52}}>
                  <div className="home-date">二〇二六年四月二十日 · 星期一</div>
                  <div className="home-name">尺&nbsp;&nbsp;素</div>
                  <div className="home-tagline">把外界的纷乱关在门外<br/>很高兴遇见你。</div>
                </div>
              </div>
              <div className="home-rule"/>
              <div className="home-section">
                <div className="home-section-label">今日一问 · 五分钟档案馆</div>
                <div className="today-q-card">
                  <div className="today-q-text">你生命中哪一段沉默，其实说了很多？</div>
                  <div className="today-q-foot">
                    <span>点击作答</span>
                    <span>第 147 天</span>
                  </div>
                </div>
                <div className="streak-row">
                  <div className="streak-chip">
                    <div className="streak-chip-num">147</div>
                    <div className="streak-chip-label">连续书写天数</div>
                  </div>
                  <div className="streak-chip">
                    <div className="streak-chip-num">312</div>
                    <div className="streak-chip-label">归档记忆总数</div>
                  </div>
                  <div className="streak-chip">
                    <div className="streak-chip-num">2</div>
                    <div className="streak-chip-label">待开封信件</div>
                  </div>
                </div>
              </div>
              <div className="home-section">
                <div className="home-section-label">最近随笔</div>
                {ENTRIES.slice(0,2).map((e,i) => (
                  <div className="entry" key={i} onClick={() => openEntry(e)}>
                    <div className="entry-date">{e.date}</div>
                    <div>
                      <div className="entry-title">{e.title}</div>
                      <div className="entry-preview">{e.preview}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 随笔 */}
            <div className={`screen ${tab==="notes" ? "active" : ""}`}>
              <div className="page-header">
                <div>
                  <div className="page-eyebrow">April 2026</div>
                  <div className="page-title">随 笔</div>
                </div>
              </div>
              <div className="entries" style={{paddingBottom:80}}>
                {ENTRIES.map((e,i) => (
                  <div className="entry" key={i} onClick={() => openEntry(e)}>
                    <div className="entry-date">{e.date}<br/><span style={{fontSize:9,opacity:.6}}>04</span></div>
                    <div>
                      <div className="entry-title">{e.title}</div>
                      <div className="entry-preview">{e.preview}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="fab">✦</button>
            </div>

            {/* 致未来 */}
            <div className={`screen ${tab==="future" ? "active" : ""}`}>
              <div className="page-header">
                <div>
                  <div className="page-eyebrow">Letters to Future Self</div>
                  <div className="page-title">致未来</div>
                </div>
              </div>
              <div className="future-intro">
                <div className="future-intro-icon">✉</div>
                <div className="future-intro-title">写给以后的你</div>
                <div className="future-intro-sub">信件将在你指定的日期<br/>悄悄出现在邮箱里</div>
              </div>
              <div className="letters">
                {LETTERS.map((l,i) => (
                  <div className="letter-card" key={i}>
                    <div className="letter-top">
                      <span className="letter-to">{l.to}</span>
                      <span className="letter-when">{l.when}</span>
                    </div>
                    <div className="letter-preview">{l.preview}</div>
                  </div>
                ))}
              </div>
              <button className="fab" style={{fontSize:14}}>写一封</button>
            </div>

            {/* 邮箱 */}
            <div className={`screen ${tab==="mailbox" ? "active" : ""}`}>
              <div className="page-header">
                <div>
                  <div className="page-eyebrow">Mailbox</div>
                  <div className="page-title">邮 箱</div>
                </div>
                <button className="icon-btn" onClick={() => go("calendar")}>
                  ▦
                </button>
              </div>
              <div className="mailbox-items">
                {MAILS.map((m,i) => (
                  <div className="mail-item" key={i}>
                    <div className={`mail-dot ${m.read ? "read" : ""}`}/>
                    <div style={{flex:1}}>
                      <div className="mail-from">{m.from}</div>
                      <div className="mail-subject">{m.subject}</div>
                      <div className="mail-preview">{m.preview}</div>
                    </div>
                    <div className="mail-date">{m.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── BOTTOM TABS (hide during sub-screens) ── */}
      {!subScreen && (
        <div className="tabs">
          {[
            { id:"home",    icon:"◎", label:"今日" },
            { id:"notes",   icon:"✒", label:"随笔" },
            { id:"future",  icon:"✉", label:"致未来" },
            { id:"mailbox", icon:"◫", label:"邮箱" },
          ].map(t => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <div className="tab-icon">{t.icon}</div>
              <div className="tab-label">{t.label}</div>
              <div className="tab-dot"/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
