// review.jsx — AldenOS UX Review content
const { useState, useEffect, useRef } = React;

/* ---------------------------------------------------------------
   Issue dataset — grouped by section
--------------------------------------------------------------- */

const SECTIONS = [
  {
    id: 'bugs',
    title: '1. Bugs to fix first',
    summary: 'Things that are actually broken in the code today.',
    issues: [
      {
        kind: 'bug',
        title: 'Three elements share id="desktop"',
        what: (<>Your <code>index.html</code> has <b>three</b> opening <code>&lt;div id="desktop"&gt;</code> tags. IDs must be unique — <code>getElementById</code> only returns the first one, so styles + JS attach to surprising elements and the desktop icons end up nested inside the boot screen container.</>),
        fix: <>Keep <b>one</b> <code>#desktop</code> wrapper. Move the boot screen, welcome window, and helper outside of it. Move all desktop icons into the same single <code>#desktop</code>.</>,
        code: { lang: 'html', lines: [
          ['bad', '<div id="desktop">'],
          ['bad', '  <div id="boot-screen">…</div>'],
          ['bad', '</div>'],
          ['bad', '<div id="desktop"> <!-- duplicate -->'],
          ['bad', '  <div id="helper">…</div>'],
          ['bad', '</div>'],
          ['bad', '<div id="desktop"> <!-- duplicate -->'],
          ['bad', '  <div class="desktop-icon">…</div>'],
          ['bad', '</div>'],
          ['', ''],
          ['good', '<!-- Fix: one #desktop, siblings outside -->'],
          ['good', '<div id="boot-screen">…</div>'],
          ['good', '<div id="helper">…</div>'],
          ['good', '<div id="desktop">'],
          ['good', '  <div class="desktop-icon">…</div>'],
          ['good', '</div>'],
        ]},
      },
      {
        kind: 'bug',
        title: 'Notepad taskbar button can\'t restore the window',
        what: (<>The taskbar button’s click handler has a typo — when the window is hidden it sets <code>display</code> to <code>"none"</code> again instead of <code>"block"</code>, so clicking the taskbar entry never brings it back.</>),
        fix: <>Set it to <code>"block"</code> in the show branch (same pattern you use for Bio and Paint).</>,
        code: { lang: 'js', lines: [
          ['com', '// script.js — notepad taskbar handler'],
          ['kw', 'if', null, ' (notepadWindow.style.display === ', ['str','"none"'], ') {'],
          ['bad', '  notepadWindow.style.display = "none";  // ← bug'],
          ['good', '  notepadWindow.style.display = "block"; // ← fix'],
          ['', '  bringToFront(notepadWindow);'],
          ['', '  notepadTaskbarBtn.classList.add("active");'],
          ['', '} else { … }'],
        ]},
      },
      {
        kind: 'bug',
        title: 'Boot, welcome & helper logic are nested inside an "if" block',
        what: (<>The boot-screen <code>window.addEventListener("load", …)</code>, the welcome-window wiring, and the entire idle-helper system all live <i>inside</i> <code>{'if (startMusicBtn) { … }'}</code>. If that one element is ever renamed, removed, or moved, the OS won’t boot at all.</>),
        fix: <>Close the <code>if</code> after the music-button listener, then declare boot, welcome, and helper at the top level of the file.</>,
      },
      {
        kind: 'bug',
        title: 'Bio window flashes on page load',
        what: (<>Every other window has <code>style="display:none"</code> inline. <code>#bio-window</code> doesn’t — it renders for one frame, then JS hides it. Users see a flash.</>),
        fix: <>Add <code>style="display:none"</code> to <code>#bio-window</code> in the HTML. Better: hide all windows with one CSS rule (<code>.window {'{'} display: none; {'}'}</code>) and add a <code>.is-open</code> class to show them.</>,
      },
      {
        kind: 'bug',
        title: 'Startup sound is blocked by the browser',
        what: (<>Modern browsers refuse <code>audio.play()</code> before the user has interacted with the page. Your startup sound calls <code>play()</code> from a <code>load</code> handler — it will throw <i>"NotAllowedError"</i> in the console and stay silent.</>),
        fix: <>Either (a) start muted and add a <i>"Click to enter"</i> splash before booting, or (b) wrap the call in <code>.catch(() ={'>'} {'{}'})</code> and don’t rely on the sound. Option (a) actually delivers the nostalgia.</>,
      },
      {
        kind: 'bug',
        title: 'Music window uses two different z-index strategies',
        what: (<>Most code calls <code>bringToFront(win)</code>, but one branch of the music taskbar click sets <code>musicWindow.style.zIndex = Date.now()</code>. Different focus styles, no <code>.active</code> class change — the title bar stays gray when it shouldn’t.</>),
        fix: <>Use <code>bringToFront(musicWindow)</code> everywhere. Delete the <code>Date.now()</code> line.</>,
      },
      {
        kind: 'bug',
        title: 'Drag-state is duplicated for every window',
        what: (<>Each app re-implements its own <code>isDragging</code> + <code>mousemove</code> listener on <code>document</code>. After opening Paint and then Music, two listeners fire on every mouse move. It works today, but it’s a leak waiting to happen.</>),
        fix: <>Write one <code>makeDraggable(windowEl)</code> helper and call it once per window. Bonus: easier to add window-snapping later.</>,
      },
      {
        kind: 'bug',
        title: 'Windows can be dragged off-screen and lost',
        what: (<>Drag has no bounds check. Slide a window past the top or left edge and you can never grab the title bar again. (Even Windows 98 prevented this!)</>),
        fix: <>In your move handler, clamp: <code>left = Math.max(0, Math.min(left, innerWidth - 80))</code> and similar for top (leave the title bar reachable).</>,
      },
    ],
  },

  {
    id: 'usability',
    title: '2. Make it feel real (window + app polish)',
    summary: 'Small additions that make the OS feel finished rather than half-built.',
    issues: [
      {
        kind: 'quick',
        title: 'Music player: one toggle, not two buttons',
        what: <>Right now Play (▶) and Pause (⏸) are <i>separate buttons</i>. Users have to keep track of which state the audio is in. A single toggle button is faster, smaller, and what every music app on Earth does.</>,
        fix: <>One button that swaps its icon based on <code>audio.paused</code>.</>,
        demo: 'music',
      },
      {
        kind: 'quick',
        title: 'Music player has no progress, scrub, or volume',
        what: <>You can’t see how far into the song you are, can’t skip ahead, can’t turn it down without leaving the page. Combined with the looping playlist of one, the player feels stuck.</>,
        fix: <>Add a progress bar bound to <code>audio.currentTime / audio.duration</code>, click-to-seek on it, and a small volume slider. Add at least 2–3 more tracks to make next/prev meaningful.</>,
      },
      {
        kind: 'quick',
        title: 'Single-click on a desktop icon does nothing',
        what: <>Icons only respond to <code>dblclick</code>. New users (especially on touch / trackpad) will click once, see nothing happen, and bounce. On a real Win98 desktop, single-click <i>selects</i> with a highlight; double-click opens.</>,
        fix: <>Add a single-click handler that toggles a <code>.selected</code> class (changing the label background to blue), and keep double-click for open. Or just open on single click — it’s a website, not a file manager.</>,
        demo: 'icons',
      },
      {
        kind: 'polish',
        title: 'Helper pops up forever, with no off-switch',
        what: <>Every 20 seconds of idle, the helper reappears next to the cursor. There’s no close (×) button and no "don’t show again". It went from charming to annoying around minute three.</>,
        fix: <>Add a tiny × on the speech bubble that hides the helper for the session. Lengthen the idle timeout to 60s. Hide it entirely once the user has opened ≥1 window (they clearly know what to do).</>,
        demo: 'helper',
      },
      {
        kind: 'polish',
        title: 'Add a maximize button (and make it work)',
        what: <>Windows have minimize and close, but no maximize. The whole metaphor is "this is a desktop OS" — the missing □ button is conspicuous.</>,
        fix: <>Add a maximize button between minimize and close. On click, store the previous geometry, then set <code>top/left/width/height</code> to fill <code>#desktop</code> (minus the taskbar). Click again to restore.</>,
      },
      {
        kind: 'polish',
        title: 'Remember window positions across reloads',
        what: <>You already use <code>localStorage</code> for Notepad text — extend the habit. Each refresh resets every window to its CSS-default spot, which means everyone’s windows stack on top of each other at <code>top:0;left:0</code>.</>,
        fix: <>On <code>mouseup</code> of each drag, save <code>{'{'} top, left, isOpen {'}'}</code> keyed by window id. On load, restore. Also give first-open windows a slight cascade offset (each opens 24px down + right of the previous).</>,
      },
      {
        kind: 'polish',
        title: 'Notepad uses <code>alert()</code> to confirm "Saved"',
        what: <>Native browser alerts break the immersion of a fake OS — they look nothing like AldenOS. They also block the page until dismissed.</>,
        fix: <>Show a tiny in-app status bar at the bottom of Notepad: <i>"Saved at 12:04 ✓"</i> that fades after 2 seconds. Also auto-save on blur — no button needed.</>,
      },
      {
        kind: 'polish',
        title: 'Paint: brush is 2px, no eraser, no size, no save',
        what: <>The whole tool is "click and drag to draw a tiny dot trail in one color." There’s no brush size, no eraser, no clear before-stroke smoothing (<code>arc</code> draws disconnected circles when you move fast), no way to keep the result.</>,
        fix: <>Use <code>lineTo</code> + <code>stroke</code> with <code>lineWidth</code> for smooth strokes. Add a size slider (1–24), an eraser button (<code>globalCompositeOperation = "destination-out"</code>), and a "💾 Save" that does <code>canvas.toDataURL()</code> → download.</>,
      },
      {
        kind: 'polish',
        title: 'Start menu items are mostly fake',
        what: <>"🧑‍💻 My Bio", "📨 Contact", "🔒 Log Off" don’t do anything. Only Music Player is wired up. That’s the first thing users will try.</>,
        fix: <>Wire <i>My Bio</i> to open the bio window. <i>Contact</i> → open a small window with email + GitHub links. <i>Log Off</i> → fake shutdown screen ("It is now safe to turn off your computer.") with a button to come back. Cheap, memorable.</>,
      },
    ],
  },

  {
    id: 'a11y',
    title: '3. Make it usable for everyone',
    summary: 'Right now AldenOS only works for a sighted user with a mouse on a desktop. That’s fixable.',
    issues: [
      {
        kind: 'a11y',
        title: 'Nothing works with a keyboard',
        what: <>No element has focus styles. <code>Tab</code> skips icons (they’re <code>&lt;div&gt;</code>s). You can’t close a window with <code>Esc</code>, open the start menu with the Windows key, or move focus between windows. A power user can’t use this at all.</>,
        fix: (<>Make icons real buttons: <code>&lt;button class="desktop-icon"&gt;</code>. Add an <code>Esc</code> handler that closes the active window. Add a focus ring (<code>:focus-visible {'{'} outline: 2px dotted #000 {'}'}</code>).</>),
      },
      {
        kind: 'a11y',
        title: 'No alt text, no ARIA, no roles',
        what: <>Windows aren’t <code>role="dialog"</code>. The taskbar isn’t a <code>role="toolbar"</code>. Emoji icons have no text alternative for screen readers — they’ll read "rocket book of memo" instead of "Notepad."</>,
        fix: <>Wrap windows: <code>role="dialog" aria-labelledby="…"</code>. Add <code>aria-label="Notepad"</code> on icons. Wrap emoji in <code>&lt;span aria-hidden="true"&gt;</code> and put the real name in the adjacent text node.</>,
      },
      {
        kind: 'a11y',
        title: 'Body font is "Press Start 2P" — beautiful, unreadable',
        what: <>You set <code>font-family: 'Press Start 2P'</code> on <code>body</code>. It cascades to anything that doesn’t override it — including the desktop icon labels at 10px. That font has no lowercase descenders, awkward kerning, and very low x-height. Charming for one heading; punishing for paragraphs.</>,
        fix: <>Limit Press Start 2P to <code>.title-bar .title</code>, <code>h1</code> in the boot screen, and the Start button. Use Tahoma / MS Sans Serif (already in your stack) for body and icon labels at 11px+. Compare the legend below to the icons on the live site.</>,
      },
      {
        kind: 'a11y',
        title: 'Helper bubble has 4.1:1 contrast on yellow',
        what: <>Black text on <code>#ffffe1</code> is borderline; the <code>#ccc</code> taskbar text on gray is worse. WCAG AA needs 4.5:1 for body text.</>,
        fix: <>Darken the helper background to <code>#fff8c4</code>, and the inactive title-bar text to <code>#eee</code>. Quick wins, no design change.</>,
      },
      {
        kind: 'a11y',
        title: 'Animation never asks "prefers-reduced-motion"',
        what: <>The boot screen, fade-out, and helper movement always animate. Some users get motion-sick from the helper following the cursor.</>,
        fix: <>Wrap motion in <code>@media (prefers-reduced-motion: no-preference)</code>, or shorten transitions to 0s when reduced-motion is requested.</>,
      },
    ],
  },

  {
    id: 'mobile',
    title: '4. Mobile / touch is completely broken',
    summary: 'Open the site on a phone right now and it’s unusable. This is a 1-evening fix that doubles your audience.',
    issues: [
      {
        kind: 'bug',
        title: 'Double-click and mousedown don’t exist on touch',
        what: <>Icons need <code>dblclick</code> to open. Dragging uses <code>mousedown/mousemove/mouseup</code>. On a phone, none of these fire — the whole OS is frozen.</>,
        fix: <>Use <code>pointerdown / pointermove / pointerup</code> instead of mouse events (one set of code, both platforms). For "open," switch to single-tap on touch, or detect double-tap with a 250ms timer.</>,
      },
      {
        kind: 'polish',
        title: 'Windows are 300px wide, hit targets are 20px',
        what: <>Window close/minimize buttons are 20×20px. Apple HIG / Material both ask for 44px on touch. Notepad at 300px wide barely fits a sentence.</>,
        fix: <>On <code>(pointer: coarse)</code>, scale window-button hit area to 32px (use padding, keep the visual at 20px). Make windows open at <code>min(440px, 92vw)</code>.</>,
      },
      {
        kind: 'polish',
        title: 'No fallback layout for tiny screens',
        what: <>The desktop metaphor doesn’t survive at 360px. Icons wrap weirdly and the taskbar clock is squished against the start button.</>,
        fix: <>Under 480px, switch to a single-column "app drawer" layout — icons in a vertical list, windows open full-screen with a back arrow in the title bar. Same content, different shape.</>,
      },
    ],
  },

  {
    id: 'ideas',
    title: '5. Bigger ideas (only if you want to)',
    summary: 'Pure suggestions to grow the project — none of these are required, just fun.',
    issues: [
      {
        kind: 'idea',
        title: 'Replace emoji with pixel icons',
        what: <>Emoji render differently on every OS (your Notepad icon is yellow on macOS, blue on Win11, weird on Android). It quietly kills the consistent retro look you’ve built everywhere else.</>,
        fix: <>Hand-draw 32×32 pixel icons in any free editor (Aseprite, Piskel) and export to PNG. Pin to <code>image-rendering: pixelated</code>. Five icons is a one-evening job.</>,
      },
      {
        kind: 'idea',
        title: 'Add a "My Computer" file explorer',
        what: <>The bio + notepad + paint are isolated apps. A file explorer ties them together: a "Documents" folder showing saved notes, a "Pictures" folder showing PaintPad drawings, an "About Me" folder linking to your bio.</>,
        fix: <>One window with a tree view on the left. All "files" are just objects in JS. This is the move that makes AldenOS feel like an OS instead of four floating apps.</>,
      },
      {
        kind: 'idea',
        title: 'One classic game (Minesweeper or Snake)',
        what: <>Every fake Y2K OS online has one. People remember it forever. It also gives you a reason for the "high score" to live in localStorage, which is fun to implement.</>,
        fix: <>Snake is ~80 lines on a canvas. Minesweeper is ~150. Either fits the aesthetic perfectly.</>,
      },
      {
        kind: 'idea',
        title: 'A "Settings" window — wallpaper, theme, sound',
        what: <>Right now everything is locked. Letting visitors swap the wallpaper, choose a theme (Y2K pastel / classic teal / hacker green), and mute the helper is the single highest delight-per-line-of-code feature you can add.</>,
        fix: <>Settings window writes to <code>localStorage</code>; on load, CSS custom properties read those values. The whole thing is a control panel with three radios and a checkbox.</>,
      },
      {
        kind: 'idea',
        title: 'Easter eggs — earn them',
        what: <>Right now there’s nothing to discover. AldenOS is a personality site — give it secrets.</>,
        fix: <>Examples: type <code>matrix</code> anywhere → green rain on the desktop for 5 seconds. Konami code → a hidden bio entry appears. Click the clock 10 times → Y2K bug message. None of these need to be discoverable — that’s the point.</>,
      },
    ],
  },
];

/* ---------------------------------------------------------------
   Components
--------------------------------------------------------------- */

function Chip({ kind, children }) {
  const label = { bug: 'Bug', quick: 'Quick win', polish: 'Polish', a11y: 'Accessibility', idea: 'Idea' }[kind] || kind;
  return <span className={`chip ${kind}`}>{children || label}</span>;
}

function CodeBlock({ data }) {
  if (!data) return null;
  return (
    <pre>{data.lines.map((row, i) => {
      // row can be ['cls','text'] or ['cls','text', null, 'more text', ['cls','text'], …]
      if (typeof row === 'string') return <div key={i}>{row || '\u00a0'}</div>;
      const segs = [];
      for (let j = 0; j < row.length; j += 2) {
        const cls = row[j];
        const txt = row[j+1];
        if (txt == null) continue;
        if (Array.isArray(txt)) {
          segs.push(<span key={j} className={txt[0]}>{txt[1]}</span>);
        } else if (cls) {
          segs.push(<span key={j} className={cls}>{txt}</span>);
        } else {
          segs.push(<span key={j}>{txt}</span>);
        }
      }
      return <div key={i}>{segs.length ? segs : '\u00a0'}</div>;
    })}</pre>
  );
}

/* ---- Demo 1: music player ---- */
function MusicDemo() {
  const [playingA, setA] = useState(false);
  const [playingB, setB] = useState(false);
  return (
    <div className="demo">
      <div className="demo-header">▼ Try it — same window, two control schemes</div>
      <div className="demo-grid">
        <div className="demo-col">
          <h4 className="ttl">Today (two buttons)</h4>
          <div className="mini-window">
            <div className="mini-tb"><span>Music Player</span><span className="mini-tb-buttons"><span>_</span><span>×</span></span></div>
            <div className="mini-body">
              <div style={{marginBottom:6}}>HUNTRIX — GOLDEN</div>
              <div style={{display:'flex', gap:4}}>
                <button className="mini-btn">⏮</button>
                <button className="mini-btn" onClick={()=>setA(true)}>▶</button>
                <button className="mini-btn" onClick={()=>setA(false)}>⏸</button>
                <button className="mini-btn">⏭</button>
              </div>
              <p style={{fontSize:10, marginTop:6, color:'#888'}}>State: {playingA ? 'playing' : 'paused'} — user has to remember.</p>
            </div>
          </div>
        </div>
        <div className="demo-col">
          <h4 className="ttl-ok">Fix (one toggle + progress + volume)</h4>
          <div className="mini-window">
            <div className="mini-tb"><span>Music Player</span><span className="mini-tb-buttons"><span>_</span><span>□</span><span>×</span></span></div>
            <div className="mini-body">
              <div style={{marginBottom:4}}>HUNTRIX — GOLDEN <span style={{color:'#888'}}>(1 of 4)</span></div>
              <div className="progress"><i style={{width: playingB ? '42%' : '18%'}}/></div>
              <div style={{display:'flex', gap:4, alignItems:'center'}}>
                <button className="mini-btn">⏮</button>
                <button className={`mini-btn toggle${playingB?' on':''}`} onClick={()=>setB(v=>!v)}>{playingB ? '⏸ Pause' : '▶ Play'}</button>
                <button className="mini-btn">⏭</button>
                <span style={{marginLeft:'auto', fontSize:10, color:'#555'}}>🔊</span>
                <input type="range" defaultValue="60" style={{width:50, accentColor:'#1a5fb4'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Demo 2: single vs double click ---- */
function IconDemo() {
  const [openA, setOpenA] = useState(null);   // requires double click
  const [openB, setOpenB] = useState(null);   // selects + opens via Enter / dbl OR single-tap
  const [selectedB, setSelB] = useState(null);
  const lastClickA = useRef({ id: null, t: 0 });

  function handleA(id) {
    const now = Date.now();
    if (lastClickA.current.id === id && now - lastClickA.current.t < 400) {
      setOpenA(id);
      lastClickA.current = { id: null, t: 0 };
    } else {
      lastClickA.current = { id, t: now };
    }
  }
  function clickB(id) {
    if (selectedB === id) setOpenB(id);
    else setSelB(id);
  }

  const icons = [
    { id: 'bio', emoji: '👋', label: 'My Bio' },
    { id: 'pad', emoji: '📝', label: 'Notepad' },
    { id: 'art', emoji: '🎨', label: 'Paint' },
  ];
  const desktopStyle = {
    minHeight: 110, display:'flex', gap:14, padding:10,
    background:'linear-gradient(135deg, #5da0c2, #88c4d8)',
    border:'1px solid #2a4a55',
  };
  const iconStyle = (active) => ({
    width:64, textAlign:'center', cursor:'pointer', userSelect:'none',
    background: active ? 'rgba(0,90,180,0.45)' : 'transparent',
    border: active ? '1px dotted #fff' : '1px solid transparent',
    padding:4, color:'#fff', textShadow:'1px 1px 0 #000',
    fontFamily:'Tahoma, sans-serif', fontSize:10,
  });

  return (
    <div className="demo">
      <div className="demo-header">▼ Try it — click an icon in each desktop</div>
      <div className="demo-grid">
        <div className="demo-col">
          <h4 className="ttl">Today (only double-click works)</h4>
          <div style={desktopStyle}>
            {icons.map(i => (
              <div key={i.id} style={iconStyle(false)} onClick={() => handleA(i.id)}>
                <div style={{fontSize:28, lineHeight:1}}>{i.emoji}</div>
                <div>{i.label}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:11, color:'#666'}}>Single click → nothing. {openA ? <b>You opened "{icons.find(i=>i.id===openA).label}".</b> : 'No feedback until the second click.'}</p>
        </div>
        <div className="demo-col">
          <h4 className="ttl-ok">Fix (single-click selects, second-click opens)</h4>
          <div style={desktopStyle}>
            {icons.map(i => (
              <div key={i.id} style={iconStyle(selectedB===i.id)} onClick={() => clickB(i.id)}>
                <div style={{fontSize:28, lineHeight:1}}>{i.emoji}</div>
                <div>{i.label}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:11, color:'#666'}}>{openB ? <><b>Opened "{icons.find(i=>i.id===openB).label}".</b> Reset by clicking another.</> : selectedB ? <>Selected "<b>{icons.find(i=>i.id===selectedB).label}</b>" — click again to open.</> : 'Click any icon — you get instant feedback.'}</p>
        </div>
      </div>
    </div>
  );
}

/* ---- Demo 3: helper dismissal ---- */
function HelperDemo() {
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [respawnA, setRespA] = useState(0);
  const [respawnB, setRespB] = useState(0);

  // Today: re-appears after 4s no matter what
  useEffect(() => {
    if (showA) return;
    const t = setTimeout(() => { setShowA(true); setRespA(n => n + 1); }, 4000);
    return () => clearTimeout(t);
  }, [showA]);

  // Fix: stays gone for the session once dismissed
  // (no respawn timer)

  const helper = (text, onClose, closable) => (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background:'#fff8c4', border:'1px solid #000',
      padding:'4px 6px', fontSize:11, position:'relative',
      boxShadow:'2px 2px 4px rgba(0,0,0,0.3)',
    }}>
      <span style={{fontSize:22}}>🤖</span>
      <span style={{maxWidth:140}}>{text}</span>
      {closable && (
        <button onClick={onClose} style={{
          width:16, height:16, lineHeight:'12px', padding:0, marginLeft:4,
          background:'#c0c0c0', border:'1px solid #fff',
          borderRightColor:'#404040', borderBottomColor:'#404040',
          boxShadow:'inset 1px 1px 0 #fff, inset -1px -1px 0 #808080',
          fontSize:10, fontWeight:700, cursor:'pointer',
        }}>×</button>
      )}
    </div>
  );

  return (
    <div className="demo">
      <div className="demo-header">▼ Try it — dismiss each helper</div>
      <div className="demo-grid">
        <div className="demo-col">
          <h4 className="ttl">Today (no off-switch)</h4>
          <div style={{minHeight:46, display:'flex', alignItems:'center'}}>
            {showA ? helper("Hi there! Need some help?", null, false)
                   : <span style={{fontSize:11, color:'#888'}}>Dismissed… for 4 seconds 😩</span>}
          </div>
          <button className="mini-btn" disabled={!showA} onClick={()=>setShowA(false)} style={{alignSelf:'flex-start'}}>
            Hide helper
          </button>
          <p style={{fontSize:10, color:'#888'}}>Re-appearances this session: <b>{respawnA}</b></p>
        </div>
        <div className="demo-col">
          <h4 className="ttl-ok">Fix (× on bubble, stays gone)</h4>
          <div style={{minHeight:46, display:'flex', alignItems:'center'}}>
            {showB ? helper("Hi there! Need some help?", () => { setShowB(false); setRespB(n=>n+1); }, true)
                   : <span style={{fontSize:11, color:'#888'}}>Hidden for the session. Peaceful. ✨</span>}
          </div>
          <button className="mini-btn" disabled={showB} onClick={()=>setShowB(true)} style={{alignSelf:'flex-start'}}>
            Bring it back
          </button>
          <p style={{fontSize:10, color:'#888'}}>Dismissed: <b>{respawnB}</b> time{respawnB===1?'':'s'} — by the user, on purpose.</p>
        </div>
      </div>
    </div>
  );
}

function Demo({ which }) {
  if (which === 'music')  return <MusicDemo />;
  if (which === 'icons')  return <IconDemo />;
  if (which === 'helper') return <HelperDemo />;
  return null;
}

function Issue({ n, item }) {
  return (
    <div className="issue">
      <div className="num">{String(n).padStart(2, '0')}</div>
      <div>
        <div className="row">
          <Chip kind={item.kind} />
          <h3>{item.title}</h3>
        </div>
        <p>{item.what}</p>
        <p className="fix"><b>Fix.</b> {item.fix}</p>
        <CodeBlock data={item.code} />
        {item.demo && <Demo which={item.demo} />}
      </div>
    </div>
  );
}

function Section({ sec, defaultOpen }) {
  return (
    <details className="section" open={defaultOpen}>
      <summary>
        {sec.title}
        <span className="count">{sec.issues.length} item{sec.issues.length===1?'':'s'}</span>
      </summary>
      <div className="section-body">
        <p style={{fontSize:11.5, color:'#555', marginBottom:2}}>{sec.summary}</p>
        {sec.issues.map((it, i) => <Issue key={i} n={i+1} item={it} />)}
      </div>
    </details>
  );
}

function Report() {
  const total = SECTIONS.reduce((n,s)=>n+s.issues.length, 0);
  const bugs  = SECTIONS.flatMap(s=>s.issues).filter(i=>i.kind==='bug').length;
  const quick = SECTIONS.flatMap(s=>s.issues).filter(i=>i.kind==='quick').length;

  return (
    <>
      <div className="hero">
        <div className="hero-glyph" aria-hidden="true">!</div>
        <div>
          <h1>UX REVIEW — AldenOS 2000</h1>
          <p>
            Hi Samuel — I read all of <code>index.html</code>, <code>style.css</code> and <code>script.js</code>.
            AldenOS has real personality and the Y2K bones are good. Below is everything I noticed,
            grouped by what to fix first. Each item says what’s happening now, why it matters,
            and the smallest fix that gets you there. Three sections have inline before/after demos
            you can play with.
          </p>
        </div>
        <div className="stats">
          <em>{total}</em><span>findings</span>
          <em>{bugs}</em><span>bugs</span>
          <em>{quick}</em><span>quick wins</span>
        </div>
      </div>

      <div className="legend" aria-label="Legend">
        <Chip kind="bug" />
        <Chip kind="quick" />
        <Chip kind="polish" />
        <Chip kind="a11y" />
        <Chip kind="idea" />
      </div>

      {SECTIONS.map((s, i) => <Section key={s.id} sec={s} defaultOpen={i < 2} />)}

      <div className="footer">
        <h2>If you only do five things this week…</h2>
        <ol>
          <li>Fix the duplicate <code>id="desktop"</code> and the notepad-restore typo. (15 min, removes real bugs.)</li>
          <li>Make Play and Pause one button, and add a progress bar to the music player. (1 hour, biggest visible upgrade.)</li>
          <li>Open windows on a single click + add a maximize button. (30 min, makes it feel like a real OS.)</li>
          <li>Put a × on the helper bubble and double the idle timeout. (10 min, removes the biggest annoyance.)</li>
          <li>Limit Press Start 2P to titles only; use Tahoma for everything else. (5 min, makes the icons readable.)</li>
        </ol>
        <p className="signoff">
          Everything else can wait. AldenOS doesn’t need more apps — it needs the existing ones
          to feel finished. Once they do, the "My Computer" file explorer in §5 is the move that
          turns this from a portfolio piece into something people will actually share.
        </p>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('report-body')).render(<Report />);
