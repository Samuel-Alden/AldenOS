// apps-fun.jsx — Music, MSN Messenger, Minesweeper, Snake
const { registerApp: regApp, useOS: useOS2 } = window.AldenOS;
const { useState: uS, useEffect: uE, useRef: uR, useMemo: uM, useCallback: uC } = React;

/* ===================================================================
   MUSIC PLAYER — WinAmp-style simulator
   =================================================================== */
const TRACKS = [
  { title: 'HUNTRIX — GOLDEN',         artist: 'HUNTRIX',        len: 218 },
  { title: 'AldenOS Boot Chime',       artist: 'Synth Aero',     len: 12  },
  { title: 'Dial-Up Handshake (Lofi)', artist: 'USR-56k',        len: 168 },
  { title: 'Bubble Sky (instr.)',      artist: 'Frutiger Boys',  len: 192 },
];
function fmt(s) {
  const m = Math.floor(s / 60), x = Math.floor(s % 60);
  return `${m}:${x.toString().padStart(2, '0')}`;
}
function MusicApp() {
  const { sound } = useOS2();
  const [idx, setIdx] = uS(0);
  const [playing, setPlaying] = uS(false);
  const [t, setT] = uS(0);
  const [vol, setVol] = uS(60);
  const [bars, setBars] = uS(() => Array.from({length:16}, () => 4));
  const track = TRACKS[idx];

  // publish to global NowPlaying channel
  uE(() => {
    const NP = window.AldenOS.NowPlaying;
    if (NP) NP.set({ title: track.title, artist: track.artist, playing, t, len: track.len, idx });
  }, [idx, playing, t, track]);

  // listen for widget control requests
  uE(() => {
    function onCtl(e) {
      const action = e.detail?.action;
      if (action === 'toggle') setPlaying(p => !p);
      else if (action === 'next') { setIdx(i => (i + 1) % TRACKS.length); setT(0); }
      else if (action === 'prev') { setIdx(i => (i - 1 + TRACKS.length) % TRACKS.length); setT(0); }
    }
    window.addEventListener('aldenos:np-control', onCtl);
    return () => window.removeEventListener('aldenos:np-control', onCtl);
  }, []);

  uE(() => {
    if (!playing) return;
    const id = setInterval(() => setT(prev => {
      const next = prev + 1;
      if (next >= track.len) { setPlaying(false); setIdx(i => (i + 1) % TRACKS.length); return 0; }
      return next;
    }), 1000);
    return () => clearInterval(id);
  }, [playing, track]);

  uE(() => {
    if (!playing) { setBars(b => b.map(() => 2)); return; }
    const id = setInterval(() => {
      setBars(Array.from({length:16}, () => Math.max(2, Math.floor(Math.random() * 36 * (vol / 100)))));
    }, 90);
    return () => clearInterval(id);
  }, [playing, vol]);

  function toggle() {
    setPlaying(p => !p);
    if (!playing) sound.play('open'); else sound.play('click');
  }
  function next() { setIdx(i => (i + 1) % TRACKS.length); setT(0); sound.play('click'); }
  function prev() { setIdx(i => (i - 1 + TRACKS.length) % TRACKS.length); setT(0); sound.play('click'); }

  return (
    <div className="app-pad" style={{padding:12}}>
      <div className="music-screen">
        <div className="track">{track.title}</div>
        <div style={{fontSize:12, opacity:0.85, marginTop:2}}>{track.artist}</div>
        <div className="viz">
          {bars.map((h, i) => <i key={i} style={{height: h + 'px'}} />)}
        </div>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <span className="time">{fmt(t)}</span>
          <span className="time">{fmt(track.len)}</span>
        </div>
        <div className="progress" style={{marginTop:4, background:'rgba(255,255,255,0.15)', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.4)'}}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setT(Math.round(((e.clientX - r.left) / r.width) * track.len));
              }}>
          <i style={{width: (t / track.len * 100) + '%'}} />
        </div>
      </div>

      <div style={{display:'flex', gap:6, alignItems:'center', marginTop:12, justifyContent:'center'}}>
        <button className="btn" onClick={prev} title="Previous">⏮</button>
        <button className="btn primary" onClick={toggle} style={{minWidth:96}}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="btn" onClick={next} title="Next">⏭</button>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:8, marginTop:12, padding:'8px 12px',
                    background:'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(220,235,250,0.35))',
                    border:'1px solid rgba(0,30,80,0.15)', borderRadius:8}}>
        <span style={{fontSize:13}}>🔊</span>
        <input className="range" type="range" min={0} max={100} value={vol} onChange={e=>setVol(+e.target.value)} style={{flex:1}} />
        <span style={{fontSize:11, color:'#3a5680', width:28, textAlign:'right'}}>{vol}</span>
      </div>

      <div style={{marginTop:12}}>
        <div style={{fontSize:11, fontWeight:600, color:'#3a5680', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6}}>Playlist</div>
        <div style={{borderRadius:6, overflow:'hidden', border:'1px solid rgba(0,30,80,0.18)'}}>
          {TRACKS.map((tr, i) => (
            <div key={i} onClick={()=>{setIdx(i); setT(0);}} style={{
              padding:'5px 10px',
              background: i === idx ? 'linear-gradient(180deg, #4aa3ff, #1f7cd8)' : (i % 2 ? 'rgba(255,255,255,0.55)' : 'rgba(245,250,255,0.85)'),
              color: i === idx ? '#fff' : '#1a2a44',
              fontSize:12, display:'flex', gap:8, cursor:'pointer',
              textShadow: i === idx ? '0 1px 0 rgba(0,0,0,0.2)' : 'none',
            }}>
              <span style={{width:18, textAlign:'right', opacity:0.6}}>{i + 1}.</span>
              <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{tr.title}</span>
              <span style={{opacity:0.7}}>{fmt(tr.len)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
regApp({
  id: 'music',
  name: 'Music',
  icon: window.AldenOS.Icons.Music,
  defaultSize: { w: 380, h: 520 },
  onDesktop: true,
  render: () => <MusicApp />,
});

/* ===================================================================
   MSN MESSENGER
   =================================================================== */
const CANNED_REPLIES = [
  "haha that's cool",
  "omg same",
  "what r u doing rn",
  "the bubble wallpaper goes hard",
  "have u tried Minesweeper yet? it's on the desktop",
  "brb my mom needs the phone",
  "g2g, ttyl :)",
  "did u sign the guestbook in IE",
];
function MSNApp() {
  const { sound } = useOS2();
  const [open, setOpen] = uS(true); // chat panel open vs friend list
  const [messages, setMessages] = uS(() => [
    { who: 'them', text: 'hi!! 👋 welcome to AldenOS', t: Date.now() - 4000 },
    { who: 'them', text: "i'm AldenBot. ask me anything :)", t: Date.now() - 2000 },
  ]);
  const [input, setInput] = uS('');
  const [typing, setTyping] = uS(false);
  const [nudge, setNudge] = uS(false);
  const scroller = uR(null);

  uE(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, typing]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(m => [...m, { who: 'me', text, t: Date.now() }]);
    sound.play('msg');
    setTyping(true);
    // try claude, fallback to canned
    let reply = null;
    try {
      if (window.claude && window.claude.complete) {
        const prompt = `You are AldenBot, a friendly chatbot inside a Y2K-themed personal-portfolio fake operating system called AldenOS. ` +
                       `You sound like a teenager on MSN Messenger in 2003: lowercase, short sentences, emoticons like :) :P :D ;) <3, ` +
                       `occasional "lol", "omg", "brb". Never preachy. Keep replies under 25 words. ` +
                       `If the user asks "what is this", explain AldenOS in one line. The current user is browsing the site.\n\n` +
                       `User: ${text}\nAldenBot:`;
        reply = await window.claude.complete(prompt);
        reply = (reply || '').replace(/^["']|["']$/g, '').trim();
      }
    } catch {}
    if (!reply) reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
    setTyping(false);
    setMessages(m => [...m, { who: 'them', text: reply, t: Date.now() }]);
    sound.play('msg');
  }

  function sendNudge() {
    setNudge(true);
    sound.play('nudge');
    setTimeout(() => setNudge(false), 600);
    setMessages(m => [...m, { who: 'sys', text: 'You just sent a nudge!', t: Date.now() }]);
    setTimeout(() => {
      setMessages(m => [...m, { who: 'them', text: 'okay okay i see u 👀', t: Date.now() }]);
      sound.play('msg');
    }, 800);
  }

  if (!open) {
    return (
      <div className="app-pad">
        <div style={{textAlign:'center', padding:20}}>
          <div style={{fontSize:13, color:'#3a5680', marginBottom:10}}>Contacts (1 online)</div>
          <div className="bubble-card">
            <div className="msn-list">
              <div className="row" onClick={() => setOpen(true)}>
                <div className="ava" aria-hidden="true">🤖</div>
                <div>
                  <div style={{fontWeight:600, fontSize:13}}>AldenBot</div>
                  <div style={{fontSize:11, color:'#5cd6a6'}}>Online — say hi</div>
                </div>
                <div className="status-dot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={nudge ? 'msn-nudge' : ''} style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{padding:'8px 12px', display:'flex', alignItems:'center', gap:10,
                    background:'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(220,235,250,0.35))',
                    borderBottom:'1px solid rgba(0,30,80,0.12)'}}>
        <div className="ava" style={{width:32, height:32, borderRadius:'50%', background:'radial-gradient(circle at 30% 25%, #fff 0%, #b8e0ff 50%, #1a8cff 100%)',
                                       display:'grid', placeItems:'center', fontSize:18, border:'1.5px solid #fff', boxShadow:'0 1px 2px rgba(0,30,80,0.3)'}}>🤖</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600, fontSize:13, color:'#0c2a55'}}>AldenBot</div>
          <div style={{fontSize:11, color:'#5cd6a6'}}>● Online</div>
        </div>
        <button className="btn tiny" onClick={sendNudge} title="Send a nudge">⚡ Nudge</button>
      </div>
      <div ref={scroller} style={{flex:1, minHeight:0, overflow:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:0,
                                    background:'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(220,235,250,0.20))'}}>
        {messages.map((m, i) => {
          if (m.who === 'sys') return <div key={i} style={{textAlign:'center', fontSize:11, color:'#6e7e90', padding:'4px 0', fontStyle:'italic'}}>{m.text}</div>;
          return <div key={i} className={`msn-bubble ${m.who}`}>{m.text}</div>;
        })}
        {typing && <div className="msn-bubble them" style={{opacity:0.6, fontStyle:'italic'}}>typing<span style={{display:'inline-block', animation:'pulse 1s ease-in-out infinite'}}>...</span></div>}
      </div>
      <div style={{padding:'8px 10px', display:'flex', gap:6, background:'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(220,235,250,0.4))',
                    borderTop:'1px solid rgba(0,30,80,0.12)'}}>
        <input className="input" value={input} onChange={e=>setInput(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') send(); }}
               placeholder="Type a message…" style={{flex:1}} />
        <button className="btn primary tiny" onClick={send}>Send</button>
      </div>
      <div className="status-bar">
        <span>Status: online</span>
        <span style={{marginLeft:'auto', opacity:0.7}}>End-to-end nothing</span>
      </div>
    </div>
  );
}
regApp({
  id: 'msn',
  name: 'Messenger',
  icon: window.AldenOS.Icons.Chat,
  defaultSize: { w: 380, h: 480 },
  onDesktop: true,
  render: () => <MSNApp />,
});

/* ===================================================================
   MINESWEEPER
   =================================================================== */
const MINE_COLS = 9, MINE_ROWS = 9, MINE_COUNT = 10;
function newMineGrid() {
  const g = Array.from({length: MINE_ROWS}, () => Array.from({length: MINE_COLS}, () => ({mine:false, open:false, flag:false, n:0})));
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * MINE_ROWS);
    const c = Math.floor(Math.random() * MINE_COLS);
    if (!g[r][c].mine) { g[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < MINE_ROWS; r++)
    for (let c = 0; c < MINE_COLS; c++) {
      if (g[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r+dr, nc = c+dc;
          if (nr<0||nc<0||nr>=MINE_ROWS||nc>=MINE_COLS) continue;
          if (g[nr][nc].mine) n++;
        }
      g[r][c].n = n;
    }
  return g;
}
function flood(g, r, c) {
  if (r<0||c<0||r>=MINE_ROWS||c>=MINE_COLS) return;
  const cell = g[r][c];
  if (cell.open || cell.flag) return;
  cell.open = true;
  if (cell.n > 0 || cell.mine) return;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++)
      if (dr || dc) flood(g, r+dr, c+dc);
}

function MinesApp() {
  const { sound } = useOS2();
  const [grid, setGrid] = uS(newMineGrid);
  const [state, setState] = uS('idle'); // idle | play | lose | win
  const [time, setTime] = uS(0);
  const [flags, setFlags] = uS(0);

  uE(() => {
    if (state !== 'play') return;
    const id = setInterval(() => setTime(t => Math.min(t + 1, 999)), 1000);
    return () => clearInterval(id);
  }, [state]);

  function reset() {
    setGrid(newMineGrid());
    setState('idle');
    setTime(0);
    setFlags(0);
    sound.play('click');
  }
  function reveal(r, c) {
    if (state === 'lose' || state === 'win') return;
    const cell = grid[r][c];
    if (cell.flag || cell.open) return;
    const g = grid.map(row => row.map(x => ({...x})));
    if (state === 'idle') setState('play');
    if (g[r][c].mine) {
      // game over — open all mines
      g.forEach(row => row.forEach(x => { if (x.mine) x.open = true; }));
      g[r][c].boom = true;
      setGrid(g);
      setState('lose');
      sound.play('boom');
      return;
    }
    flood(g, r, c);
    setGrid(g);
    // win check
    const remaining = g.flat().filter(x => !x.mine && !x.open).length;
    if (remaining === 0) {
      setState('win');
      sound.play('chime');
    } else {
      sound.play('select');
    }
  }
  function flag(e, r, c) {
    e.preventDefault();
    if (state === 'lose' || state === 'win') return;
    const cell = grid[r][c];
    if (cell.open) return;
    const g = grid.map(row => row.map(x => ({...x})));
    g[r][c].flag = !g[r][c].flag;
    setGrid(g);
    setFlags(g.flat().filter(x => x.flag).length);
    sound.play('select');
  }

  const face = state === 'win' ? '😎' : state === 'lose' ? '💀' : '🙂';

  return (
    <div className="app-pad" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:14,
                                       background:'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(220,235,250,0.35))'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:8, borderRadius:6,
                    background:'#1a2a44', color:'#ff8a78', fontFamily:'Consolas, monospace', fontSize:20,
                    boxShadow:'inset 0 1px 3px rgba(0,0,0,0.6)', minWidth:240, justifyContent:'space-between'}}>
        <span style={{width:60, textAlign:'center', textShadow:'0 0 6px #ff8a78'}}>{(MINE_COUNT - flags).toString().padStart(3, '0')}</span>
        <button onClick={reset} style={{background:'#ffe066', border:'2px solid #1a2a44', borderRadius:6, width:32, height:32,
                                          fontSize:18, cursor:'pointer', display:'grid', placeItems:'center', padding:0}}>{face}</button>
        <span style={{width:60, textAlign:'center', textShadow:'0 0 6px #ff8a78'}}>{time.toString().padStart(3, '0')}</span>
      </div>
      <div className="mine-grid" style={{gridTemplateColumns:`repeat(${MINE_COLS}, 24px)`}}>
        {grid.map((row, r) => row.map((cell, c) => (
          <button key={`${r},${c}`}
                  className={`mine-cell ${cell.open ? 'open' : ''} ${cell.boom ? 'boom' : ''}`}
                  onClick={() => reveal(r, c)}
                  onContextMenu={(e) => flag(e, r, c)}
                  style={{padding:0}}
                  aria-label={`cell ${r}, ${c}`}>
            {cell.open
              ? (cell.mine ? '💣' : (cell.n > 0 ? <span className={`n${cell.n}`}>{cell.n}</span> : ''))
              : (cell.flag ? '🚩' : '')}
          </button>
        )))}
      </div>
      <div style={{fontSize:11, color:'#3a5680', textAlign:'center'}}>
        Click to reveal • Right-click to flag<br/>
        {state === 'win' && <b style={{color:'#1a8a4a'}}>🎉 You win!</b>}
        {state === 'lose' && <b style={{color:'#c5301a'}}>💥 Game over.</b>}
      </div>
    </div>
  );
}
regApp({
  id: 'mines',
  name: 'Minesweeper',
  icon: window.AldenOS.Icons.Clover,
  defaultSize: { w: 320, h: 420 },
  onDesktop: true,
  render: () => <MinesApp />,
});

/* ===================================================================
   SNAKE
   =================================================================== */
const SNAKE_KEY = 'aldenos.snake.hi';
function SnakeApp() {
  const { sound } = useOS2();
  const canvasRef = uR(null);
  const stateRef = uR(null);
  const [score, setScore] = uS(0);
  const [hi, setHi] = uS(() => +(localStorage.getItem(SNAKE_KEY) || 0));
  const [running, setRunning] = uS(false);
  const [gameOver, setGameOver] = uS(false);
  const [speed, setSpeed] = uS(7); // cells per second

  function init() {
    const CELL = 16, COLS = 22, ROWS = 16;
    stateRef.current = {
      CELL, COLS, ROWS,
      snake: [{x:10, y:8}, {x:9, y:8}, {x:8, y:8}],
      dir: {x:1, y:0},
      nextDir: {x:1, y:0},
      food: {x:14, y:8},
      acc: 0,
      last: 0,
    };
    setScore(0);
    setGameOver(false);
  }
  uE(() => { init(); }, []);

  uE(() => {
    if (!running) return;
    let raf;
    function loop(ts) {
      const s = stateRef.current;
      if (!s.last) s.last = ts;
      const dt = (ts - s.last) / 1000;
      s.last = ts;
      s.acc += dt;
      const stepDur = 1 / speed;
      while (s.acc >= stepDur) {
        s.acc -= stepDur;
        step(s);
        if (gameOver) break;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, gameOver]);

  function step(s) {
    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= s.COLS || head.y >= s.ROWS ||
        s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      setGameOver(true);
      setRunning(false);
      sound.play('boom');
      setHi(prev => {
        const next = Math.max(prev, score);
        localStorage.setItem(SNAKE_KEY, next);
        return next;
      });
      return;
    }
    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      setScore(sc => sc + 1);
      sound.play('select');
      // new food
      while (true) {
        const fx = Math.floor(Math.random() * s.COLS);
        const fy = Math.floor(Math.random() * s.ROWS);
        if (!s.snake.some(seg => seg.x === fx && seg.y === fy)) {
          s.food = { x: fx, y: fy };
          break;
        }
      }
    } else {
      s.snake.pop();
    }
  }

  function draw() {
    const s = stateRef.current;
    const c = canvasRef.current;
    if (!c || !s) return;
    const ctx = c.getContext('2d');
    // background — Frutiger sky
    const grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, '#b6dffd');
    grad.addColorStop(1, '#d6f0ce');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    for (let x = 0; x < c.width; x += s.CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
    }
    for (let y = 0; y < c.height; y += s.CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
    }
    // food (glossy bubble)
    const fx = s.food.x * s.CELL + s.CELL / 2;
    const fy = s.food.y * s.CELL + s.CELL / 2;
    const fr = s.CELL / 2 - 1;
    const fGrad = ctx.createRadialGradient(fx - 3, fy - 3, 1, fx, fy, fr);
    fGrad.addColorStop(0, '#fff');
    fGrad.addColorStop(0.4, '#ff9aa2');
    fGrad.addColorStop(1, '#c5301a');
    ctx.fillStyle = fGrad;
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
    // snake (glossy)
    s.snake.forEach((seg, i) => {
      const x = seg.x * s.CELL + 1;
      const y = seg.y * s.CELL + 1;
      const w = s.CELL - 2;
      const gr = ctx.createLinearGradient(x, y, x, y + w);
      gr.addColorStop(0, i === 0 ? '#9aff8a' : '#7ce86a');
      gr.addColorStop(1, '#2a8a1a');
      ctx.fillStyle = gr;
      ctx.beginPath();
      const r = 4;
      ctx.roundRect ? ctx.roundRect(x, y, w, w, r) : ctx.rect(x, y, w, w);
      ctx.fill();
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + 3, w/3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  uE(() => {
    function onKey(e) {
      if (!stateRef.current) return;
      const s = stateRef.current;
      const k = e.key;
      const dir =
        (k === 'ArrowUp' || k === 'w') ? {x:0, y:-1} :
        (k === 'ArrowDown' || k === 's') ? {x:0, y:1} :
        (k === 'ArrowLeft' || k === 'a') ? {x:-1, y:0} :
        (k === 'ArrowRight' || k === 'd') ? {x:1, y:0} : null;
      if (dir && !(dir.x === -s.dir.x && dir.y === -s.dir.y)) {
        s.nextDir = dir;
        e.preventDefault();
      }
      if (k === ' ') { setRunning(r => !r); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function start() {
    if (gameOver) init();
    setRunning(true);
    sound.play('open');
  }
  function pause() { setRunning(false); sound.play('click'); }
  function restart() { init(); setRunning(false); sound.play('click'); draw(); }

  uE(() => { setTimeout(draw, 0); }, []); // initial draw

  // touch dir buttons for mobile
  function setDir(d) {
    if (!stateRef.current) return;
    const cur = stateRef.current.dir;
    if (d.x === -cur.x && d.y === -cur.y) return;
    stateRef.current.nextDir = d;
  }

  return (
    <div className="app-pad" style={{padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
      <div style={{display:'flex', gap:14, fontSize:12, color:'#0c2a55'}}>
        <span><b>Score:</b> {score}</span>
        <span><b>Best:</b> {hi}</span>
        <span><b>Speed:</b> {speed}</span>
      </div>
      <canvas ref={canvasRef} width={22*16} height={16*16}
              style={{borderRadius:8, border:'1px solid rgba(0,30,80,0.3)',
                       boxShadow:'0 6px 16px rgba(0,30,80,0.2), inset 0 0 0 1px rgba(255,255,255,0.6)',
                       background:'#b6dffd', maxWidth:'100%'}} />
      <div style={{display:'flex', gap:6, alignItems:'center'}}>
        {!running
          ? <button className="btn primary" onClick={start}>{gameOver ? 'Play again' : '▶ Play'}</button>
          : <button className="btn" onClick={pause}>⏸ Pause</button>}
        <button className="btn tiny" onClick={restart}>↻ Reset</button>
        <span style={{display:'inline-flex', alignItems:'center', gap:4, marginLeft:6}}>
          <span style={{fontSize:11, color:'#3a5680'}}>Speed</span>
          <input className="range" type="range" min="4" max="14" value={speed} onChange={e=>setSpeed(+e.target.value)} style={{width:80}} />
        </span>
      </div>
      <div style={{fontSize:11, color:'#3a5680', textAlign:'center'}}>
        <span className="kbd">← ↑ → ↓</span> to steer • <span className="kbd">Space</span> to pause
      </div>
      {/* touch dpad */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, maxWidth:160}}>
        <span></span>
        <button className="btn" onTouchStart={()=>setDir({x:0,y:-1})}>▲</button>
        <span></span>
        <button className="btn" onTouchStart={()=>setDir({x:-1,y:0})}>◀</button>
        <span></span>
        <button className="btn" onTouchStart={()=>setDir({x:1,y:0})}>▶</button>
        <span></span>
        <button className="btn" onTouchStart={()=>setDir({x:0,y:1})}>▼</button>
        <span></span>
      </div>
    </div>
  );
}
regApp({
  id: 'snake',
  name: 'Snake',
  icon: window.AldenOS.Icons.Snake,
  defaultSize: { w: 420, h: 540 },
  onDesktop: true,
  render: () => <SnakeApp />,
});

Object.assign(window, { MusicApp, MSNApp, MinesApp, SnakeApp });
