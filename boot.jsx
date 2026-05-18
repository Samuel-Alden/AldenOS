// boot.jsx — wait for BIOS to complete, then mount the OS
const { OS } = window.AldenOS;

function mountOS() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<OS />);
}

if (sessionStorage.getItem('aldenos.bootDone') === '1') {
  // already booted this session — skipped BIOS — mount on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountOS);
  } else {
    mountOS();
  }
} else {
  // mount AFTER the BIOS finishes
  window.addEventListener('aldenos:boot-complete', mountOS, { once: true });
}
