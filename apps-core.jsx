// apps-core.jsx — Bio, Notepad, Paint, My Computer, Settings, Internet Explorer
const { registerApp, useOS } = window.AldenOS;
const { useState, useEffect, useRef, useMemo } = React;

/* ===================================================================
   BIO
   =================================================================== */
function BioApp() {
  const [reveal, setReveal] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setReveal(r => r + 1), 120);
    return () => clearInterval(t);
  }, []);
  const skills = [
    { name: 'HTML / CSS',    pct: 92, c: '#ff8c2a' },
    { name: 'JavaScript',    pct: 80, c: '#ffce4a' },
    { name: 'Python',        pct: 70, c: '#5cd6a6' },
    { name: 'UI / UX',       pct: 65, c: '#ff7ab8' },
    { name: 'Roblox Lua',    pct: 75, c: '#1a8cff' },
  ];
  return (
    <div className="app-pad" style={{padding:16, background:'linear-gradient(180deg, rgba(255,255,255,0.65), rgba(220,235,250,0.45))'}}>
      <div style={{display:'flex', gap:16, alignItems:'center', marginBottom:14}}>
        <div style={{
          width:78, height:78, borderRadius:'50%', flex:'0 0 auto',
          background:'radial-gradient(circle at 32% 28%, #fff 0%, #ffe1b6 25%, #ff9a3a 65%, #b25510 100%)',
          boxShadow:'inset 0 -10px 18px rgba(0,30,80,0.25), 0 6px 16px rgba(0,30,80,0.3)',
          display:'grid', placeItems:'center', fontSize:38,
        }}>👋</div>
        <div>
          <div style={{fontSize:20, fontWeight:700, color:'#0c2a55'}}>Samuel Alden A.S</div>
          <div style={{fontSize:13, color:'#3a5680'}}>Software Student • Web &amp; Game Developer</div>
          <div style={{marginTop:6, display:'flex', gap:6, flexWrap:'wrap'}}>
            <span className="chip">📍 Balikpapan, Indonesia</span>
            <span className="chip">🎓 Airlangga VHS</span>
          </div>
        </div>
      </div>

      <div className="bubble-card" style={{marginBottom:12}}>
        <div style={{fontSize:11, fontWeight:600, color:'#3a5680', letterSpacing:0.6, textTransform:'uppercase', marginBottom:8}}>Skills</div>
        <div style={{display:'grid', gap:8}}>
          {skills.map((s, i) => (
            <div key={s.name}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3, color:'#1a2a44'}}>
                <span style={{fontWeight:500}}>{s.name}</span>
                <span style={{color:'#4a5e80'}}>{s.pct}%</span>
              </div>
              <div className="progress">
                <i style={{
                  width: Math.min(reveal * 12, s.pct) + '%',
                  background: `linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.2) 50%, transparent), linear-gradient(90deg, ${s.c}, ${s.c}aa)`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        <div className="bubble-card">
          <div style={{fontSize:11, fontWeight:600, color:'#3a5680', letterSpacing:0.6, textTransform:'uppercase', marginBottom:8}}>Hobbies</div>
          <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
            <span className="chip">🧶 Crocheting</span>
            <span className="chip">💃 Dancing</span>
            <span className="chip">🎤 Singing</span>
            <span className="chip">📚 Reading</span>
          </div>
        </div>
        <div className="bubble-card" style={{background:'linear-gradient(180deg, rgba(92,182,255,0.25), rgba(92,214,166,0.18))'}}>
          <div style={{fontSize:11, fontWeight:600, color:'#3a5680', letterSpacing:0.6, textTransform:'uppercase', marginBottom:6}}>Motto</div>
          <div style={{fontStyle:'italic', fontSize:13, color:'#0c2a55', lineHeight:1.4}}>
            "Make it simple, but make it cool."
          </div>
        </div>
      </div>
    </div>
  );
}
registerApp({
  id: 'bio',
  name: 'My Bio',
  icon: window.AldenOS.Icons.Person,
  defaultSize: { w: 520, h: 460 },
  onDesktop: true,
  render: () => <BioApp />,
});

/* ===================================================================
   NOTEPAD
   =================================================================== */
const NOTEPAD_KEY = 'aldenos.notes.v2';
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTEPAD_KEY)) || ''; } catch { return ''; }
}
function NotepadApp() {
  const [text, setText] = useState(loadNotes);
  const [status, setStatus] = useState('');
  const stTimer = useRef(null);

  function flash(msg) {
    setStatus(msg);
    clearTimeout(stTimer.current);
    stTimer.current = setTimeout(() => setStatus(''), 1600);
  }

  function save() {
    localStorage.setItem(NOTEPAD_KEY, text);
    flash(`Saved at ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ✓`);
  }
  function clear() {
    if (text && !confirm('Clear the note?')) return;
    setText('');
    localStorage.removeItem(NOTEPAD_KEY);
    flash('Cleared');
  }

  // auto-save on blur
  function onBlur() {
    localStorage.setItem(NOTEPAD_KEY, text);
    flash('Auto-saved');
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <>
      <div className="menu-bar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>
      <div style={{padding:'8px 10px', display:'flex', gap:6, background:'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.25))', borderBottom:'1px solid rgba(0,30,80,0.12)'}}>
        <button className="btn tiny primary" onClick={save}>💾 Save</button>
        <button className="btn tiny" onClick={clear}>🗑 Clear</button>
        <button className="btn tiny" onClick={() => {
          const blob = new Blob([text], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'aldenos-note.txt';
          a.click();
        }}>⤓ Export</button>
        <div style={{marginLeft:'auto', fontSize:11, color:'#3a5680'}}>{status}</div>
      </div>
      <div style={{padding:10, flex:1, minHeight:0, display:'flex'}}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
          placeholder="Type something…"
          style={{
            flex:1, resize:'none',
            background:'linear-gradient(180deg, #fffef8 0%, #fff 30%)',
            border:'1px solid rgba(0,30,80,0.25)',
            borderRadius:6, padding:10,
            fontFamily:"'Segoe UI', system-ui, sans-serif",
            fontSize:13, lineHeight:1.5,
            color:'#1a2a44',
            boxShadow:'inset 0 1px 3px rgba(0,30,80,0.15)',
            outline:'none',
          }} />
      </div>
      <div className="status-bar">
        <span>{words} word{words === 1 ? '' : 's'}</span>
        <span style={{opacity:0.5}}>•</span>
        <span>{text.length} character{text.length === 1 ? '' : 's'}</span>
        <span style={{marginLeft:'auto'}}>Plain text</span>
      </div>
    </>
  );
}
registerApp({
  id: 'notepad',
  name: 'Notepad',
  icon: window.AldenOS.Icons.Note,
  defaultSize: { w: 480, h: 380 },
  onDesktop: true,
  render: () => <NotepadApp />,
});

/* ===================================================================
   PAINT
   =================================================================== */
const PAINT_KEY = 'aldenos.paint.v2';
const SWATCHES = ['#000000', '#ffffff', '#e64646', '#ff8c2a', '#ffce4a', '#5cd6a6', '#1a8cff', '#6b3fa0', '#ff7ab8', '#8a3a1a'];

function PaintApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState('#1a8cff');
  const [size, setSize] = useState(6);
  const [tool, setTool] = useState('brush'); // brush | eraser
  const drawing = useRef(false);
  const last = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctxRef.current = ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    // restore
    const saved = localStorage.getItem(PAINT_KEY);
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
  }, []);

  function pointer(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvasRef.current.width / r.width),
             y: (e.clientY - r.top)  * (canvasRef.current.height / r.height) };
  }
  function down(e) {
    e.preventDefault();
    drawing.current = true;
    last.current = pointer(e);
    stroke(last.current, last.current);
  }
  function move(e) {
    if (!drawing.current) return;
    const p = pointer(e);
    stroke(last.current, p);
    last.current = p;
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    saveSnapshot();
  }
  function stroke(a, b) {
    const ctx = ctxRef.current;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  function saveSnapshot() {
    try {
      const data = canvasRef.current.toDataURL('image/png');
      localStorage.setItem(PAINT_KEY, data);
    } catch {}
  }
  function clear() {
    const ctx = ctxRef.current;
    const c = canvasRef.current;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    saveSnapshot();
  }
  function download() {
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = 'aldenos-paint.png';
    a.click();
  }

  return (
    <>
      <div className="paint-toolbar">
        <button className={`btn tiny ${tool==='brush'?'primary':''}`} onClick={() => setTool('brush')} title="Brush">✏</button>
        <button className={`btn tiny ${tool==='eraser'?'primary':''}`} onClick={() => setTool('eraser')} title="Eraser">⌫</button>
        <span style={{display:'flex', gap:3, alignItems:'center', marginLeft:6}}>
          {SWATCHES.map(s => (
            <button key={s}
                    className={`swatch ${color===s ? 'active' : ''}`}
                    style={{background:s}}
                    onClick={() => setColor(s)}
                    aria-label={`Color ${s}`} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
                 style={{width:24, height:22, border:'1px solid rgba(0,30,80,0.35)', borderRadius:4, padding:0, marginLeft:2, background:'#fff'}} />
        </span>
        <span style={{display:'flex', alignItems:'center', gap:6, marginLeft:8}}>
          <span style={{fontSize:11, color:'#3a5680'}}>Size</span>
          <input className="range" type="range" min="1" max="30" value={size} onChange={e => setSize(+e.target.value)} style={{width:90}}/>
          <span style={{fontSize:11, width:18, color:'#3a5680'}}>{size}</span>
        </span>
        <span style={{marginLeft:'auto', display:'flex', gap:4}}>
          <button className="btn tiny" onClick={download} title="Download as PNG">⤓ Save</button>
          <button className="btn tiny danger" onClick={clear} title="Clear canvas">🗑</button>
        </span>
      </div>
      <div style={{flex:1, minHeight:0, padding:10, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'linear-gradient(180deg, rgba(255,255,255,0.25), rgba(180,210,235,0.15))'}}>
        <canvas
          ref={canvasRef}
          width={520} height={340}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          style={{
            background:'#fff',
            borderRadius:6,
            border:'1px solid rgba(0,30,80,0.3)',
            boxShadow:'0 6px 16px rgba(0,30,80,0.2), inset 0 0 0 1px rgba(255,255,255,0.6)',
            touchAction:'none',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
            maxWidth:'100%', maxHeight:'100%',
          }}
        />
      </div>
    </>
  );
}
registerApp({
  id: 'paint',
  name: 'PaintPad',
  icon: window.AldenOS.Icons.Palette,
  defaultSize: { w: 580, h: 440 },
  onDesktop: true,
  render: () => <PaintApp />,
});

/* ===================================================================
   MY COMPUTER — File Explorer
   =================================================================== */
function FilesApp() {
  const { open } = useOS();
  const I = window.AldenOS.Icons;
  const [folder, setFolder] = useState('desktop');
  const folders = [
    { id: 'desktop',   name: 'Desktop',     icon: I.Folder },
    { id: 'documents', name: 'Documents',   icon: I.Folder },
    { id: 'pictures',  name: 'Pictures',    icon: I.Folder },
    { id: 'music',     name: 'Music',       icon: I.Folder },
    { id: 'about',     name: 'About Me',    icon: I.Folder },
    { id: 'trash',     name: 'Recycle Bin', icon: I.Trash },
  ];

  const contents = {
    desktop: [
      { id: 'bio', name: 'My Bio',   icon: I.Person, open: () => open('bio') },
      { id: 'notepad', name: 'Notepad', icon: I.Note, open: () => open('notepad') },
      { id: 'paint', name: 'PaintPad', icon: I.Palette, open: () => open('paint') },
      { id: 'music', name: 'Music',    icon: I.Music, open: () => open('music') },
      { id: 'mine',  name: 'Minesweeper', icon: I.Clover, open: () => open('mines') },
      { id: 'snake', name: 'Snake',   icon: I.Snake, open: () => open('snake') },
      { id: 'msn',   name: 'Messenger', icon: I.Chat, open: () => open('msn') },
      { id: 'ie',    name: 'Internet', icon: I.Globe, open: () => open('ie') },
    ],
    documents: [
      { id: 'note1', name: 'todo.txt',   icon: I.File, open: () => open('notepad') },
      { id: 'note2', name: 'README.txt', icon: I.File, open: () => open('notepad') },
      { id: 'cv',    name: 'resume.doc', icon: I.Doc,  open: () => open('bio') },
    ],
    pictures: [
      { id: 'p1', name: 'wallpaper.bmp', icon: I.Image },
      { id: 'p2', name: 'self.jpg',     icon: I.Image },
      { id: 'p3', name: 'painting.png', icon: I.Palette, open: () => open('paint') },
    ],
    music: [
      { id: 'm1', name: 'HUNTRIX — GOLDEN.mp3', icon: I.Music, open: () => open('music') },
      { id: 'm2', name: 'startup-chime.wav',    icon: I.Bell },
      { id: 'm3', name: 'modem-handshake.wav',  icon: I.Antenna },
    ],
    about: [
      { id: 'a1', name: 'bio.card', icon: I.Person, open: () => open('bio') },
      { id: 'a2', name: 'guestbook.htm', icon: I.HTM, open: () => open('ie') },
    ],
    trash: [],
  };

  const items = contents[folder] || [];
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="menu-bar">
        <span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>G</u>o</span><span><u>H</u>elp</span>
      </div>
      <div style={{padding:'6px 10px', background:'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.30))',
                    borderBottom:'1px solid rgba(0,30,80,0.12)', display:'flex', alignItems:'center', gap:6}}>
        <button className="btn tiny" onClick={() => setFolder('desktop')}>← Back</button>
        <span style={{flex:1, padding:'4px 8px', background:'#fff', border:'1px solid rgba(0,30,80,0.25)', borderRadius:5, fontSize:12, fontFamily:'Consolas, monospace'}}>
          C:\AldenOS\{folder === 'desktop' ? 'Desktop' : folder.charAt(0).toUpperCase()+folder.slice(1)}
        </span>
      </div>
      <div className="split" style={{flex:1, minHeight:0}}>
        <div className="left">
          <div style={{fontSize:11, fontWeight:600, color:'#3a5680', textTransform:'uppercase', letterSpacing:0.5, padding:'4px 8px 6px'}}>Folders</div>
          {folders.map(f => (
            <div key={f.id}
                 className={`tree-item ${folder === f.id ? 'active' : ''}`}
                 onClick={() => { setFolder(f.id); setSelected(null); }}>
              <span style={{fontSize:14}} aria-hidden="true">{f.icon}</span>
              <span>{f.name}</span>
            </div>
          ))}
        </div>
        <div className="right">
          {items.length === 0 ? (
            <div style={{textAlign:'center', padding:40, color:'#6e7e90'}}>
              <div style={{fontSize:48, marginBottom:8}}>{folder === 'trash' ? '🗑' : '📂'}</div>
              <div>This folder is empty.</div>
            </div>
          ) : (
            <div className="tile-grid">
              {items.map(it => (
                <button key={it.id}
                        className={`tile ${selected === it.id ? 'selected' : ''}`}
                        onClick={() => setSelected(it.id)}
                        onDoubleClick={() => it.open && it.open()}
                        style={{border:0, font:'inherit'}}>
                  <span className="ico" aria-hidden="true">{it.icon}</span>
                  <span>{it.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="status-bar">
        <span>{items.length} item{items.length === 1 ? '' : 's'}</span>
        <span style={{marginLeft:'auto'}}>Free space: 28.4 GB</span>
      </div>
    </>
  );
}
registerApp({
  id: 'files',
  name: 'My Computer',
  icon: window.AldenOS.Icons.Folder,
  defaultSize: { w: 620, h: 440 },
  onDesktop: true,
  render: () => <FilesApp />,
});

/* ===================================================================
   SETTINGS
   =================================================================== */
function SettingsApp() {
  const { settings, updateSettings, sound } = useOS();
  const wallpapers = [
    { id: 'wp-bubbles', name: 'Bubble Sky',     style: { background: 'linear-gradient(180deg, #b6dffd, #ffd6ed)' } },
    { id: 'wp-bliss',   name: 'Bliss',          style: { background: 'linear-gradient(180deg, #2a72e0 0%, #6db9ff 50%, #5fb84a 90%)' } },
    { id: 'wp-aqua',    name: 'Aqua',           style: { background: 'linear-gradient(135deg, #0a5fb8, #5cd6a6)' } },
    { id: 'wp-crt',     name: 'CRT Phosphor',   style: { background: '#0a2a0a' } },
  ];
  return (
    <div className="app-pad" style={{maxWidth:560}}>
      <div style={{fontSize:18, fontWeight:700, color:'#0c2a55', marginBottom:4}}>Settings</div>
      <div style={{fontSize:12, color:'#4a5e80', marginBottom:14}}>Make AldenOS yours. Choices are saved between visits.</div>

      <div className="bubble-card" style={{marginBottom:12}}>
        <div className="setting-row">
          <div>
            <div className="name">Wallpaper</div>
            <div className="desc">Choose the desktop background.</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8, marginTop:6, flexWrap:'wrap'}}>
          {wallpapers.map(w => (
            <div key={w.id} style={{textAlign:'center'}}>
              <div
                className={`wp-thumb ${settings.wallpaper === w.id ? 'active' : ''}`}
                style={w.style}
                onClick={() => { updateSettings({ wallpaper: w.id }); sound.play('click'); }}
                role="button"
                aria-label={`Wallpaper ${w.name}`}
              />
              <div style={{fontSize:11, marginTop:3, color:'#3a5680'}}>{w.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bubble-card" style={{marginBottom:12}}>
        <div className="setting-row">
          <div>
            <div className="name">Sound effects</div>
            <div className="desc">Click, open/close, and startup chime.</div>
          </div>
          <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <input type="checkbox" checked={settings.sound} onChange={e => updateSettings({ sound: e.target.checked })} />
            <span style={{fontSize:12}}>{settings.sound ? 'On' : 'Off'}</span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <div className="name">Helper (Sprocket)</div>
            <div className="desc">The friendly bubble that offers tips when you're idle.</div>
          </div>
          <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <input type="checkbox" checked={settings.helper} onChange={e => updateSettings({ helper: e.target.checked })} />
            <span style={{fontSize:12}}>{settings.helper ? 'On' : 'Off'}</span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <div className="name">Show desktop icons</div>
            <div className="desc">Hide them for a cleaner screenshot.</div>
          </div>
          <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <input type="checkbox" checked={settings.showIcons} onChange={e => updateSettings({ showIcons: e.target.checked })} />
            <span style={{fontSize:12}}>{settings.showIcons ? 'Shown' : 'Hidden'}</span>
          </label>
        </div>
      </div>

      <div className="bubble-card">
        <div className="setting-row">
          <div>
            <div className="name">Reset window positions</div>
            <div className="desc">All windows will reopen at the default cascade.</div>
          </div>
          <button className="btn tiny" onClick={() => {
            localStorage.removeItem('aldenos.windowPositions.v2');
            sound.play('click');
          }}>Reset</button>
        </div>
        <div className="setting-row">
          <div>
            <div className="name">Test sounds</div>
            <div className="desc">Quick way to hear what's available.</div>
          </div>
          <div style={{display:'flex', gap:4}}>
            <button className="btn tiny" onClick={() => sound.play('chime')}>🔔 Chime</button>
            <button className="btn tiny" onClick={() => sound.play('open')}>✦ Open</button>
            <button className="btn tiny" onClick={() => sound.play('error')}>⚠ Error</button>
          </div>
        </div>
      </div>
    </div>
  );
}
registerApp({
  id: 'settings',
  name: 'Settings',
  icon: window.AldenOS.Icons.Gear,
  defaultSize: { w: 600, h: 540 },
  onDesktop: false,
  render: () => <SettingsApp />,
});

/* ===================================================================
   INTERNET EXPLORER — fake browser with web ring
   =================================================================== */
const IE_PAGES = ['home', 'webring', 'guestbook', 'about'];
function IEApp() {
  const [page, setPage] = useState('home');
  const [url, setUrl] = useState('alden://home');
  const [hits] = useState(() => 1138 + Math.floor(Math.random() * 200));

  function go(p) {
    setPage(p);
    setUrl(`alden://${p}`);
  }

  return (
    <>
      <div className="ie-chrome" style={{display:'flex', gap:6, alignItems:'center'}}>
        <button className="btn tiny" onClick={() => go('home')}>◀</button>
        <button className="btn tiny" disabled>▶</button>
        <button className="btn tiny" onClick={() => go(page)}>↻</button>
        <button className="btn tiny" onClick={() => go('home')}>🏠</button>
        <input className="input" value={url} onChange={(e)=>setUrl(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') {
                 const slug = url.replace(/^alden:\/\//,'').toLowerCase();
                 if (IE_PAGES.includes(slug)) go(slug);
               }}}
               style={{flex:1, fontFamily:'Consolas, monospace'}} />
      </div>
      <div className="ie-tabs">
        {[
          ['home','🏠 Home'],
          ['webring','💍 Web Ring'],
          ['guestbook','📓 Guestbook'],
          ['about','ℹ About'],
        ].map(([id, label]) => (
          <button key={id}
                  className={`ie-tab ${page === id ? 'active' : ''}`}
                  onClick={() => go(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="ie-page">
        {page === 'home'      && <IEHome hits={hits} go={go} />}
        {page === 'webring'   && <IEWebRing />}
        {page === 'guestbook' && <IEGuestbook />}
        {page === 'about'     && <IEAbout />}
      </div>
      <div className="status-bar">
        <span>🔒 Connected</span>
        <span style={{opacity:0.5}}>•</span>
        <span>{url}</span>
        <span style={{marginLeft:'auto'}}>56K modem</span>
      </div>
    </>
  );
}
function IEHome({ hits, go }) {
  return (
    <div>
      <h1>★ Welcome to AldenWeb ★</h1>
      <div className="marquee" style={{margin:'12px 0', padding:'4px 0', background:'linear-gradient(90deg, #ff7ab8, #ffce4a, #5cd6a6, #1a8cff)', color:'#fff', fontWeight:600, textShadow:'0 1px 0 rgba(0,0,0,0.3)'}}>
        <span>✦ Best viewed at 800×600 ✦ Powered by AldenOS 2.0 ✦ This site is under construction — forever ✦ Free hit counter included ✦ Sign the guestbook! ✦ </span>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 200px', gap:14, marginTop:12}}>
        <div>
          <p style={{lineHeight:1.6}}>Hi there! You've stumbled upon my little corner of the web.
          Click around — there are some games, a paint program, and a real chat with my bot friend.
          If you stick around, please <a href="#" onClick={(e)=>{e.preventDefault();go('guestbook');}}>sign the guestbook</a>.</p>
          <p style={{marginTop:8, lineHeight:1.6}}>This page is part of the <a href="#" onClick={(e)=>{e.preventDefault();go('webring');}}>Y2K Web Ring</a> — a curated loop of sites that miss the old internet.</p>
          <div style={{marginTop:12, padding:10, border:'2px dashed #ff8c2a', background:'#fffbe8', borderRadius:8}}>
            <b>🚧 Under Construction 🚧</b><br/>
            More pages coming when I feel like it. Check back any decade.
          </div>
        </div>
        <aside>
          <div className="bubble-card" style={{padding:10}}>
            <div style={{fontSize:11, fontWeight:600, color:'#3a5680', textTransform:'uppercase', letterSpacing:0.5}}>Visitors</div>
            <div style={{fontFamily:'Consolas, monospace', fontSize:22, color:'#1a8cff', textAlign:'center', padding:'8px 0', letterSpacing:2,
                          background:'#08203a', color:'#cdf3ff', borderRadius:5, margin:'6px 0', textShadow:'0 0 6px rgba(92,182,255,0.6)'}}>{hits.toString().padStart(7,'0')}</div>
            <div style={{fontSize:11, color:'#3a5680'}}>You are visitor #{(hits + 1).toString().padStart(7,'0')}!</div>
          </div>
          <div className="bubble-card" style={{padding:10, marginTop:10}}>
            <div style={{fontSize:11, fontWeight:600, color:'#3a5680', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6}}>Now Playing</div>
            <div style={{fontSize:12}}>🎵 HUNTRIX — GOLDEN</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
function IEWebRing() {
  const sites = [
    { name: 'CrochetClub.geo',  blurb: 'Patterns, hooks, and yarn reviews.', icon: '🧶' },
    { name: 'PixelPals.net',    blurb: 'Hand-drawn 32×32 icons since 1999.', icon: '🎨' },
    { name: 'DialUpDiaries',    blurb: 'The slow-internet appreciation society.', icon: '📡' },
    { name: 'RobloxKids.zone',  blurb: 'Scripts, builds, and weird obbies.', icon: '🟥' },
    { name: 'SingerSamuel',     blurb: 'A tiny site about karaoke.', icon: '🎤' },
  ];
  return (
    <div>
      <h1>★ Y2K Web Ring ★</h1>
      <p style={{lineHeight:1.6}}>The Y2K Web Ring is a curated loop of <i>cool personal sites</i>. Click any badge to "visit." (None of these are real — they're vibes.)</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10, marginTop:14}}>
        {sites.map(s => (
          <div key={s.name} className="bubble-card" style={{padding:10}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{width:36, height:36, borderRadius:6, display:'grid', placeItems:'center', fontSize:22,
                            background:'linear-gradient(180deg, #4aa3ff, #1f7cd8)'}}>{s.icon}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:13, color:'#0c2a55'}}>{s.name}</div>
                <div style={{fontSize:11, color:'#4a5e80'}}>{s.blurb}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:14, padding:10, textAlign:'center', border:'1px dashed #b8b8b8', borderRadius:8, background:'#fafafa'}}>
        <span style={{fontSize:11, color:'#3a5680'}}>« previous</span>
        <span style={{margin:'0 16px', fontWeight:600}}>AldenWeb</span>
        <span style={{fontSize:11, color:'#3a5680'}}>next »</span>
      </div>
    </div>
  );
}
const GUESTBOOK_KEY = 'aldenos.guestbook.v1';
function loadGuestbook() {
  try { return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || SAMPLE_GUESTBOOK; }
  catch { return SAMPLE_GUESTBOOK; }
}
const SAMPLE_GUESTBOOK = [
  { name: 'Riska', msg: "love the website omg the bubble wallpaper >.<", t: '2026-04-12' },
  { name: 'Anonymous', msg: "your paint app actually works now! great job", t: '2026-04-30' },
  { name: 'AldenBot', msg: "first to sign 🤖", t: '2026-04-01' },
];
function IEGuestbook() {
  const [entries, setEntries] = useState(loadGuestbook);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  function submit() {
    if (!name.trim() || !msg.trim()) return;
    const next = [{ name: name.trim(), msg: msg.trim(), t: new Date().toISOString().slice(0,10) }, ...entries];
    setEntries(next);
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(next));
    setName(''); setMsg('');
  }
  return (
    <div>
      <h1>★ Sign the Guestbook ★</h1>
      <div className="bubble-card" style={{padding:12, marginTop:8}}>
        <div style={{display:'grid', gap:6}}>
          <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} maxLength={32} />
          <textarea className="input" placeholder="Leave a message..." rows={3} value={msg} onChange={e=>setMsg(e.target.value)} maxLength={280}
                    style={{resize:'vertical'}} />
          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <button className="btn tiny primary" onClick={submit}>✍ Sign</button>
          </div>
        </div>
      </div>
      <div style={{marginTop:12, display:'grid', gap:8}}>
        {entries.map((e, i) => (
          <div key={i} style={{padding:'8px 10px', background:'#f8fbff', border:'1px solid rgba(0,30,80,0.12)', borderRadius:6}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'#3a5680'}}>
              <b style={{color:'#0c2a55'}}>{e.name}</b><span>{e.t}</span>
            </div>
            <div style={{marginTop:3, lineHeight:1.5}}>{e.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function IEAbout() {
  return (
    <div>
      <h1>★ About AldenOS 2.0 ★</h1>
      <p style={{lineHeight:1.7}}>AldenOS is a personal-portfolio fake operating system styled after the Frutiger Aero era —
      glossy buttons, glassy windows, lens flares, and Bliss-style skies. Made with HTML, CSS, JavaScript and a healthy
      respect for the early 2000s.</p>
      <div style={{marginTop:14, padding:12, background:'linear-gradient(180deg, #d9f0ff, #f0f8ff)', borderRadius:8, border:'1px solid rgba(0,30,80,0.15)'}}>
        <b>Credits</b>
        <ul style={{marginTop:6, paddingLeft:20, lineHeight:1.7}}>
          <li>Designer / developer: Samuel Alden A.S</li>
          <li>Bubble Sky wallpaper: composited from CSS gradients</li>
          <li>Sound effects: synthesized live with WebAudio</li>
          <li>AldenBot: a tiny language-model friend</li>
        </ul>
      </div>
    </div>
  );
}
registerApp({
  id: 'ie',
  name: 'Internet',
  icon: window.AldenOS.Icons.Globe,
  defaultSize: { w: 720, h: 520 },
  onDesktop: true,
  render: () => <IEApp />,
});

Object.assign(window, { BioApp, NotepadApp, PaintApp, FilesApp, SettingsApp, IEApp });
