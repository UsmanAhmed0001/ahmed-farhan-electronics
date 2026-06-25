import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './PillNav.css';

const SERVICES_MENU = {
  col1: {
    heading: 'AC Services',
    items: [
      { label: 'AC Service & Deep Cleaning', desc: 'Coil cleaning and full tune-ups' },
      { label: 'Gas Refilling (R-22, R-410A)', desc: 'Leak detection and refrigerant top-up' },
      { label: 'Installation & Shifting', desc: 'Professional mounting and relocation' },
    ],
  },
  col2: {
    heading: 'Refrigeration & TV',
    items: [
      { label: 'Refrigerator Repair', desc: 'Compressor, thermostat and cooling faults' },
      { label: 'Deep & Chest Freezers', desc: 'Commercial and home freezer servicing' },
      { label: 'LED TV Repair', desc: 'Panel, power supply and display issues' },
    ],
  },
};

const RESOURCES_MENU = [
  { label: 'Blogs', desc: 'Tips, guides and AC maintenance advice' },
  { label: 'Error Codes', desc: 'AC and refrigeration fault code lookup' },
];

const PillNav = ({
  logoText = 'AF',
  items,
  ctaLabel = 'Book a repair',
  ctaHref = 'https://wa.me/923333078697',
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#1b1b1a',
  pillColor = 'rgba(0,0,0,0.06)',
  hoveredPillTextColor = '#f6f5f1',
  pillTextColor = '#1b1b1a',
  initialLoadAnimation = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'services' | 'resources' | null
  const circleRefs    = useRef([]);
  const tlRefs        = useRef([]);
  const logoRef       = useRef(null);
  const navItemsRef   = useRef(null);
  const hamburgerRef  = useRef(null);
  const mobileMenuRef = useRef(null);
  const dropdownRef   = useRef(null);
  const closeTimer    = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement;
        const { width: w, height: h } = pill.getBoundingClientRect();
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;
        circle.style.width  = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });
        const label = pill.querySelector('.pill-label');
        const hover = pill.querySelector('.pill-label-hover');
        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });
        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };
    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
  }, [items, ease]);

  useEffect(() => {
    if (!initialLoadAnimation) return;
    const els = [logoRef.current, navItemsRef.current, hamburgerRef.current].filter(Boolean);
    gsap.fromTo(els, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out', delay: 0.2 });
  }, [initialLoadAnimation]);

  const handleEnter = i => { tlRefs.current[i]?.play(); };
  const handleLeave = i => { tlRefs.current[i]?.reverse(); };

  const openMenu = key => {
    clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  const toggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    setIsMobileMenuOpen(next);
    const ham = hamburgerRef.current;
    if (ham) {
      const lines = ham.querySelectorAll('.hamburger-line');
      if (next) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }
    const menu = mobileMenuRef.current;
    if (menu) {
      if (next) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(menu, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease });
      } else {
        gsap.to(menu, { opacity: 0, y: 8, duration: 0.2, ease, onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
      }
    }
  };

  const cssVars = { '--base': baseColor, '--pill-bg': pillColor, '--hover-text': hoveredPillTextColor, '--pill-text': pillTextColor };

  return (
    <>
      <div className="pill-nav-glass-wrap" style={{ zIndex: 50 }}>
        <div className="pill-nav-container">
          <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
            <a className="pill-logo" href="#" ref={logoRef} aria-label="Home">{logoText}</a>

            <div className="pill-nav-items desktop-only" ref={navItemsRef}>
              <ul className="pill-list" role="menubar">
                {items.map((item, i) => {
                  const isServices  = item.label === 'Services';
                  const isResources = item.label === 'Resources';
                  const key = isServices ? 'services' : isResources ? 'resources' : null;
                  return (
                    <li key={item.label} role="none" style={{ position: 'relative' }}>
                      <a
                        role="menuitem"
                        href={item.href}
                        className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                        onMouseEnter={() => { handleEnter(i); if (key) openMenu(key); }}
                        onMouseLeave={() => { handleLeave(i); if (key) scheduleClose(); }}
                        onClick={e => key && e.preventDefault()}
                      >
                        <span className="hover-circle" aria-hidden="true" ref={el => { circleRefs.current[i] = el; }} />
                        <span className="label-stack">
                          <span className="pill-label">{item.label}{key && <span style={{ marginLeft: 3, fontSize: 9, opacity: 0.6 }}>▾</span>}</span>
                          <span className="pill-label-hover" aria-hidden="true">{item.label}{key && <span style={{ marginLeft: 3, fontSize: 9 }}>▾</span>}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <a href={ctaHref} className="pill-cta desktop-only">{ctaLabel}</a>
            <button className="mobile-menu-button mobile-only" onClick={toggleMobileMenu} ref={hamburgerRef} aria-label="Toggle menu">
              <span className="hamburger-line" /><span className="hamburger-line" />
            </button>
          </nav>
        </div>

        {/* ── SERVICES MEGA-MENU ── */}
        {openDropdown === 'services' && (
          <div
            ref={dropdownRef}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={scheduleClose}
            style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              marginTop: 10, width: 600, background: '#fff',
              borderRadius: 18, boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
              padding: '28px 28px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
              zIndex: 100, animation: 'dropFadeIn 0.18s ease',
            }}
          >
            {[SERVICES_MENU.col1, SERVICES_MENU.col2].map((col, ci) => (
              <div key={ci}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8E2A33', marginBottom: 14 }}>{col.heading}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {col.items.map(it => (
                    <li key={it.label}>
                      <a href="#services" style={{ display: 'block', padding: '10px 12px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f6f5f1'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1b1b1a', fontFamily: "'Space Grotesk',sans-serif" }}>{it.label}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#79756e' }}>{it.desc}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {/* footer strip */}
            <div style={{ gridColumn: '1/-1', borderTop: '1px solid #f0ede8', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#79756e' }}>📞 Same-day service available</span>
              </div>
              <a href="https://wa.me/923333078697" style={{ fontSize: 12, fontWeight: 600, color: '#2B2F86', textDecoration: 'none' }}>WhatsApp us →</a>
            </div>
          </div>
        )}

        {/* ── RESOURCES MEGA-MENU ── */}
        {openDropdown === 'resources' && (
          <div
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={scheduleClose}
            style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              marginTop: 10, width: 300, background: '#fff',
              borderRadius: 18, boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
              padding: '20px 20px 16px', zIndex: 100, animation: 'dropFadeIn 0.18s ease',
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {RESOURCES_MENU.map(it => (
                <li key={it.label}>
                  <a href="#" style={{ display: 'block', padding: '10px 12px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f6f5f1'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1b1b1a', fontFamily: "'Space Grotesk',sans-serif" }}>{it.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#79756e' }}>{it.desc}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* mobile popover */}
      <div className="mobile-menu-popover" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.label}>
              <a href={item.href} className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
          {/* mobile resources */}
          <li><a href="#" className="mobile-menu-link" style={{ opacity: 0.6 }}>Blogs</a></li>
          <li><a href="#" className="mobile-menu-link" style={{ opacity: 0.6 }}>Error Codes</a></li>
          <li><a href={ctaHref} className="mobile-menu-link" style={{ fontWeight: 600 }}>Book a repair</a></li>
        </ul>
      </div>

      <style>{`@keyframes dropFadeIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </>
  );
};

export default PillNav;