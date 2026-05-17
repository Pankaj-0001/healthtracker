import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, dietApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ProgressRing, ScoreBadge, PageLoader, EmptyState, StatCard, SectionLabel } from '../components/UI';

function getPercent(val, target) {
  if (!val || !target) return 0;
  return Math.min(100, Math.round((val / target) * 100));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userApi.getProfile(), dietApi.getRecords()])
      .then(([p, r]) => { setProfile(p); setRecords(r || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const todayStr = new Date().toISOString().split('T')[0];
  // ONLY use today's record for current-day progress — never fall back to a previous day
  const todayRecord = records.find((r) => r.recordDate === todayStr) || null;
  const targets = profile?.targets;
  const hasTodayData = !!todayRecord;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0];

  // Consumed values — zero if no meal logged today
  const consumed = {
    calories: todayRecord?.totals?.calories || 0,
    protein:  todayRecord?.totals?.protein  || 0,
    carbs:    todayRecord?.totals?.carbs    || 0,
    fats:     todayRecord?.totals?.fats     || 0,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div className="animate-slide-up">
        <p className="text-[11px] font-bold tracking-widest uppercase text-secondary mb-2">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
        </p>
        <h1 className="font-serif text-4xl text-primary leading-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="text-base text-outline mt-2">
          {hasTodayData
            ? `Your diet score is ${todayRecord.dietScore}/100 today. Keep it up!`
            : 'Log your meals today to track your nutrition progress.'}
        </p>
      </div>

      {/* Quick stats — today only, show 0 / target when no meal logged */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Score"
          value={hasTodayData ? todayRecord.dietScore : '--'}
          unit="/100"
          icon="stars" iconColor="#004532" iconBg="rgba(139,214,183,0.18)" delay={0}
        />
        <StatCard
          label="Calories"
          value={hasTodayData ? Math.round(consumed.calories) : '0'}
          unit={targets ? `/${Math.round(targets.dailyCalories)}` : ' kcal'}
          icon="local_fire_department" iconColor="#d97706" iconBg="rgba(251,191,36,0.13)" delay={50}
        />
        <StatCard
          label="Protein"
          value={hasTodayData ? Math.round(consumed.protein) : '0'}
          unit={targets ? `/${Math.round(targets.proteinGrams)}g` : 'g'}
          icon="fitness_center" iconColor="#1e4334" iconBg="rgba(30,67,52,0.1)" delay={100}
        />
        <StatCard
          label="Records"
          value={records.length}
          unit="total"
          icon="history" iconColor="#45645e" iconBg="rgba(69,100,94,0.1)" delay={150}
        />
      </div>

      {/* Macro rings — always show targets; fill rings only if today has data */}
      {targets && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Macro rings */}
          <div className="card animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Today's Progress</SectionLabel>
              {!hasTodayData && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline bg-surface-container px-2.5 py-1 rounded-full">
                  No meals yet
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-around gap-4 pt-2">
              {[
                { label: 'Calories', value: hasTodayData ? `${Math.round(consumed.calories)}` : `0/${Math.round(targets.dailyCalories)}`, pct: getPercent(consumed.calories, targets.dailyCalories), color: '#004532' },
                { label: 'Protein',  value: hasTodayData ? `${Math.round(consumed.protein)}g`  : `0g`, pct: getPercent(consumed.protein,  targets.proteinGrams),   color: '#1e4334' },
                { label: 'Carbs',    value: hasTodayData ? `${Math.round(consumed.carbs)}g`    : `0g`, pct: getPercent(consumed.carbs,    targets.carbsGrams),     color: '#d97706' },
                { label: 'Fats',     value: hasTodayData ? `${Math.round(consumed.fats)}g`     : `0g`, pct: getPercent(consumed.fats,     targets.fatsGrams),      color: '#b45309' },
              ].map((m) => (
                <div key={m.label} className="flex flex-col items-center gap-2">
                  <ProgressRing size={84} percent={m.pct} color={m.color} value={m.value} label={m.label} />
                  <p className="text-xs text-outline">{m.pct}%</p>
                </div>
              ))}
            </div>
            {!hasTodayData && (
              <p className="text-xs text-center text-outline mt-4">
                Rings will fill as you log meals today
              </p>
            )}
          </div>

          {/* Recommendations — only show if today has data */}
          <div className="card animate-slide-up delay-250 flex flex-col">
            {hasTodayData ? (
              <>
                <SectionLabel>Today's Recommendations</SectionLabel>
                <div className="flex flex-col gap-3 flex-1">
                  {todayRecord.recommendations?.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex gap-3 items-start pb-3 border-b border-emerald-900/5 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{r.suggestion}</p>
                        {r.foodItem && (
                          <p className="text-xs text-outline mt-0.5">{r.foodItem} · {r.quantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!todayRecord.recommendations || todayRecord.recommendations.length === 0) && (
                    <p className="text-sm text-outline flex-1 flex items-center">
                      Great work! No deficiencies detected today.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <SectionLabel>Daily Targets</SectionLabel>
                <div className="flex flex-col gap-3 flex-1">
                  {[
                    { label: 'Calories',  v: `${Math.round(targets.dailyCalories)} kcal`, color: '#004532' },
                    { label: 'Protein',   v: `${Math.round(targets.proteinGrams)}g`,       color: '#1e4334' },
                    { label: 'Carbs',     v: `${Math.round(targets.carbsGrams)}g`,         color: '#d97706' },
                    { label: 'Fats',      v: `${Math.round(targets.fatsGrams)}g`,          color: '#b45309' },
                    { label: 'Fiber',     v: `${Math.round(targets.fiberGrams)}g`,         color: '#45645e' },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center justify-between py-1.5 border-b border-emerald-900/5 last:border-0">
                      <span className="text-sm text-outline">{t.label}</span>
                      <span className="text-sm font-bold" style={{ color: t.color }}>{t.v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-outline mt-3">Log your meals to see today's progress against these targets.</p>
              </>
            )}
            <button className="btn-ghost mt-4 py-2.5 text-sm" onClick={() => navigate('/log')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              {hasTodayData ? 'Log More Meals' : 'Log Today\'s Meal'}
            </button>
          </div>
        </div>
      )}

      {/* No profile targets yet */}
      {!targets && (
        <div className="card animate-slide-up delay-200">
          <EmptyState
            icon="restaurant"
            title="Complete your profile"
            description="Add your health details to see personalised nutrition targets and track your daily progress."
            action={
              <button className="btn-primary mt-4 px-8 py-3 text-sm" onClick={() => navigate('/profile')}>
                Set Up Profile
              </button>
            }
          />
        </div>
      )}

      {/* Recent records */}
      {records.length > 0 && (
        <div className="card animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>Recent Records</SectionLabel>
            <button
              onClick={() => navigate('/records')}
              className="text-xs font-bold text-primary tracking-wide hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="flex flex-col divide-y divide-emerald-900/5">
            {records.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {new Date(r.recordDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-outline mt-0.5">
                    {r.meals?.length || 0} meals · {Math.round(r.totals?.calories || 0)} kcal · {Math.round(r.totals?.protein || 0)}g protein
                  </p>
                </div>
                <ScoreBadge score={r.dietScore} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
