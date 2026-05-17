import { useEffect, useState } from 'react';
import { dietApi } from '../api';
import { ScoreBadge, PageLoader, EmptyState } from '../components/UI';
import { useNavigate } from 'react-router-dom';

function RecordCard({ record }) {
  const [open, setOpen] = useState(false);

  function statusColor(status = '') {
    const s = status.toLowerCase();
    if (s.includes('optimal')) return '#004532';
    if (s.includes('low') || s.includes('deficient')) return '#d97706';
    return '#ba1a1a';
  }

  return (
    <div
      className="card cursor-pointer transition-shadow duration-200 hover:shadow-float"
      onClick={() => setOpen(!open)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>calendar_today</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {new Date(record.recordDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs text-outline mt-0.5">
              {record.meals?.length || 0} meals · {Math.round(record.totals?.calories || 0)} kcal · {Math.round(record.totals?.protein || 0)}g protein
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ScoreBadge score={record.dietScore} />
          <span
            className="material-symbols-outlined text-outline transition-transform duration-200"
            style={{ fontSize: 20, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="mt-5 pt-5 border-t border-emerald-900/6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Macro grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { l: 'Protein', v: `${Math.round(record.totals?.protein || 0)}g`, c: '#1e4334' },
              { l: 'Carbs', v: `${Math.round(record.totals?.carbs || 0)}g`, c: '#d97706' },
              { l: 'Fats', v: `${Math.round(record.totals?.fats || 0)}g`, c: '#b45309' },
              { l: 'Fiber', v: `${Math.round(record.totals?.fiber || 0)}g`, c: '#45645e' },
            ].map((s) => (
              <div key={s.l} className="bg-surface-container-low rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{s.l}</p>
                <p className="text-xl font-black mt-1" style={{ color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* Meals list */}
          {record.meals?.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Meals</p>
              <div className="divide-y divide-emerald-900/5">
                {record.meals.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container text-secondary px-2 py-0.5 rounded-full">
                        {m.mealType}
                      </span>
                      <p className="text-sm text-on-surface">{m.foodName} · <span className="text-outline">{m.portionDescription}</span></p>
                    </div>
                    <p className="text-xs font-semibold text-outline flex-shrink-0 ml-3">{Math.round(m.nutrition?.calories || 0)} kcal</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Analysis */}
          {record.analysis?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-900/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Analysis</p>
              <div className="flex flex-wrap gap-2">
                {record.analysis.map((a, i) => {
                  const c = statusColor(a.status);
                  const bg = (a.status || '').toLowerCase().includes('optimal')
                    ? 'rgba(139,214,183,0.18)' : (a.status || '').toLowerCase().includes('low')
                    ? 'rgba(251,191,36,0.13)' : 'rgba(186,26,26,0.09)';
                  return (
                    <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: bg, color: c }}>
                      {a.nutrient}: {a.status}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dietApi.getRecords()
      .then((r) => setRecords(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-slide-up flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl text-primary">My Records</h1>
          <p className="text-sm text-outline mt-2">{records.length} total diet records</p>
        </div>
        {records.length > 0 && (
          <button className="btn-primary px-5 py-2.5 text-sm" onClick={() => navigate('/log')}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Log Meal
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="history"
            title="No records yet"
            description="Log your meals daily to build your diet history and track your progress."
            action={
              <button className="btn-primary mt-4 px-8 py-3 text-sm" onClick={() => navigate('/log')}>
                Log Your First Meal
              </button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((r, i) => (
            <div key={r.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <RecordCard record={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
