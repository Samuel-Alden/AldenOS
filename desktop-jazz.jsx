// desktop-jazz.jsx — particles, welcome banner, widget sidebar
const { useState: dsS, useEffect: dsE, useRef: dsR, useMemo: dsM } = React;

/* ===================================================================
   Floating bubble particles
   =================================================================== */
function Particles({ wallpaper }) {
  const bubbles = dsM(() => {
    // generate once — count + distribution
    const N = 18;
    return Array.from({ length: N }, (_, i) => {
      const size = 24 + Math.random() * 80;        // 24–104 px
      const left = Math.random() * 100;            // 0–100%
      const dur  = 14 + Math.random() * 16;        // 14–30s
      const delay = -Math.random() * dur;          // randomize start so they don't all sync
      const drift = (Math.random() - 0.5) * 160;   // -80..80 px horizontal drift
      const glyph = '01アイウエオカキクケコサシスセソタチツテト'.charAt(Math.floor(Math.random()*22));
      return { id: i, size, left, dur, delay, drift, glyph };
    });
  }, []);
  return (
    <div id="particles" aria-hidden="true">
      {bubbles.map(b => (
        <span key={b.id} className="bub" style={{
          width: b.size, height: b.size,
          left: `${b.left}%`,
          '--dur': `${b.dur}s`,
          '--delay': `${b.delay}s`,
          '--drift': `${b.drift}px`,
        }}>{wallpaper === 'wp-crt' ? b.glyph : ''}</span>
      ))}
    </div>
  );
}

/* ===================================================================
   Welcome banner — time-aware greeting
   =================================================================== */
function WelcomeBanner() {
  const [now, setNow] = dsS(new Date());
  dsE(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours();
  const greet =
    h < 5  ? 'Still up,' :
    h < 12 ? 'Good morning,' :
    h < 17 ? 'Good afternoon,' :
    h < 21 ? 'Good evening,' : 'Late night,';
  const face = h < 5 ? '🌙' : h < 12 ? '☀️' : h < 17 ? '🌤️' : h < 21 ? '🌅' : '✨';
  return (
    <div className="welcome-banner" role="banner">
      <div className="face" aria-hidden="true">{face}</div>
      <div>
        <div className="greet">{greet} <span className="name">Samuel</span></div>
        <div className="sub">Welcome back to AldenOS 2.0</div>
      </div>
    </div>
  );
}

/* ===================================================================
   Analog clock widget
   =================================================================== */
function ClockWidget() {
  const [now, setNow] = dsS(new Date());
  dsE(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourAng = (h + m / 60) * 30;
  const minAng  = (m + s / 60) * 6;
  const secAng  = s * 6;
  return (
    <div className="widget w-clock">
      <div className="head"><span className="dot" />Time</div>
      <svg viewBox="0 0 100 100" aria-label="Analog clock">
        <defs>
          <radialGradient id="face" cx="35%" cy="30%" r="80%">
            <stop offset="0%"  stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e9f3ff" />
            <stop offset="100%" stopColor="#b5d0ee" />
          </radialGradient>
          <radialGradient id="bezel" cx="35%" cy="30%" r="75%">
            <stop offset="0%"  stopColor="#ffffff" />
            <stop offset="55%" stopColor="#a8c2dc" />
            <stop offset="100%" stopColor="#5a7895" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bezel)" />
        <circle cx="50" cy="50" r="42" fill="url(#face)" stroke="rgba(0,30,80,0.2)" strokeWidth="0.5" />
        {/* tick marks */}
        {Array.from({length:12}, (_,i) => {
          const a = i * 30 * Math.PI / 180;
          const r1 = 38, r2 = i % 3 === 0 ? 32 : 35;
          return <line key={i}
            x1={50 + r1 * Math.sin(a)} y1={50 - r1 * Math.cos(a)}
            x2={50 + r2 * Math.sin(a)} y2={50 - r2 * Math.cos(a)}
            stroke="#1a3055" strokeWidth={i % 3 === 0 ? 1.5 : 0.6} strokeLinecap="round" />;
        })}
        {/* hour hand */}
        <line x1="50" y1="50"
          x2={50 + 22 * Math.sin(hourAng * Math.PI/180)}
          y2={50 - 22 * Math.cos(hourAng * Math.PI/180)}
          stroke="#0c2a55" strokeWidth="3.2" strokeLinecap="round" />
        {/* minute hand */}
        <line x1="50" y1="50"
          x2={50 + 30 * Math.sin(minAng * Math.PI/180)}
          y2={50 - 30 * Math.cos(minAng * Math.PI/180)}
          stroke="#1a3055" strokeWidth="2.2" strokeLinecap="round" />
        {/* second hand */}
        <line x1="50" y1="50"
          x2={50 + 33 * Math.sin(secAng * Math.PI/180)}
          y2={50 - 33 * Math.cos(secAng * Math.PI/180)}
          stroke="#e64646" strokeWidth="1" strokeLinecap="round" />
        <circle cx="50" cy="50" r="2.6" fill="#0c2a55" />
        <circle cx="50" cy="50" r="1" fill="#e64646" />
        {/* glossy highlight overlay */}
        <ellipse cx="38" cy="32" rx="22" ry="12" fill="rgba(255,255,255,0.45)" />
      </svg>
      <div className="digital">{now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      <div className="date">{now.toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'})}</div>
    </div>
  );
}

/* ===================================================================
   Calendar widget
   =================================================================== */
function CalendarWidget() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = now.getDate();
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();

  const cells = [];
  // previous-month tail
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, mute: true });
  // this month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, mute: false, today: d === today });
  // next-month head — fill to 42 cells (6 weeks)
  let next = 1;
  while (cells.length < 42) cells.push({ d: next++, mute: true });

  const monthName = now.toLocaleDateString([], { month: 'long', year: 'numeric' });
  return (
    <div className="widget w-cal">
      <div className="head"><span className="dot" />{monthName}</div>
      <div className="cal-grid">
        {['S','M','T','W','T','F','S'].map((c, i) => <div key={i} className="dow">{c}</div>)}
        {cells.map((c, i) => (
          <div key={i} className={`day ${c.mute ? 'mute' : ''} ${c.today ? 'today' : ''}`}>{c.d}</div>
        ))}
      </div>
    </div>
  );
}

/* ===================================================================
   Weather widget (fake but seeded)
   =================================================================== */
const WEATHER_BY_WALLPAPER = {
  'wp-bubbles': { temp: 28, desc: 'Sunny • Bubbles',      ico: 'sun' },
  'wp-bliss':   { temp: 24, desc: 'Partly cloudy',         ico: 'sun' },
  'wp-aqua':    { temp: 30, desc: 'Warm • Light breeze',   ico: 'sun' },
  'wp-crt':     { temp: 18, desc: 'Cool • Phosphor',       ico: 'crt' },
};
function WeatherWidget({ wallpaper }) {
  const w = WEATHER_BY_WALLPAPER[wallpaper] || WEATHER_BY_WALLPAPER['wp-bubbles'];
  const forecast = [
    { lbl: 'Wed', ico: '☀️', t: w.temp },
    { lbl: 'Thu', ico: '⛅', t: w.temp - 2 },
    { lbl: 'Fri', ico: '🌧️', t: w.temp - 5 },
    { lbl: 'Sat', ico: '☀️', t: w.temp - 1 },
  ];
  return (
    <div className="widget w-weather">
      <div className="head"><span className="dot" />Balikpapan</div>
      <div className="row1">
        {w.ico === 'crt'
          ? <div className="sun" style={{background:'radial-gradient(circle at 30% 28%, #fff 0%, #b8ffd0 30%, #00ff66 70%, #007a30 100%)', boxShadow:'0 0 18px rgba(0,255,102,0.6), inset 0 -8px 14px rgba(0,80,30,0.4)'}} />
          : <div className="sun" />}
        <div>
          <div className="temp">{w.temp}°<span style={{fontSize:14, fontWeight:600, color:'#3a5680'}}>C</span></div>
          <div className="desc">{w.desc}</div>
        </div>
      </div>
      <div className="forecast">
        {forecast.map(f => (
          <div key={f.lbl} className="col">
            <span className="lbl">{f.lbl}</span>
            <span className="ico" aria-hidden="true">{f.ico}</span>
            <span className="t">{f.t}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================================================================
   Sticky note (editable, persisted)
   =================================================================== */
const STICKY_KEY = 'aldenos.sticky.v1';
function StickyWidget() {
  const [text, setText] = dsS(() => localStorage.getItem(STICKY_KEY) || "buy more pixels 🛒\ncrochet practice 4pm\nstart a band ✨");
  const ref = dsR(null);

  function commit() {
    const v = ref.current?.innerText || '';
    setText(v);
    try { localStorage.setItem(STICKY_KEY, v); } catch {}
  }

  return (
    <div className="widget w-sticky">
      <span className="pin" aria-hidden="true" />
      <div className="head">Sticky Note</div>
      <div className="note"
           ref={ref}
           contentEditable
           suppressContentEditableWarning
           onBlur={commit}
           spellCheck={false}>
        {text}
      </div>
    </div>
  );
}

/* ===================================================================
   Now Playing — listens to global NowPlaying channel
   =================================================================== */
const NowPlaying = (function() {
  const subs = new Set();
  let state = { title: '—', artist: '—', playing: false, t: 0, len: 0, idx: 0 };
  return {
    set(patch) {
      state = { ...state, ...patch };
      subs.forEach(fn => fn(state));
    },
    get: () => state,
    subscribe(fn) { subs.add(fn); fn(state); return () => subs.delete(fn); },
    request(action) {
      // ensure music app is mounted so it can receive the event
      if (window.AldenOS && window.AldenOS._openApp) window.AldenOS._openApp('music');
      // give it a tick to mount its listener
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('aldenos:np-control', { detail: { action } }));
      }, 30);
    },
  };
})();
window.AldenOS.NowPlaying = NowPlaying;

function NowPlayingWidget() {
  const [s, setS] = dsS(NowPlaying.get());
  const [bars, setBars] = dsS(() => Array.from({length: 12}, () => 4));
  dsE(() => NowPlaying.subscribe(setS), []);
  dsE(() => {
    if (!s.playing) { setBars(b => b.map(() => 2)); return; }
    const id = setInterval(() => {
      setBars(Array.from({length: 12}, () => 2 + Math.floor(Math.random() * 12)));
    }, 110);
    return () => clearInterval(id);
  }, [s.playing]);

  function openMusic() {
    if (window.AldenOS && window.AldenOS._openApp) window.AldenOS._openApp('music');
  }

  return (
    <div className="widget w-np">
      <div className="head"><span className="dot" />Now Playing</div>
      <div className="row1">
        <div className="cover" aria-hidden="true" />
        <div className="info">
          <div className="title">{s.title}</div>
          <div className="artist">{s.artist}</div>
        </div>
      </div>
      <div className="miniviz" aria-hidden="true">
        {bars.map((h, i) => <i key={i} style={{height: h + 'px'}} />)}
      </div>
      <div className="ctrl">
        <button onClick={() => NowPlaying.request('prev')} title="Previous">⏮</button>
        <button className="play" onClick={() => NowPlaying.request('toggle')} title={s.playing ? 'Pause' : 'Play'}>
          {s.playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => NowPlaying.request('next')} title="Next">⏭</button>
        <button onClick={openMusic} title="Open music player" style={{marginLeft:4}}>↗</button>
      </div>
    </div>
  );
}

/* ===================================================================
   System stats — fake CPU/RAM/Net
   =================================================================== */
function StatsWidget() {
  const [cpu, setCpu] = dsS(22);
  const [ram, setRam] = dsS(58);
  const [net, setNet] = dsS(34);
  dsE(() => {
    const id = setInterval(() => {
      setCpu(v => Math.max(8,  Math.min(95, v + (Math.random() - 0.5) * 18)));
      setRam(v => Math.max(35, Math.min(85, v + (Math.random() - 0.5) * 6)));
      setNet(v => Math.max(2,  Math.min(99, v + (Math.random() - 0.5) * 30)));
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="widget w-stats">
      <div className="head"><span className="dot" />System</div>
      <div className="stat"><span className="lbl">⚙ CPU</span><span>{Math.round(cpu)}%</span></div>
      <div className="bar"><i style={{width: cpu + '%'}} /></div>
      <div className="stat"><span className="lbl">🧠 RAM</span><span>{Math.round(ram)}%</span></div>
      <div className="bar"><i style={{width: ram + '%'}} /></div>
      <div className="stat"><span className="lbl">📡 Net</span><span>{Math.round(net)} kbps</span></div>
      <div className="bar"><i style={{width: net + '%'}} /></div>
    </div>
  );
}

/* ===================================================================
   Sidebar — collapsible stack
   =================================================================== */
function Sidebar({ wallpaper }) {
  const [collapsed, setCollapsed] = dsS(false);
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Desktop widgets">
      <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Show widgets' : 'Hide widgets'}>
        {collapsed ? '◀' : '▶'}
      </button>
      {!collapsed && (
        <>
          <ClockWidget />
          <WeatherWidget wallpaper={wallpaper} />
          <NowPlayingWidget />
          <CalendarWidget />
          <StickyWidget />
          <StatsWidget />
        </>
      )}
    </div>
  );
}

Object.assign(window.AldenOS, {
  Particles, WelcomeBanner, Sidebar, NowPlaying,
});
