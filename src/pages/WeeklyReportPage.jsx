import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dietApi } from '../api';
import { ScoreBadge, PageLoader, EmptyState } from '../components/UI';
import ReactMarkdown from "react-markdown";

function WeeklyBarChart({ data }) {
  return (
    <div className="flex items-end gap-2 h-40 pb-8 relative">
      {data.map((d, i) => {
        const pct   = d.dietScore ? (d.dietScore / 100) * 100 : 0;
        const color = d.dietScore >= 80 ? '#004532' : d.dietScore >= 60 ? '#d97706' : '#ba1a1a';
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <span className="text-[10px] font-bold" style={{ color }}>{d.dietScore || 0}</span>
            <div className="w-full rounded-t-lg transition-all duration-700"
              style={{ height: `${pct}%`, background: color, opacity: 0.85, minHeight: d.dietScore ? 4 : 0 }} />
            <span className="absolute bottom-0 text-[10px] font-semibold text-outline uppercase tracking-wide">
              {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function toInputDate(d) {
  return d.toISOString().split('T')[0];
}

export default function WeeklyReportPage() {
  const today    = new Date();
  const defEnd   = toInputDate(today);
  const defStart = toInputDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));

  const [startDate, setStartDate] = useState(defStart);
  const [endDate,   setEndDate]   = useState(defEnd);
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [fetched,   setFetched]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchReport(defStart, defEnd); }, []);

  async function fetchReport(start, end) {
    setLoading(true);
    try {
      const res = await dietApi.getWeeklyReport(start, end);
      setReport(res);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }

  function handleApply() {
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) return;
    fetchReport(startDate, endDate);
  }

  const hasData = report?.dailyProgress?.length > 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="font-serif text-4xl text-primary">Weekly Report</h1>
        <p className="text-sm text-outline mt-2">Select any date range to view your nutrition summary</p>
      </div>

      {/* Date range picker */}
      <div className="card animate-slide-up delay-50">
        <p className="text-[11px] font-bold tracking-widest uppercase text-outline mb-4">Select Date Range</p>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="input-label">From</label>
            <input className="input" type="date" value={startDate} max={endDate}
              onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="input-label">To</label>
            <input className="input" type="date" value={endDate}
              min={startDate} max={toInputDate(today)}
              onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn-primary px-6 py-3 flex-shrink-0"
            onClick={handleApply} disabled={loading} style={{ minWidth: 130 }}>
            {loading
              ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.75s linear infinite' }} /> Loading</>
              : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>analytics</span>Generate</>
            }
          </button>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Last 7 days',  days: 7  },
            { label: 'Last 14 days', days: 14 },
            { label: 'Last 30 days', days: 30 },
          ].map((r) => {
            const s = toInputDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (r.days - 1)));
            const isActive = startDate === s && endDate === defEnd;
            return (
              <button key={r.label}
                onClick={() => { setStartDate(s); setEndDate(defEnd); fetchReport(s, defEnd); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150"
                style={{
                  borderColor: isActive ? '#004532' : '#bec9c2',
                  background:  isActive ? '#004532' : 'transparent',
                  color:       isActive ? 'white'   : '#45645e',
                }}>
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-900/10 flex items-center justify-center relative shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                auto_awesome
              </span>
            </div>
          </div>
          <h3 className="text-xl font-serif text-primary mb-2">Analyzing Nutrition Data</h3>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-outline">
            <div style={{ width:12, height:12, border:'2px solid rgba(0,69,50,0.1)', borderTopColor:'#004532', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
            <span>AI is generating your report...</span>
          </div>
        </div>
      )}

      {/* No data */}
      {!loading && fetched && !hasData && (
        <div className="card">
          <EmptyState
            icon="calendar_month"
            title="No records in this range"
            description={`No meals logged between ${new Date(startDate).toLocaleDateString('en-IN', { month:'short', day:'numeric' })} – ${new Date(endDate).toLocaleDateString('en-IN', { month:'short', day:'numeric' })}. Try a different range.`}
            action={
              <button className="btn-primary mt-4 px-8 py-3 text-sm" onClick={() => navigate('/log')}>
                Log Meals
              </button>
            }
          />
        </div>
      )}

      {/* Report content */}
      {!loading && hasData && (
        <>
          {/* Score hero */}
          <div className="rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 animate-slide-up"
            style={{ background: 'linear-gradient(135deg, #004532 0%, #065f46 100%)', color: 'white' }}>
            <div className="text-center sm:text-left flex-shrink-0">
              <p className="text-6xl font-black leading-none">{Math.round(report.averageDietScore || 0)}</p>
              <p className="text-xs font-bold tracking-widest uppercase opacity-60 mt-1">Avg Score</p>
            </div>
            <div className="flex-1">
              <p className="font-serif text-xl opacity-90">
                {new Date(report.weekStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                {' – '}
                {new Date(report.weekEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs opacity-60 mb-4">{report.dailyProgress.length} day{report.dailyProgress.length !== 1 ? 's' : ''} tracked</p>
              <div className="flex flex-wrap gap-6">
                {[
                  { l: 'Avg Calories', v: `${Math.round(report.weeklyAverage?.calories || 0)} kcal` },
                  { l: 'Avg Protein',  v: `${Math.round(report.weeklyAverage?.protein  || 0)}g` },
                  { l: 'Avg Carbs',    v: `${Math.round(report.weeklyAverage?.carbs    || 0)}g` },
                  { l: 'Avg Fats',     v: `${Math.round(report.weeklyAverage?.fats     || 0)}g` },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest">{s.l}</p>
                    <p className="text-base font-bold mt-0.5">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="card animate-slide-up delay-100">
            <p className="text-[11px] font-bold tracking-widest uppercase text-outline mb-4">Daily Diet Score</p>
            <WeeklyBarChart data={report.dailyProgress} />
          </div>

          {/* Daily breakdown */}
          <div className="card animate-slide-up delay-150">
            <p className="text-[11px] font-bold tracking-widests uppercase text-outline mb-4">Daily Breakdown</p>
            <div className="divide-y divide-emerald-900/5">
              {report.dailyProgress.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-outline mt-0.5">
                      {Math.round(d.nutrition?.calories || 0)} kcal · {Math.round(d.nutrition?.protein || 0)}g protein · {Math.round(d.nutrition?.carbs || 0)}g carbs
                    </p>
                  </div>
                  <ScoreBadge score={d.dietScore} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          {report.insights && (
            <div
              className="card animate-slide-up delay-200 bg-emerald-50/50"
              style={{ border: "1px solid rgba(0,69,50,0.1)" }}
            >
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: 20 }}
                  >
                    auto_awesome
                  </span>
                </div>

                <div className="w-full">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-primary mb-4">
                    AI Health Insights
                  </p>

                  <div className="flex flex-col gap-3">
                    {report.insights
                      .split(/\n+/)
                      .filter((p) => p.trim())
                      .map((point, index) => {
                        const cleanPoint = point.trim().replace(/^[-*]\s+/, '');
                        return (
                          <div 
                            key={index} 
                            className="flex gap-3.5 items-start p-4 bg-white/60 rounded-2xl border border-emerald-900/5 shadow-sm transition-all hover:shadow-md hover:bg-white/80"
                          >
                            <span 
                              className="material-symbols-outlined text-primary flex-shrink-0 mt-0.5" 
                              style={{ fontSize: 20 }}
                            >
                              check_circle
                            </span>
                            <div className="prose prose-sm max-w-none text-on-surface leading-relaxed [&>p]:m-0">
                              <ReactMarkdown>
                                {cleanPoint}
                              </ReactMarkdown>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
                  </>
      )}
    </div>
  );
}