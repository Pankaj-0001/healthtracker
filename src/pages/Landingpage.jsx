import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Intersection observer fade-in hook ──────────────────────────
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

// ─── Animated counter ─────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(ease * to));
        if (p < 1) requestAnimationFrame(step); else setVal(to);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── FAQ item ─────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #EAEAEA' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontFamily: "'Newsreader', serif", fontSize: 17, color: '#111111', letterSpacing: '-0.01em' }}>{q}</span>
        <span style={{
          width: 24, height: 24, borderRadius: 4, border: '1px solid #EAEAEA',
          background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontFamily: 'monospace', fontSize: 18, color: '#787774',
          transition: 'all 0.2s',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p style={{ paddingBottom: 22, fontSize: 15, color: '#787774', lineHeight: 1.7, maxWidth: 640 }}>{a}</p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const heroRef    = useRef(null);
  const featRef    = useFadeIn(0.1);
  const howRef     = useFadeIn(0.1);
  const macroRef   = useFadeIn(0.1);
  const statsRef   = useFadeIn(0.1);
  const faqRef     = useFadeIn(0.1);
  const ctaRef     = useFadeIn(0.1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Instrument Sans', 'Helvetica Neue', sans-serif; background: #FBFBFA; color: #111111; overflow-x: hidden; }

        /* Fade-in observer */
        .reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: none; }
        .reveal-child { opacity: 0; transform: translateY(14px); animation: none; }
        .visible .reveal-child { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp { to { opacity: 1; transform: none; } }

        /* Navbar */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(251,251,250,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #EAEAEA;
          padding: 14px 48px;
        }
        .nav-logo { font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #111111; }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-links a { font-size: 14px; font-weight: 500; color: #787774; text-decoration: none; transition: color 0.18s; }
        .nav-links a:hover { color: #111111; }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .btn-ghost-sm {
          background: none; border: 1px solid #EAEAEA; border-radius: 6px;
          padding: 8px 16px; font-size: 13px; font-weight: 500; color: #787774;
          cursor: pointer; transition: all 0.18s; font-family: inherit;
        }
        .btn-ghost-sm:hover { border-color: #111111; color: #111111; }
        .btn-solid-sm {
          background: #111111; border: 1px solid #111111; border-radius: 6px;
          padding: 8px 18px; font-size: 13px; font-weight: 600; color: #FFFFFF;
          cursor: pointer; transition: all 0.18s; font-family: inherit;
        }
        .btn-solid-sm:hover { background: #333333; }
        .btn-solid-sm:active { transform: scale(0.98); }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 140px 24px 100px;
          position: relative; overflow: hidden;
          background: #FBFBFA;
        }
        .hero-ambient {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 60% 50% at 70% 20%, rgba(52,101,56,0.03) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 20% 80%, rgba(52,101,56,0.02) 0%, transparent 70%);
          animation: drift 28s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(0, 0); }
          to   { transform: translate(16px, -12px); }
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1px solid #EAEAEA; border-radius: 9999px;
          padding: 5px 14px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; color: #346538;
          background: #EDF3EC; margin-bottom: 32px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
          position: relative; z-index: 1;
        }
        .hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #346538; }
        .hero-h1 {
          font-family: 'Newsreader', serif;
          font-size: clamp(48px, 7.5vw, 92px);
          font-weight: 300;
          line-height: 1.03;
          letter-spacing: -0.03em;
          color: #111111;
          max-width: 820px;
          margin-bottom: 28px;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
          position: relative; z-index: 1;
        }
        .hero-h1 em { font-style: italic; color: #346538; }
        .hero-sub {
          font-size: 17px; line-height: 1.7; color: #787774;
          max-width: 500px; margin-bottom: 48px;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both;
          position: relative; z-index: 1;
        }
        .hero-cta {
          display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.26s both;
          position: relative; z-index: 1; margin-bottom: 80px;
        }
        .btn-hero-solid {
          background: #111111; color: #FFFFFF; border: 1px solid #111111;
          border-radius: 6px; padding: 13px 32px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.18s; font-family: inherit;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-hero-solid:hover { background: #2F3437; }
        .btn-hero-solid:active { transform: scale(0.98); }
        .btn-hero-outline {
          background: transparent; color: #111111; border: 1px solid #EAEAEA;
          border-radius: 6px; padding: 13px 28px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.18s; font-family: inherit;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-hero-outline:hover { border-color: #787774; }

        /* Dashboard mockup */
        .mockup-wrap {
          width: 100%; max-width: 820px; margin: 0 auto 0;
          animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.34s both;
          position: relative; z-index: 1;
        }
        .mockup-chrome {
          background: #FFFFFF;
          border: 1px solid #EAEAEA;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);
        }
        .mockup-titlebar {
          background: #F7F6F3; border-bottom: 1px solid #EAEAEA;
          padding: 10px 16px; display: flex; align-items: center; gap: 8px;
        }
        .wc { width: 11px; height: 11px; border-radius: 50%; }
        .mockup-url {
          flex: 1; text-align: center;
          font-family: 'Geist Mono', 'SF Mono', monospace; font-size: 11px; color: #787774;
        }
        .mockup-body { padding: 24px; background: #FBFBFA; }
        .mockup-greeting { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #787774; margin-bottom: 4px; }
        .mockup-name { font-family: 'Newsreader', serif; font-size: 26px; font-weight: 300; color: #111111; margin-bottom: 20px; }
        .mockup-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
        .mockup-stat {
          background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 8px;
          padding: 14px 16px;
        }
        .mockup-stat-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #787774; margin-bottom: 6px; }
        .mockup-stat-val { font-family: 'Newsreader', serif; font-size: 24px; font-weight: 400; color: #111111; line-height: 1; }
        .mockup-stat-unit { font-size: 10px; color: #787774; margin-top: 2px; }
        .mockup-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mockup-panel { background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 8px; padding: 16px; }
        .mockup-panel-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #787774; margin-bottom: 12px; }
        .mockup-bars { display: flex; flex-direction: column; gap: 8px; }
        .mockup-bar-row { display: flex; align-items: center; gap: 10px; }
        .mockup-bar-name { font-size: 11px; color: #787774; width: 52px; flex-shrink: 0; }
        .mockup-bar-track { flex: 1; height: 4px; background: #F7F6F3; border-radius: 2px; overflow: hidden; }
        .mockup-bar-fill { height: 100%; border-radius: 2px; background: #346538; }
        .mockup-score-ring {
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 6px; padding: 8px;
        }
        .mockup-score-num { font-family: 'Newsreader', serif; font-size: 40px; font-weight: 300; color: #111111; line-height: 1; }
        .mockup-score-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #787774; }

        /* Divider */
        .section-divider { border: none; border-top: 1px solid #EAEAEA; margin: 0; }

        /* Sections */
        .section { padding: 100px 48px; max-width: 1100px; margin: 0 auto; }
        .section-sm { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
        .section-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #346538; margin-bottom: 16px; display: block;
        }
        .section-h2 {
          font-family: 'Newsreader', serif;
          font-size: clamp(30px, 3.5vw, 48px);
          font-weight: 300; letter-spacing: -0.025em; line-height: 1.1;
          color: #111111; margin-bottom: 16px;
        }
        .section-h2 em { font-style: italic; }
        .section-sub { font-size: 16px; color: #787774; line-height: 1.7; max-width: 500px; }

        /* Bento feature grid */
        .bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto auto;
          gap: 12px;
          margin-top: 56px;
        }
        .bento-card {
          background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px;
          padding: 32px; transition: box-shadow 0.2s ease;
          --index: 0;
        }
        .bento-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .bento-card.wide { grid-column: span 2; }
        .bento-card.tall { grid-row: span 2; }
        .bento-icon {
          width: 36px; height: 36px; border-radius: 8px; border: 1px solid #EAEAEA;
          background: #F7F6F3; display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .bento-card h3 { font-size: 15px; font-weight: 600; color: #111111; margin-bottom: 8px; }
        .bento-card p { font-size: 13px; color: #787774; line-height: 1.65; }
        .bento-tag {
          display: inline-block; border-radius: 9999px; padding: 3px 10px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 14px;
        }

        /* How it works */
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 56px; }
        .step { padding: 32px 28px 32px 0; border-right: 1px solid #EAEAEA; }
        .step:last-child { border-right: none; padding-right: 0; }
        .step:not(:first-child) { padding-left: 28px; }
        .step-num {
          font-family: 'Newsreader', serif; font-size: 13px; font-style: italic;
          color: #787774; margin-bottom: 16px; display: block;
        }
        .step-title { font-size: 15px; font-weight: 600; color: #111111; margin-bottom: 8px; }
        .step-desc { font-size: 13px; color: #787774; line-height: 1.65; }
        .step-kbd {
          display: inline-block; margin-top: 14px;
          font-family: 'Geist Mono', 'SF Mono', monospace; font-size: 11px;
          color: #787774; background: #F7F6F3; border: 1px solid #EAEAEA;
          border-radius: 4px; padding: 3px 8px;
        }

        /* Stats bar */
        .stats-bar {
          background: #111111; border-radius: 12px; padding: 48px 56px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 0;
        }
        .stat-item { border-right: 1px solid rgba(255,255,255,0.08); padding: 0 32px; }
        .stat-item:first-child { padding-left: 0; }
        .stat-item:last-child { border-right: none; }
        .stat-val { font-family: 'Newsreader', serif; font-size: 44px; font-weight: 300; color: #FFFFFF; line-height: 1; }
        .stat-lbl { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.45); margin-top: 6px; }

        /* Nutrition table */
        .nutrient-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
        .nutrient-table th {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #787774; text-align: left; padding: 0 0 14px; border-bottom: 1px solid #EAEAEA;
        }
        .nutrient-table td { padding: 14px 0; border-bottom: 1px solid #EAEAEA; font-size: 14px; }
        .nutrient-table tr:last-child td { border-bottom: none; }
        .nt-name { font-weight: 500; color: #111111; }
        .nt-val { color: #111111; font-family: 'Geist Mono', 'SF Mono', monospace; font-size: 13px; }
        .nt-bar-cell { width: 38%; }
        .nt-bar { height: 3px; background: #EAEAEA; border-radius: 2px; overflow: hidden; }
        .nt-bar-fill { height: 100%; border-radius: 2px; }
        .nt-badge { display: inline-block; border-radius: 9999px; padding: 2px 9px; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }

        /* FAQ */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 80px; margin-top: 56px; }

        /* CTA section */
        .cta-section {
          background: #F7F6F3; border-top: 1px solid #EAEAEA; border-bottom: 1px solid #EAEAEA;
          padding: 100px 48px; text-align: center; position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(52,101,56,0.03) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-h2 { font-family: 'Newsreader', serif; font-size: clamp(32px, 4vw, 56px); font-weight: 300; letter-spacing: -0.025em; color: #111111; margin-bottom: 20px; }
        .cta-h2 em { font-style: italic; }
        .cta-sub { font-size: 16px; color: #787774; margin-bottom: 44px; line-height: 1.7; }

        /* Footer */
        footer { padding: 40px 48px; border-top: 1px solid #EAEAEA; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #111111; }
        .footer-copy { font-size: 12px; color: #787774; }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-size: 12px; color: #787774; text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: #111111; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav.scrolled { padding: 12px 20px; }
          .nav-links { display: none; }
          .section, .section-sm { padding: 72px 20px; }
          .bento { grid-template-columns: 1fr; }
          .bento-card.wide { grid-column: span 1; }
          .steps { grid-template-columns: 1fr 1fr; }
          .step { border-right: none; border-bottom: 1px solid #EAEAEA; padding: 24px 0; }
          .step:not(:first-child) { padding-left: 0; }
          .stats-bar { grid-template-columns: 1fr 1fr; padding: 36px 28px; gap: 28px; }
          .stat-item { border-right: none; padding: 0; }
          .faq-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 72px 20px; }
          footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
          .mockup-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Ambient background */}
      <div className="hero-ambient" />

      {/* ── Navbar ── */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-logo">Health<span style={{ color: '#346538' }}>Tracker</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#nutrition">Nutrition</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost-sm" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-solid-sm" onClick={() => navigate('/register')}>Get started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-tag">
          <div className="hero-tag-dot" />
          AI-powered nutrition intelligence
        </div>
        <h1 className="hero-h1">
          Know exactly what<br />
          your body <em>needs</em> today.
        </h1>
        <p className="hero-sub">
          Log your meals in plain language. Get a science-backed diet score,
          macro breakdown, and personalised food recommendations — instantly.
        </p>
        <div className="hero-cta">
          <button className="btn-hero-solid" onClick={() => navigate('/register')}>
            Start tracking free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button className="btn-hero-outline" onClick={() => navigate('/login')}>
            Sign in to dashboard
          </button>
        </div>

        {/* Dashboard mockup */}
        <div className="mockup-wrap">
          <div className="mockup-chrome">
            <div className="mockup-titlebar">
              <div className="wc" style={{ background: '#FFBD2E' }} />
              <div className="wc" style={{ background: '#27C93F' }} />
              <div className="wc" style={{ background: '#FF6058' }} />
              <div className="mockup-url">healthtracker.app / dashboard</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-greeting">Monday, 27 January</div>
              <div className="mockup-name">Good morning, Pankaj.</div>
              <div className="mockup-grid">
                {[
                  { lbl: "Today's Score", val: "84", unit: "out of 100" },
                  { lbl: "Calories",  val: "1,840", unit: "/ 2,200 kcal" },
                  { lbl: "Protein",   val: "98",    unit: "/ 140 g" },
                  { lbl: "Records",   val: "23",    unit: "total logged" },
                ].map(s => (
                  <div className="mockup-stat" key={s.lbl}>
                    <div className="mockup-stat-lbl">{s.lbl}</div>
                    <div className="mockup-stat-val">{s.val}</div>
                    <div className="mockup-stat-unit">{s.unit}</div>
                  </div>
                ))}
              </div>
              <div className="mockup-bottom">
                <div className="mockup-panel">
                  <div className="mockup-panel-lbl">Today's Macros</div>
                  <div className="mockup-bars">
                    {[
                      { name: 'Calories', pct: 84, color: '#346538' },
                      { name: 'Protein',  pct: 70, color: '#1F6C9F' },
                      { name: 'Carbs',    pct: 91, color: '#956400' },
                      { name: 'Fats',     pct: 65, color: '#9F2F2D' },
                    ].map(b => (
                      <div className="mockup-bar-row" key={b.name}>
                        <div className="mockup-bar-name">{b.name}</div>
                        <div className="mockup-bar-track">
                          <div className="mockup-bar-fill" style={{ width: b.pct + '%', background: b.color }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#787774', width: 28, textAlign: 'right', fontFamily: 'monospace' }}>{b.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mockup-panel">
                  <div className="mockup-panel-lbl">Diet Score</div>
                  <div className="mockup-score-ring">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#F7F6F3" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#346538" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={2*Math.PI*34}
                        strokeDashoffset={2*Math.PI*34*(1-0.84)}
                        transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ marginTop: -8 }}>
                      <div className="mockup-score-num">84</div>
                      <div className="mockup-score-lbl">Excellent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Stats bar ── */}
      <div style={{ padding: '0 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div ref={statsRef} className={`stats-bar reveal`} style={{ marginTop: 56, marginBottom: 56 }}>
          {[
            { val: 500, suffix: '+', lbl: 'Indian food items in database' },
            { val: 99,  suffix: '%', lbl: 'Uptime during testing' },
            { val: 2,   suffix: 's', lbl: 'Average AI analysis time' },
            { val: 100, suffix: '',  lbl: 'Diet score scale — clear & simple' },
          ].map((s, i) => (
            <div key={i} className="stat-item" style={{ '--index': i }}>
              <div className="stat-val"><Counter to={s.val} suffix={s.suffix} /></div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="section-divider" />

      {/* ── Features (Bento) ── */}
      <div id="features" className="section">
        <div ref={featRef} className="reveal">
          <span className="section-eyebrow">Features</span>
          <h2 className="section-h2">Built for people who<br /><em>want to understand</em> their food.</h2>
          <p className="section-sub">No calorie counting app obsession. Just clear data about what you eat and what your body needs.</p>

          <div className="bento">
            {/* Big card */}
            <div className="bento-card wide reveal-child" style={{ '--index': 0 }}>
              <div className="bento-tag" style={{ background: '#EDF3EC', color: '#346538' }}>AI-Powered</div>
              <div className="bento-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </div>
              <h3>Natural language meal logging</h3>
              <p>Type "2 rotis with dal and sabzi" or pick from our portion picker. The Gemini AI model understands Indian meals, portion descriptions, and mixed dishes — no barcode scanning required.</p>
            </div>

            <div className="bento-card reveal-child" style={{ '--index': 1 }}>
              <div className="bento-tag" style={{ background: '#E1F3FE', color: '#1F6C9F' }}>Science-backed</div>
              <div className="bento-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F6C9F" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-4 4"/></svg>
              </div>
              <h3>Mifflin-St Jeor targets</h3>
              <p>Daily calorie and macro targets computed from your BMR, activity level, and goal — recalculated instantly when you update your profile.</p>
            </div>

            <div className="bento-card reveal-child" style={{ '--index': 2 }}>
              <div className="bento-tag" style={{ background: '#FBF3DB', color: '#956400' }}>Scoring</div>
              <div className="bento-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#956400" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3>Diet score 0–100</h3>
              <p>A single, clear number that tells you how complete and balanced your day's nutrition was. No cryptic charts to decode.</p>
            </div>

            <div className="bento-card reveal-child" style={{ '--index': 3 }}>
              <div className="bento-tag" style={{ background: '#EDF3EC', color: '#346538' }}>Trends</div>
              <div className="bento-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <h3>Weekly reports with AI insights</h3>
              <p>Select any date range. See your score trend, daily macros, and a Gemini-written paragraph summarising your week's patterns.</p>
            </div>

            <div className="bento-card reveal-child" style={{ '--index': 4 }}>
              <div className="bento-tag" style={{ background: '#FDEBEC', color: '#9F2F2D' }}>Recommendations</div>
              <div className="bento-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9F2F2D" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
              <h3>Deficiency recommendations</h3>
              <p>After each log, the system identifies gaps in your macros and suggests specific foods with quantities to fill them.</p>
            </div>

            <div className="bento-card reveal-child" style={{ '--index': 5 }}>
              <div className="bento-tag" style={{ background: '#E1F3FE', color: '#1F6C9F' }}>Database</div>
              <div className="bento-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F6C9F" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <h3>500+ Indian food items</h3>
              <p>Roti, dal, sabzi, biryani, paneer, dosa — searchable by name with full macro breakdown per serving.</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      {/* ── How it works ── */}
      <div id="how-it-works" style={{ background: '#FBFBFA' }}>
        <div className="section">
          <div ref={howRef} className="reveal">
            <span className="section-eyebrow">How it works</span>
            <h2 className="section-h2">Four steps.<br /><em>Full nutritional clarity.</em></h2>

            <div className="steps">
              {[
                { n: '01', title: 'Create your profile', desc: 'Enter your age, height, weight, activity level and goal. Targets are calculated immediately.', kbd: '~2 min setup' },
                { n: '02', title: 'Log your meals', desc: 'Open the journal. Pick a meal section. Search for food, choose quantity and serving type from the picker.', kbd: 'Portion picker' },
                { n: '03', title: 'Get your analysis', desc: 'Hit Analyse. Gemini AI estimates nutrition for each item, scores your day 0–100, and flags deficiencies.', kbd: 'Under 2 seconds' },
                { n: '04', title: 'Review your week', desc: 'Select a date range in Weekly Report. See trend bars, daily breakdown, and an AI-written summary.', kbd: 'Any date range' },
              ].map((s, i) => (
                <div key={i} className="step reveal-child" style={{ '--index': i }}>
                  <span className="step-num">{s.n}</span>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                  <kbd className="step-kbd">{s.kbd}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      {/* ── Nutrition breakdown ── */}
      <div id="nutrition" className="section">
        <div ref={macroRef} className="reveal">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'flex-start' }}>
            <div>
              <span className="section-eyebrow">Nutrition tracking</span>
              <h2 className="section-h2">Every macro.<br /><em>Every micronutrient.</em></h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                The system tracks eight key nutritional dimensions per meal and compares them
                against your personalised daily targets. Deficiencies are surfaced immediately
                after each log.
              </p>
            </div>
            <div>
              <table className="nutrient-table">
                <thead>
                  <tr>
                    <th>Nutrient</th>
                    <th>Sample target</th>
                    <th className="nt-bar-cell">Coverage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Calories',      val: '2,200 kcal', pct: 84, color: '#346538', status: 'Optimal',    sbg: '#EDF3EC', stxt: '#346538' },
                    { name: 'Protein',       val: '140 g',      pct: 70, color: '#1F6C9F', status: 'Low',        sbg: '#FBF3DB', stxt: '#956400' },
                    { name: 'Carbohydrates', val: '275 g',      pct: 91, color: '#956400', status: 'Optimal',    sbg: '#EDF3EC', stxt: '#346538' },
                    { name: 'Fats',          val: '73 g',       pct: 65, color: '#9F2F2D', status: 'Low',        sbg: '#FBF3DB', stxt: '#956400' },
                    { name: 'Fiber',         val: '30 g',       pct: 55, color: '#787774', status: 'Deficient',  sbg: '#FDEBEC', stxt: '#9F2F2D' },
                  ].map((n, i) => (
                    <tr key={i}>
                      <td className="nt-name">{n.name}</td>
                      <td className="nt-val">{n.val}</td>
                      <td className="nt-bar-cell">
                        <div className="nt-bar">
                          <div className="nt-bar-fill" style={{ width: n.pct + '%', background: n.color }} />
                        </div>
                      </td>
                      <td>
                        <span className="nt-badge" style={{ background: n.sbg, color: n.stxt }}>{n.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: '#787774', marginTop: 12 }}>
                * Sample data for a 70 kg male, Moderate activity, Maintenance goal.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      {/* ── FAQ ── */}
      <div id="faq" style={{ background: '#FBFBFA' }}>
        <div className="section-sm">
          <div ref={faqRef} className="reveal">
            <span className="section-eyebrow">FAQ</span>
            <h2 className="section-h2">Common questions.</h2>

            <div className="faq-grid">
              <div>
                {[
                  { q: 'Is the calorie data accurate for Indian food?', a: 'The system uses the Gemini AI model which has been trained on a wide range of Indian foods. Accuracy is high for common dishes. For very specific regional recipes, we recommend describing ingredients individually for a more precise estimate.' },
                  { q: 'Do I need to count calories manually?', a: 'No. You describe what you ate in natural language — "2 medium rotis with dal" — and the AI estimates the nutritional content. The portion picker ensures you never have to type a number unless you want to.' },
                  { q: 'How is my diet score calculated?', a: 'The score is a weighted average of how closely your consumed macros match your personalised targets. Calories carry 30%, protein 25%, carbs 20%, fats 15%, fiber 10%. Overconsumption is penalised.' },
                ].map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
              </div>
              <div>
                {[
                  { q: 'What happens when I update my weight or goal?', a: 'Your daily nutrition targets are immediately recalculated using the Mifflin-St Jeor equation. The new targets apply to all future analyses. Historical records are not retroactively changed.' },
                  { q: 'Can I view reports for any date range?', a: 'Yes. The weekly report page has a From/To date picker. You can select any historical range and the system will aggregate all records within it, including an AI-written insight paragraph.' },
                  { q: 'Is my data private?', a: 'All data is stored in your account only. API endpoints are protected by JWT authentication. Passwords are hashed with BCrypt. No data is shared with third parties.' },
                ].map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      {/* ── CTA ── */}
      <div ref={ctaRef} className="reveal">
        <div className="cta-section">
          <h2 className="cta-h2">Start understanding<br /><em>what you eat.</em></h2>
          <p className="cta-sub">Free to use. No subscriptions. Just honest nutrition data.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-hero-solid" onClick={() => navigate('/register')}>
              Create your account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn-hero-outline" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
          <p style={{ marginTop: 28, fontSize: 12, color: '#787774' }}>
            Built by Pankaj Upadhyay, Naman Soni &amp; Priyanshu Pandey &mdash; ADGIPS, 2025
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer>
        <div className="footer-logo">HealthTracker</div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <span style={{ fontSize: 12, color: '#787774', cursor: 'pointer' }} onClick={() => navigate('/login')}>Dashboard</span>
        </div>
        <div className="footer-copy">Department of Information Technology, ADGIPS &mdash; 2025</div>
      </footer>
    </>
  );
}