import { useState, useRef, useEffect } from 'react';
import { dietApi, foodApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Spinner, SectionLabel } from '../components/UI';

// ─── Constants ────────────────────────────────────────────────────
const MEAL_TYPES  = ['PRE_BREAKFAST', 'BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER', 'SNACK'];
const MEAL_LABELS = { PRE_BREAKFAST: 'Pre-Breakfast', BREAKFAST: 'Breakfast', LUNCH: 'Lunch', EVENING_SNACK: 'Evening Snack', DINNER: 'Dinner', SNACK: 'Snack' };
const MEAL_TIMES  = { PRE_BREAKFAST: '6–7 AM', BREAKFAST: '8–9 AM', LUNCH: '1–2 PM', EVENING_SNACK: '5–6 PM', DINNER: '8–9 PM', SNACK: 'Anytime' };
const MEAL_ICONS  = { PRE_BREAKFAST: 'wb_twilight', BREAKFAST: 'wb_sunny', LUNCH: 'partly_cloudy_day', EVENING_SNACK: 'local_cafe', DINNER: 'nightlight', SNACK: 'cookie' };

const PORTION_TYPES = [
  { value: 'ROTI',    label: 'Roti / Bread', icon: '🫓' },
  { value: 'KATORI',  label: 'Katori',       icon: '🥣' },
  { value: 'BOWL',    label: 'Bowl',         icon: '🍲' },
  { value: 'GLASS',   label: 'Glass / Cup',  icon: '🥛' },
  { value: 'PLATE',   label: 'Plate',        icon: '🍽️' },
  { value: 'PIECE',   label: 'Piece / Slice',icon: '🍕' },
  { value: 'SPOON',   label: 'Spoon',        icon: '🥄' },
  { value: 'HANDFUL', label: 'Handful',      icon: '🤲' },
];

const PORTION_SIZES = [
  { value: 'SMALL',       label: 'Small'   },
  { value: 'MEDIUM',      label: 'Medium'  },
  { value: 'LARGE',       label: 'Large'   },
  { value: 'EXTRA_LARGE', label: 'X-Large' },
];

function buildPortionDescription(qty, size, type) {
  const sizeWord = { SMALL: 'small', MEDIUM: 'medium', LARGE: 'large', EXTRA_LARGE: 'extra large' }[size] || 'medium';
  const typeWord = { ROTI: 'roti', KATORI: 'katori', BOWL: 'bowl', GLASS: 'glass', PLATE: 'plate', PIECE: 'piece', SPOON: 'spoon', HANDFUL: 'handful' }[type] || 'piece';
  return qty + ' ' + sizeWord + ' ' + typeWord;
}

// ─── Add Food Modal ───────────────────────────────────────────────
function AddFoodModal({ mealType, onAdd, onClose }) {
  const [step, setStep]               = useState(1);
  const [foodName, setFoodName]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [qty, setQty]                 = useState(1);
  const [size, setSize]               = useState('MEDIUM');
  const [portionType, setPortionType] = useState('KATORI');
  const searchTimer                   = useRef(null);

  async function handleSearch(q) {
    setFoodName(q);
    clearTimeout(searchTimer.current);
    if (q.length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await foodApi.search(q);
        setSuggestions(res ? res.slice(0, 7) : []);
      } catch { setSuggestions([]); }
    }, 350);
  }

  function pickSuggestion(name) {
    setFoodName(name);
    setSuggestions([]);
    setStep(2);
  }

  function handleConfirm() {
    onAdd({ mealType, foodName: foodName.trim(), portionDescription: buildPortionDescription(qty, size, portionType) });
    onClose();
  }

  const preview  = buildPortionDescription(qty, size, portionType);
  const mLabel   = MEAL_LABELS[mealType];
  const mIcon    = MEAL_ICONS[mealType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #004532 0%, #065f46 100%)' }}>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white mb-1" style={{ opacity: 0.65 }}>
              {mLabel}
            </p>
            <h3 className="text-lg font-bold text-white">
              {step === 1 ? 'Search Food Item' : 'Choose Portion'}
            </h3>
            {step === 2 && (
              <p className="text-sm text-white mt-0.5" style={{ opacity: 0.75 }}>"{foodName}"</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Step 1 – food search */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <label className="input-label">Food Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 20 }}>search</span>
                  <input
                    className="input pl-10"
                    placeholder="e.g. Roti, Dal, Chicken Curry..."
                    value={foodName}
                    autoFocus
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && foodName.trim()) { setSuggestions([]); setStep(2); } }}
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-2xl overflow-y-auto max-h-60"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(6,95,70,0.08)' }}>
                    {suggestions.map((f) => (
                      <button key={f.id} type="button" onClick={() => pickSuggestion(f.name)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors"
                        style={{ borderBottom: '1px solid rgba(6,95,70,0.05)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f2f4f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{f.name}</p>
                          <p className="text-xs text-outline mt-0.5">{f.category}</p>
                        </div>
                        <span className="text-xs font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">
                          {f.nutrition ? f.nutrition.calories : '—'} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-outline">Pick from suggestions or type a name and press Enter</p>
              <button className="btn-primary w-full py-3" disabled={!foodName.trim()}
                onClick={() => { setSuggestions([]); setStep(2); }}>
                Next: Choose Portion
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2 – portion picker */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* Quantity stepper */}
              <div>
                <label className="input-label">How Many?</label>
                <div className="flex items-center gap-4 mt-2">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full border-2 border-outline-variant flex items-center justify-center text-primary font-bold text-xl transition-all hover:border-primary hover:bg-emerald-50">
                    −
                  </button>
                  <span className="text-3xl font-black text-on-surface min-w-[40px] text-center">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="w-10 h-10 rounded-full border-2 border-outline-variant flex items-center justify-center text-primary font-bold text-xl transition-all hover:border-primary hover:bg-emerald-50">
                    +
                  </button>
                  <input type="range" min={1} max={10} value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="flex-1" style={{ accentColor: '#004532' }} />
                </div>
              </div>

              {/* Size selector */}
              <div>
                <label className="input-label">Size</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {PORTION_SIZES.map((s) => (
                    <button key={s.value} type="button" onClick={() => setSize(s.value)}
                      className="py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-150"
                      style={{
                        borderColor: size === s.value ? '#004532' : '#e1e3e1',
                        background:  size === s.value ? '#004532' : 'white',
                        color:       size === s.value ? 'white'   : '#45645e',
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion type grid */}
              <div>
                <label className="input-label">Serving Type</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PORTION_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setPortionType(t.value)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 text-left"
                      style={{
                        borderColor: portionType === t.value ? '#004532' : '#e1e3e1',
                        background:  portionType === t.value ? 'rgba(0,69,50,0.06)' : 'white',
                        color:       portionType === t.value ? '#004532' : '#45645e',
                      }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>visibility</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Will be logged as</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">{foodName} — {preview}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button type="button" className="btn-ghost flex-1 py-3" onClick={() => setStep(1)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Back
                </button>
                <button type="button" className="btn-primary flex-[2] py-3" onClick={handleConfirm}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                  Add to {mLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Diet Result ──────────────────────────────────────────────────
function DietResult({ result, onNew }) {
  function statusStyle(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('optimal') || s.includes('adequate')) return { background: 'rgba(139,214,183,0.2)', color: '#004532' };
    if (s.includes('low') || s.includes('deficient'))    return { background: 'rgba(251,191,36,0.15)',  color: '#92400e' };
    return { background: 'rgba(186,26,26,0.1)', color: '#ba1a1a' };
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      {/* Score hero */}
      <div className="rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8"
        style={{ background: 'linear-gradient(135deg, #004532 0%, #065f46 100%)', color: 'white' }}>
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg width={112} height={112} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx={56} cy={56} r={50} strokeWidth={8} stroke="rgba(255,255,255,0.15)" fill="none" />
            <circle cx={56} cy={56} r={50} strokeWidth={8} stroke="#8bd6b7" fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 - (result.dietScore / 100) * 2 * Math.PI * 50}
              style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="z-10 text-center">
            <p className="text-3xl font-black leading-none">{result.dietScore}</p>
            <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ opacity: 0.6 }}>Score</p>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ opacity: 0.6 }}>
            {new Date(result.recordDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
          </p>
          <h2 className="font-serif text-2xl mb-4">
            {result.dietScore >= 80 ? 'Excellent nutrition!' : result.dietScore >= 60 ? 'Good progress today.' : 'Room to improve.'}
          </h2>
          <div className="flex flex-wrap gap-5">
            {[
              { l: 'Calories', v: Math.round(result.totals?.calories || 0) + ' kcal' },
              { l: 'Protein',  v: Math.round(result.totals?.protein  || 0) + 'g' },
              { l: 'Carbs',    v: Math.round(result.totals?.carbs    || 0) + 'g' },
              { l: 'Fats',     v: Math.round(result.totals?.fats     || 0) + 'g' },
              { l: 'Fiber',    v: Math.round(result.totals?.fiber    || 0) + 'g' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ opacity: 0.6 }}>{s.l}</p>
                <p className="text-base font-bold mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meals logged */}
      {result.meals && result.meals.length > 0 && (
        <div className="card">
          <SectionLabel>Meals Logged</SectionLabel>
          <div className="divide-y divide-emerald-900/5">
            {result.meals.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 18 }}>
                    {MEAL_ICONS[m.mealType] || 'restaurant'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{m.foodName}</p>
                    <p className="text-xs text-outline mt-0.5">
                      <span className="uppercase font-bold mr-2">{MEAL_LABELS[m.mealType] || m.mealType}</span>
                      {m.portionDescription}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-outline flex-shrink-0 ml-3">
                  {Math.round(m.nutrition ? m.nutrition.calories : 0)} kcal
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis */}
      {result.analysis && result.analysis.length > 0 && (
        <div className="card">
          <SectionLabel>Nutritional Analysis</SectionLabel>
          <div className="flex flex-col gap-4">
            {result.analysis.map((a, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-on-surface">{a.nutrient}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-outline">{Math.round(a.current || 0)} / {Math.round(a.recommended || 0)}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={statusStyle(a.status)}>{a.status}</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{
                    width: Math.min(100, a.percentageOfTarget || 0) + '%',
                    background: (a.status || '').toLowerCase().includes('optimal') || (a.status || '').toLowerCase().includes('adequate')
                      ? '#004532' : (a.status || '').toLowerCase().includes('low') ? '#d97706' : '#ba1a1a'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="card">
          <SectionLabel>Recommendations</SectionLabel>
          <div className="flex flex-col gap-3">
            {result.recommendations.map((r, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="material-symbols-outlined text-primary flex-shrink-0 mt-0.5" style={{ fontSize: 20 }}>lightbulb</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{r.suggestion}</p>
                  {r.foodItem && (
                    <p className="text-xs text-outline mt-1">
                      Try: <strong>{r.foodItem}</strong> ({r.quantity})
                      {r.proteinGain ? ' · +' + Math.round(r.proteinGain) + 'g protein' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn-primary self-start px-8 py-3" onClick={onNew}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        Log Another Day
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function LogMealPage() {
  const [meals, setMeals]           = useState([]);
  const [addingTo, setAddingTo]     = useState(null);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [hasExistingRecord, setHasExistingRecord] = useState(false);
  const toast = useToast();

 useEffect(() => {
  dietApi.getRecords()
    .then((records) => {
      // Log this to your browser console to see what the backend data actually looks like
      console.log("Backend records:", records);
      console.log("Current selected date:", recordDate);

      const exists = records?.some((r) => {
        if (!r.recordDate) return false;
        // Strip down the backend date to just YYYY-MM-DD for an accurate comparison
        const formattedBackendDate = r.recordDate.split('T')[0];
        return formattedBackendDate === recordDate;
      });

      setHasExistingRecord(!!exists);
    })
    .catch((err) => console.error("Failed to fetch records:", err));
}, [recordDate]);

  function handleAdd(item) { setMeals((prev) => [...prev, item]); setAddingTo(null); }
  function removeMeal(idx) { setMeals((prev) => prev.filter((_, i) => i !== idx)); }

  async function handleSubmit() {
    if (!meals.length) { toast('Add at least one meal first', 'error'); return; }
    setLoading(true);
    try {
      const res = await dietApi.analyze({ recordDate, meals });
      setResult(res);
      toast('Analysed! Diet score: ' + res.dietScore + '/100');
    } catch (err) {
      toast((err.response && err.response.data && err.response.data.message) || err.message || 'Analysis failed', 'error');
    }
    setLoading(false);
  }

  if (result) return <DietResult result={result} onNew={() => { setResult(null); setMeals([]); }} />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Modal */}
      {addingTo && <AddFoodModal mealType={addingTo} onAdd={handleAdd} onClose={() => setAddingTo(null)} />}

      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="font-serif text-4xl text-primary">Today's Journal</h1>
        <p className="text-sm text-outline mt-2">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Date picker */}
      <div className="card animate-slide-up delay-50">
        <label className="input-label">Record Date</label>
        <input className="input" type="date" value={recordDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setRecordDate(e.target.value)} />
      </div>

      {/* Warning Alert Block */}
      {hasExistingRecord && (
        <div
          className="flex items-start gap-3 px-4 py-4 rounded-2xl animate-fade-in"
          style={{
            background: 'rgba(251,191,36,0.12)',
            border: '1.5px solid rgba(217,119,6,0.25)',
          }}
        >
          <span
            className="material-symbols-outlined flex-shrink-0 mt-0.5"
            style={{ fontSize: 20, color: '#d97706' }}
          >
            info
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
              Entry already exists for this date
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
              These meals will be added to your existing record for{' '}
              {new Date(recordDate).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}.
            </p>
          </div>
        </div>
      )}

      {/* Per-meal-type sections */}
      <div className="flex flex-col gap-3">
        {MEAL_TYPES.map((type, idx) => {
          const typeMeals = meals.filter((m) => m.mealType === type);
          const hasItems  = typeMeals.length > 0;
          return (
            <div key={type} className="card animate-slide-up" style={{ animationDelay: (80 + idx * 40) + 'ms', padding: '20px 24px' }}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-300"
                    style={{ background: hasItems ? '#004532' : '#bec9c2' }} />
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 20 }}>{MEAL_ICONS[type]}</span>
                  <span className="text-sm font-bold text-on-surface">{MEAL_LABELS[type]}</span>
                  {hasItems && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-primary px-2 py-0.5 rounded-full">
                      {typeMeals.length} item{typeMeals.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="text-xs text-outline">{MEAL_TIMES[type]}</span>
              </div>

              {/* Food items */}
              {typeMeals.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {typeMeals.map((m) => {
                    const globalIdx = meals.indexOf(m);
                    const ptIcon = PORTION_TYPES.find((p) => m.portionDescription && m.portionDescription.includes(p.value.toLowerCase()));
                    return (
                      <div key={globalIdx} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ background: '#f2f4f2' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{ptIcon ? ptIcon.icon : '🍽️'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">{m.foodName}</p>
                            <p className="text-xs text-outline">{m.portionDescription}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeMeal(globalIdx)}
                          className="ml-3 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-100"
                          style={{ background: '#ffdad6' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a' }}>close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add button */}
              <button type="button" onClick={() => setAddingTo(type)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all duration-150"
                style={{ borderColor: '#bec9c2', color: '#45645e', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#004532'; e.currentTarget.style.color = '#004532'; e.currentTarget.style.background = 'rgba(0,69,50,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#bec9c2'; e.currentTarget.style.color = '#45645e'; e.currentTarget.style.background = 'transparent'; }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Add {MEAL_LABELS[type]} item
              </button>
            </div>
          );
        })}
      </div>

      {/* Sticky analyse button */}
      {meals.length > 0 && (
        <div className="sticky bottom-6 flex justify-center animate-slide-up">
          <button type="button" className="btn-primary px-10 py-4 text-base rounded-2xl"
            style={{ boxShadow: '0 8px 28px rgba(0,69,50,0.32)', minWidth: 280 }}
            onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><Spinner size={20} />Analysing with AI...</>
              : <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>analytics</span>Analyse {meals.length} Meal{meals.length > 1 ? 's' : ''}</>
            }
          </button>
        </div>
      )}

      {/* Empty nudge */}
      {meals.length === 0 && (
        <div className="text-center py-6 text-outline text-sm animate-fade-in">
          <span className="material-symbols-outlined block text-outline-variant mb-2" style={{ fontSize: 40 }}>restaurant</span>
          Tap <strong>"Add item"</strong> in any meal section above to start logging
        </div>
      )}
    </div>
  );
}