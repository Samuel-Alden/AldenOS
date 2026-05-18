// os.jsx — AldenOS 2.0 shell (boot, windows, taskbar, sound, settings)
const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

/* ===================================================================
   App registry (populated by apps-core.jsx + apps-fun.jsx)
   =================================================================== */
const APPS = {};
function registerApp(def) {
  // def: { id, name, icon, glyph, defaultSize:{w,h}, minSize, onDesktop, startMenu, render: ({api}) => JSX }
  APPS[def.id] = def;
}

/* ===================================================================
   Settings — persisted to localStorage
   =================================================================== */
const SETTINGS_KEY = 'aldenos.settings.v2';
const DEFAULT_SETTINGS = {
  wallpaper: 'wp-bubbles',
  accent:    'blue',
  sound:     true,
  helper:    true,
  showIcons: true,
};
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_SETTINGS; }
}
function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

/* ===================================================================
   Sound — synthesized via WebAudio
   =================================================================== */
function createSound() {
  let ctx = null;
  let masterGain = null;
  let enabled = true;
  function ensure() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.35;
      masterGain.connect(ctx.destination);
    } catch {}
    return ctx;
  }
  function tone({ freq = 800, dur = 0.08, type = 'sine', vol = 0.25, slideTo, attack = 0.005, release = 0.06 }) {
    if (!enabled) return;
    const c = ensure(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur + release);
    osc.connect(gain).connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + dur + release + 0.05);
  }
  function noise({ dur = 0.1, vol = 0.15 }) {
    if (!enabled) return;
    const c = ensure(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    const g = c.createGain();
    g.gain.value = vol;
    src.buffer = buf;
    src.connect(g).connect(masterGain);
    src.start();
  }
  const SFX = {
    click:   () => tone({ freq: 1400, dur: 0.025, type: 'square', vol: 0.10 }),
    open:    () => { tone({ freq: 520, dur: 0.10, slideTo: 980,  type: 'triangle', vol: 0.18 }); },
    close:   () => { tone({ freq: 740, dur: 0.10, slideTo: 360,  type: 'triangle', vol: 0.18 }); },
    error:   () => {
      tone({ freq: 380, dur: 0.10, type: 'square', vol: 0.18 });
      setTimeout(() => tone({ freq: 260, dur: 0.18, type: 'square', vol: 0.18 }), 110);
    },
    chime:   () => {
      // startup arpeggio: D5, F#5, A5, D6
      const notes = [587.33, 739.99, 880.00, 1174.66];
      notes.forEach((f, i) => setTimeout(
        () => tone({ freq: f, dur: 0.30, type: 'sine', vol: 0.22, release: 0.4 }),
        i * 110
      ));
    },
    nudge:   () => { noise({ dur: 0.05, vol: 0.20 }); setTimeout(()=>noise({dur:0.05,vol:0.20}), 60); },
    msg:     () => tone({ freq: 880, dur: 0.08, type: 'sine', vol: 0.18 }),
    select:  () => tone({ freq: 1100, dur: 0.015, type: 'square', vol: 0.07 }),
    boom:    () => { noise({ dur: 0.25, vol: 0.4 }); tone({ freq: 80, dur: 0.2, type: 'sawtooth', vol: 0.25 }); },
  };
  return {
    setEnabled: (v) => { enabled = v; if (v) ensure(); },
    isEnabled:  () => enabled,
    play: (name) => { if (SFX[name]) SFX[name](); },
  };
}
const soundSystem = createSound();

/* ===================================================================
   OS Context
   =================================================================== */
const OSCtx = createContext(null);
function useOS()       { return useContext(OSCtx); }
function useSettings() { return useOS().settings; }
function useSound()    { return useOS().sound; }

/* ===================================================================
   Helpers
   =================================================================== */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function useClickOutside(ref, onOut, when = true) {
  useEffect(() => {
    if (!when) return;
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onOut(); }
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('touchstart', h);
    };
  }, [when]);
}

/* ===================================================================
   Wallpaper layer
   =================================================================== */
function Wallpaper({ kind }) {
  return (
    <>
      <div className={`wallpaper ${kind}`} key={kind} />
      <div id="flare" />
    </>
  );
}

/* ===================================================================
   Desktop icons
   =================================================================== */
function DesktopIcons({ apps, onOpen, selectedId, onSelect, mobile }) {
  // single-tap on touch opens; on desktop, single-click selects, second click opens.
  const lastTap = useRef({});

  function handle(app) {
    if (mobile) { onOpen(app.id); return; }
    if (selectedId === app.id) onOpen(app.id);
    else onSelect(app.id);
  }
  function handleDbl(app) { onOpen(app.id); }
  function handleKey(e, app) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(app.id); }
  }

  return (
    <div className="desktop-icons">
      {apps.filter(a => a.onDesktop).map(app => (
        <button key={app.id}
                className={`dsk-icon ${selectedId === app.id ? 'selected' : ''}`}
                onClick={() => handle(app)}
                onDoubleClick={() => handleDbl(app)}
                onKeyDown={(e) => handleKey(e, app)}
                aria-label={`Open ${app.name}`}>
          <div className="glyph" aria-hidden="true">{app.icon}</div>
          <div className="lbl">{app.name}</div>
        </button>
      ))}
    </div>
  );
}

/* ===================================================================
   Helper mascot (Sprocket)
   =================================================================== */
const HELPER_LINES = [
  "Welcome to AldenOS 2.0! Click an icon to begin.",
  "Hi — I'm Sprocket. Click an app icon once to select it, again to open.",
  "Tip: drag any window's title bar to move it.",
  "Tip: press Esc to close the active window.",
  "Open Settings to swap the wallpaper or mute me.",
  "There's a Minesweeper on the desktop. Just saying.",
  "Try the MSN Messenger — AldenBot is online.",
];
function Helper({ activity, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ left: 80, top: 80 });
  const [msg, setMsg] = useState(HELPER_LINES[0]);
  const idleTimer = useRef(null);
  const lastInteract = useRef(Date.now());

  // schedule re-appearance after 45s idle
  useEffect(() => {
    function schedule() {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        // only show if user is idle and no windows being used
        if (Date.now() - lastInteract.current > 40000) {
          setMsg(HELPER_LINES[Math.floor(Math.random() * HELPER_LINES.length)]);
          // pop in near top-right of stage
          const stage = document.getElementById('stage');
          if (stage) {
            const r = stage.getBoundingClientRect();
            setPos({
              left: clamp(r.width - 280, 20, r.width - 280),
              top:  clamp(r.height - 180, 80, r.height - 180),
            });
          }
          setVisible(true);
          soundSystem.play('msg');
        }
      }, 45000);
    }
    function poke() { lastInteract.current = Date.now(); schedule(); }
    poke();
    ['pointerdown', 'keydown', 'wheel'].forEach(e => window.addEventListener(e, poke, { passive: true }));
    return () => {
      clearTimeout(idleTimer.current);
      ['pointerdown', 'keydown', 'wheel'].forEach(e => window.removeEventListener(e, poke));
    };
  }, []);

  // intro after first boot
  useEffect(() => {
    const seen = sessionStorage.getItem('aldenos.helper.seen') === '1';
    if (seen) return;
    const t = setTimeout(() => {
      const stage = document.getElementById('stage');
      const r = stage.getBoundingClientRect();
      setPos({ left: r.width - 290, top: r.height - 220 });
      setMsg(HELPER_LINES[0]);
      setVisible(true);
      sessionStorage.setItem('aldenos.helper.seen', '1');
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    if (onDismiss) onDismiss();
  }

  if (!visible) return null;
  return (
    <div id="helper" style={{ left: pos.left, top: pos.top }}>
      <div className="body" onClick={() => setMsg(HELPER_LINES[Math.floor(Math.random() * HELPER_LINES.length)])}>
        <div className="face" aria-hidden="true">
          <span style={{display:'inline-block', width:44, height:44}}>{window.AldenOS.Icons.Sprocket}</span>
        </div>
      </div>
      <div className="bubble">
        {msg}
        <button className="x" onClick={dismiss} aria-label="Dismiss helper">×</button>
      </div>
    </div>
  );
}

/* ===================================================================
   Taskbar — Start, app list, tray
   =================================================================== */
function Taskbar({ openWindows, focusedId, onClick, onStartToggle, startOpen, settings, onToggleHelper }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day  = now.toLocaleDateString([], { weekday: 'short' });

  return (
    <div id="taskbar">
      <button className="start-btn" onClick={onStartToggle} aria-expanded={startOpen} aria-haspopup="menu">
        <span className="orb" aria-hidden="true"></span>
        start
      </button>
      <div className="tb-divider"></div>
      <div className="tb-apps">
        {openWindows.map(w => {
          const app = APPS[w.appId];
          return (
            <button key={w.id}
                    className={`tb-app ${focusedId === w.id ? 'active' : ''}`}
                    onClick={() => onClick(w.id)}
                    title={app.name}>
              <span className="tb-app-ico" aria-hidden="true">{app.icon}</span>
              <span className="name">{app.name}</span>
            </button>
          );
        })}
      </div>
      <div className="tray">
        {settings.helper ? (
          <button onClick={onToggleHelper}
                  title="Hide helper for this session"
                  style={{background:'transparent',border:0,color:'inherit',cursor:'pointer',padding:0,font:'inherit'}}>
            <span className="ico" aria-hidden="true">🤖</span>
          </button>
        ) : (
          <span className="ico" title="Helper hidden" style={{opacity:0.4}} aria-hidden="true">🤖</span>
        )}
        <span className="ico" aria-hidden="true">{settings.sound ? '🔊' : '🔈'}</span>
        <span className="clock" aria-label={`Time ${time}`}>{day} {time}</span>
      </div>
    </div>
  );
}

/* ===================================================================
   Start Menu
   =================================================================== */
function StartMenu({ apps, onOpen, onClose, onShutdown }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  // top items: 6 most useful + a "More" footer
  const featured = apps.filter(a => a.startMenu !== false);
  const left  = featured.slice(0, Math.ceil(featured.length / 2));
  const right = featured.slice(Math.ceil(featured.length / 2));

  return (
    <div className="start-menu" ref={ref} role="menu" aria-label="Start menu">
      <div className="sm-header">
        <div className="avatar" aria-hidden="true">👋</div>
        <div>
          <div>Samuel Alden</div>
          <div style={{fontSize:11, opacity:0.85, fontWeight:400}}>Software Student &amp; Coder</div>
        </div>
      </div>
      <div className="sm-grid">
        <div className="sm-list">
          {left.map(app => (
            <button key={app.id} className="sm-item" role="menuitem"
                    onClick={() => { onOpen(app.id); onClose(); }}>
              <span className="ico" aria-hidden="true">{app.icon}</span>
              <span>{app.name}</span>
            </button>
          ))}
        </div>
        <div className="sm-list">
          {right.map(app => (
            <button key={app.id} className="sm-item" role="menuitem"
                    onClick={() => { onOpen(app.id); onClose(); }}>
              <span className="ico" aria-hidden="true">{app.icon}</span>
              <span>{app.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sm-footer">
        <button className="btn tiny" onClick={() => { onOpen('settings'); onClose(); }}>⚙ Settings</button>
        <button className="btn tiny danger" onClick={() => { onShutdown(); onClose(); }}>⏻ Shut down…</button>
      </div>
    </div>
  );
}

/* ===================================================================
   Window frame (chrome + drag + maximize)
   =================================================================== */
const POS_KEY = 'aldenos.windowPositions.v2';
function loadPositions() {
  try { return JSON.parse(localStorage.getItem(POS_KEY)) || {}; } catch { return {}; }
}
function savePositions(p) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {}
}

function WindowFrame({ win, app, focused, onFocus, onClose, onMinimize, onMaximizeToggle, onPosChange, children }) {
  const ref = useRef(null);
  const tbRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const sizeStyle = win.maximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - var(--taskbar-h) - 14px)' }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  function startDrag(e) {
    if (win.maximized) return;
    if (e.target.closest('.tb-btn')) return;
    e.preventDefault();
    const rect = ref.current.getBoundingClientRect();
    const stage = document.getElementById('stage').getBoundingClientRect();
    setDrag({
      ox: e.clientX - rect.left + stage.left,
      oy: e.clientY - rect.top + stage.top,
      stage,
    });
    onFocus();
    try { tbRef.current.setPointerCapture(e.pointerId); } catch {}
  }
  function moveDrag(e) {
    if (!drag) return;
    const s = drag.stage;
    const nx = clamp(e.clientX - drag.ox, -win.w + 80, s.width - 40);
    const ny = clamp(e.clientY - drag.oy, 0, s.height - 60);
    onPosChange(nx, ny);
  }
  function endDrag(e) {
    if (!drag) return;
    setDrag(null);
    try { tbRef.current.releasePointerCapture(e.pointerId); } catch {}
  }

  return (
    <div ref={ref}
         className={`window ${focused ? 'active' : 'inactive'} opening`}
         style={{ ...sizeStyle, zIndex: win.z }}
         onMouseDown={onFocus}
         role="dialog"
         aria-label={app.name}>
      <div ref={tbRef}
           className="title-bar"
           onPointerDown={startDrag}
           onPointerMove={moveDrag}
           onPointerUp={endDrag}
           onPointerCancel={endDrag}
           onDoubleClick={() => onMaximizeToggle()}>
        <div className="ti">
          <span className="glyph" aria-hidden="true">{app.icon}</span>
          <span className="name">{win.title || app.name}</span>
        </div>
        <div className="tb-btns">
          <button className="tb-btn" onClick={onMinimize} aria-label="Minimize">_</button>
          <button className="tb-btn" onClick={onMaximizeToggle} aria-label="Maximize">{win.maximized ? '❐' : '□'}</button>
          <button className="tb-btn close" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
}

/* ===================================================================
   Window manager hook
   =================================================================== */
let zCounter = 100;
let cascadeCounter = 0;

function useWindowMgr() {
  const [wins, setWins] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const [hidden, setHidden] = useState({}); // id -> bool (minimized)

  const open = useCallback((appId, opts = {}) => {
    const app = APPS[appId];
    if (!app) return;
    // single-instance — if already open, focus
    setWins(prev => {
      const existing = prev.find(w => w.appId === appId);
      if (existing) {
        zCounter++;
        const updated = prev.map(w => w.id === existing.id ? { ...w, z: zCounter } : w);
        setFocusedId(existing.id);
        setHidden(h => ({ ...h, [existing.id]: false }));
        soundSystem.play('click');
        return updated;
      }
      const positions = loadPositions();
      const saved = positions[appId];
      const w0 = opts.w || app.defaultSize?.w || 520;
      const h0 = opts.h || app.defaultSize?.h || 380;
      const stage = document.getElementById('stage')?.getBoundingClientRect() || { width: 1200, height: 700 };
      const offset = (cascadeCounter++ % 6) * 28;
      const x0 = saved?.x ?? clamp(60 + offset, 0, stage.width - w0 - 40);
      const y0 = saved?.y ?? clamp(40 + offset, 0, stage.height - h0 - 80);
      zCounter++;
      const id = `${appId}-${Date.now()}`;
      const w = {
        id, appId,
        x: x0, y: y0, w: w0, h: h0,
        z: zCounter,
        maximized: false,
        title: opts.title,
        state: opts.state || null,
      };
      setFocusedId(id);
      soundSystem.play('open');
      return [...prev, w];
    });
  }, []);

  const close = useCallback((id) => {
    setWins(prev => prev.filter(w => w.id !== id));
    setHidden(h => { const { [id]:_, ...r } = h; return r; });
    soundSystem.play('close');
  }, []);

  const focus = useCallback((id) => {
    zCounter++;
    setWins(prev => prev.map(w => w.id === id ? { ...w, z: zCounter } : w));
    setFocusedId(id);
    setHidden(h => ({ ...h, [id]: false }));
  }, []);

  const minimize = useCallback((id) => {
    setHidden(h => ({ ...h, [id]: !h[id] }));
    if (focusedId === id) setFocusedId(null);
  }, [focusedId]);

  const maximizeToggle = useCallback((id) => {
    setWins(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  }, []);

  const setPos = useCallback((id, x, y) => {
    setWins(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
    // debounce save
    clearTimeout(setPos._t);
    setPos._t = setTimeout(() => {
      const positions = loadPositions();
      const cur = wins.find(w => w.id === id);
      const appId = cur?.appId;
      if (appId) {
        positions[appId] = { x, y };
        savePositions(positions);
      }
    }, 200);
  }, [wins]);

  // Esc closes focused window
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && focusedId) {
        close(focusedId);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedId, close]);

  return { wins, hidden, focusedId, open, close, focus, minimize, maximizeToggle, setPos };
}

/* ===================================================================
   Shutdown overlay
   =================================================================== */
function ShutdownOverlay({ onReboot }) {
  return (
    <div style={{
      position:'absolute', inset:0, background:'#000', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:24, color:'#e0a020',
      fontFamily:'JetBrains Mono, Consolas, monospace',
    }}>
      <div style={{textAlign:'center', maxWidth:520, lineHeight:1.6}}>
        <div style={{fontSize:18, marginBottom:18, color:'#ffd060'}}>It is now safe to turn off your computer.</div>
        <div style={{fontSize:12, color:'#888'}}>Or you can boot it back up. The choice is yours.</div>
      </div>
      <button className="btn primary" onClick={onReboot} style={{padding:'10px 24px'}}>⏻ Power on</button>
    </div>
  );
}

/* ===================================================================
   OS root
   =================================================================== */
function OS() {
  const [settings, setSettings] = useState(loadSettings);
  const [startOpen, setStartOpen] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const wm = useWindowMgr();
  const mobile = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);

  // expose sound enabled flag
  useEffect(() => {
    soundSystem.setEnabled(settings.sound);
  }, [settings.sound]);

  // settings persistence
  function updateSettings(patch) {
    setSettings(s => {
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  }

  // chime once on mount (boot complete)
  useEffect(() => {
    const t = setTimeout(() => soundSystem.play('chime'), 250);
    return () => clearTimeout(t);
  }, []);

  // first user interaction → ensure audio is unlocked
  useEffect(() => {
    function unlock() { soundSystem.play('click'); }
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // clear icon selection when clicking on the empty desktop
  function onStageClick(e) {
    if (e.target.id === 'stage' || e.target.classList.contains('wallpaper') || e.target.id === 'flare') {
      setSelectedIcon(null);
    }
  }

  const appList = useMemo(() => Object.values(APPS), []);
  const openWins = wm.wins.filter(w => !wm.hidden[w.id] || true).map(w => w); // include all so taskbar shows

  const api = {
    settings, updateSettings,
    sound: soundSystem,
    open:   wm.open,
    close:  wm.close,
    focus:  wm.focus,
    apps:   appList,
  };

  // expose open() globally so widgets can request it
  useEffect(() => {
    window.AldenOS._openApp = wm.open;
    return () => { if (window.AldenOS._openApp === wm.open) delete window.AldenOS._openApp; };
  }, [wm.open]);

  if (shutdown) {
    return (
      <OSCtx.Provider value={api}>
        <ShutdownOverlay onReboot={() => {
          sessionStorage.removeItem('aldenos.bootDone');
          location.reload();
        }} />
      </OSCtx.Provider>
    );
  }

  return (
    <OSCtx.Provider value={api}>
      {window.AldenOS.Icons.Defs}
      <Wallpaper kind={settings.wallpaper} />
      <window.AldenOS.Particles wallpaper={settings.wallpaper} />
      <div onClick={onStageClick} style={{position:'absolute', inset:0, zIndex:0}} />

      <window.AldenOS.WelcomeBanner />
      <window.AldenOS.Sidebar wallpaper={settings.wallpaper} />

      {settings.showIcons && (
        <DesktopIcons
          apps={appList}
          onOpen={wm.open}
          selectedId={selectedIcon}
          onSelect={(id) => { setSelectedIcon(id); soundSystem.play('select'); }}
          mobile={mobile}
        />
      )}

      {wm.wins.map(win => {
        const app = APPS[win.appId];
        if (!app) return null;
        const isHidden = wm.hidden[win.id];
        return (
          <div key={win.id} style={{ display: isHidden ? 'none' : 'block' }}>
            <WindowFrame
              win={win}
              app={app}
              focused={wm.focusedId === win.id}
              onFocus={() => wm.focus(win.id)}
              onClose={() => wm.close(win.id)}
              onMinimize={() => wm.minimize(win.id)}
              onMaximizeToggle={() => wm.maximizeToggle(win.id)}
              onPosChange={(x, y) => wm.setPos(win.id, x, y)}>
              {app.render({ api, win })}
            </WindowFrame>
          </div>
        );
      })}

      {settings.helper && <Helper />}

      <Taskbar
        openWindows={wm.wins}
        focusedId={wm.focusedId}
        onClick={(id) => {
          const w = wm.wins.find(w => w.id === id);
          if (!w) return;
          if (wm.hidden[id] || wm.focusedId !== id) wm.focus(id);
          else wm.minimize(id);
        }}
        onStartToggle={() => { setStartOpen(v => !v); soundSystem.play('click'); }}
        startOpen={startOpen}
        settings={settings}
        onToggleHelper={() => updateSettings({ helper: !settings.helper })}
      />

      {startOpen && (
        <StartMenu
          apps={appList}
          onOpen={wm.open}
          onClose={() => setStartOpen(false)}
          onShutdown={() => setShutdown(true)}
        />
      )}
    </OSCtx.Provider>
  );
}

/* ===================================================================
   Expose to other Babel scripts
   =================================================================== */
Object.assign(window, {
  AldenOS: {
    OS,
    APPS,
    registerApp,
    soundSystem,
    useOS, useSettings, useSound,
    clamp,
    useClickOutside,
  },
  React, useState, useEffect, useRef, useCallback, useMemo,
});
