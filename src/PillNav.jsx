import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './PillNav.css';

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
  const circleRefs   = useRef([]);
  const tlRefs       = useRef([]);
  const activeTweens = useRef([]);
  const logoRef      = useRef(null);
  const navItemsRef  = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
    document.fonts?.ready?.then(layout).catch(() => {});

    if (mobileMenuRef.current)
      gsap.set(mobileMenuRef.current, { visibility: 'hidden', opacity: 0 });

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.fromTo(logoRef.current, { scale: 0 }, { scale: 1, duration: 0.5, ease });
      }
      if (navItemsRef.current) {
        gsap.fromTo(navItemsRef.current, { width: 0, overflow: 'hidden' }, { width: 'auto', duration: 0.55, ease });
      }
    }
    return () => window.removeEventListener('resize', layout);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweens.current[i]?.kill();
    activeTweens.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweens.current[i]?.kill();
    activeTweens.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
  };

  const toggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    setIsMobileMenuOpen(next);
    const lines = hamburgerRef.current?.querySelectorAll('.hamburger-line');
    if (lines) {
      if (next) {
        gsap.to(lines[0], { rotation: 45,  y:  3, duration: 0.3, ease });
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

  const cssVars = {
    '--base':       baseColor,
    '--pill-bg':    pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text':  pillTextColor,
  };

  return (
    <>
      <div className="pill-nav-glass-wrap">
        <div className="pill-nav-container">
          <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
            {/* logo badge */}
            <a className="pill-logo" href="#" ref={logoRef} aria-label="Home">
              {logoText}
            </a>

            {/* desktop pill strip */}
            <div className="pill-nav-items desktop-only" ref={navItemsRef}>
              <ul className="pill-list" role="menubar">
                {items.map((item, i) => (
                  <li key={item.label} role="none">
                    <a
                      role="menuitem"
                      href={item.href}
                      className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      <span className="hover-circle" aria-hidden="true" ref={el => { circleRefs.current[i] = el; }} />
                      <span className="label-stack">
                        <span className="pill-label">{item.label}</span>
                        <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* desktop CTA */}
            <a href={ctaHref} className="pill-cta desktop-only">{ctaLabel}</a>

            {/* mobile hamburger */}
            <button className="mobile-menu-button mobile-only" onClick={toggleMobileMenu} ref={hamburgerRef} aria-label="Toggle menu">
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </nav>
        </div>
      </div>

      {/* mobile glass popover */}
      <div className="mobile-menu-popover" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.label}>
              <a href={item.href} className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a href={ctaHref} className="mobile-menu-link" style={{ fontWeight: 600 }}>Book a repair</a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default PillNav;
