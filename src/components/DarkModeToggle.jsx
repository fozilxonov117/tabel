import React from 'react';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" fill="#f59e0b" />
    <line x1="12" y1="2"    x2="12" y2="5"    stroke="#f59e0b" strokeWidth="2" />
    <line x1="12" y1="19"   x2="12" y2="22"   stroke="#f59e0b" strokeWidth="2" />
    <line x1="2"  y1="12"   x2="5"  y2="12"   stroke="#f59e0b" strokeWidth="2" />
    <line x1="19" y1="12"   x2="22" y2="12"   stroke="#f59e0b" strokeWidth="2" />
    <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"  stroke="#f59e0b" strokeWidth="2" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#f59e0b" strokeWidth="2" />
    <line x1="19.78" y1="4.22"  x2="17.66" y2="6.34"  stroke="#f59e0b" strokeWidth="2" />
    <line x1="6.34"  y1="17.66" x2="4.22"  y2="19.78" stroke="#f59e0b" strokeWidth="2" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#94a3b8">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function DarkModeToggle({ dark, onToggle }) {
  function handleClick(e) {
    const x = e.clientX;
    const y = e.clientY;
    const r = Math.hypot(
      Math.max(x, window.innerWidth  - x),
      Math.max(y, window.innerHeight - y),
    );

    // Capture the OLD theme's background before toggling
    const oldBg = dark ? '#0a0a0a' : '#eef0f7';

    // Toggle theme immediately — new colors are applied to the DOM right now
    onToggle();

    // Place an overlay of the OLD color covering the full screen
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      `background:${oldBg}`,
      `clip-path:circle(${r}px at ${x}px ${y}px)`,
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect();

    // Shrink the old-color overlay to zero — reveals the new theme underneath
    overlay.style.transition = 'clip-path 350ms cubic-bezier(0.4,0,0.2,1)';
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }

  return (
    <button
      onClick={handleClick}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle-btn"
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: `1px solid ${dark ? '#333' : '#cbd5e1'}`,
        background: dark ? '#1c1c1c' : '#f1f5f9',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        outline: 'none',
        padding: 0,
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
