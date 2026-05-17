// ─── Progress Ring ────────────────────────────────────────────────
export function ProgressRing({ size = 96, stroke = 7, percent = 0, color = '#004532', label, value }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, percent || 0));
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="rgba(0,69,50,0.08)" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke={color} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: size > 80 ? 14 : 11, fontWeight: 700, color: '#191c1b', lineHeight: 1 }}>{value}</div>
        {label && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6f7973', marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────
export function ScoreBadge({ score }) {
  const s = score ?? null;
  const color = s === null ? '#6f7973' : s >= 80 ? '#004532' : s >= 60 ? '#92400e' : '#ba1a1a';
  const bg = s === null ? 'rgba(111,121,115,0.1)' : s >= 80 ? 'rgba(139,214,183,0.2)' : s >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(186,26,26,0.1)';
  return (
    <span style={{ background: bg, color, borderRadius: 99, padding: '3px 11px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s !== null ? `${s}/100` : '--/100'}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────
export function Spinner({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(0,69,50,0.1)`,
      borderTopColor: '#004532',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
    }} />
  );
}

// ─── Full Page Loader ─────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size={40} />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────
export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined text-5xl text-outline-variant">{icon}</span>
      {title && <p className="text-base font-semibold text-on-surface">{title}</p>}
      {description && <p className="text-sm text-outline max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────
export function StatCard({ label, value, unit, icon, iconColor, iconBg, delay = 0 }) {
  return (
    <div className="card animate-slide-up flex flex-col gap-3" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest uppercase text-outline">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: iconColor }}>{icon}</span>
        </div>
      </div>
      <div className="text-3xl font-black leading-none" style={{ color: iconColor }}>
        {value}<span className="text-sm font-medium text-outline ml-1">{unit}</span>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold tracking-widest uppercase text-outline mb-4">{children}</p>
  );
}

// ─── Nutrient Row ─────────────────────────────────────────────────
export function NutrientRow({ label, current, target, color }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        <span className="text-xs font-semibold text-outline">{Math.round(current)} / {Math.round(target)}</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
