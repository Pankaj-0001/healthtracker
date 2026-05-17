import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/UI';

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'LIGHT', label: 'Light', desc: '1–3 days/week' },
  { value: 'MODERATE', label: 'Moderate', desc: '3–5 days/week' },
  { value: 'ACTIVE', label: 'Active', desc: '6–7 days/week' },
  { value: 'VERY_ACTIVE', label: 'Very Active', desc: 'Hard exercise daily' },
];

const GOAL_OPTIONS = [
  { value: 'MAINTENANCE', label: 'Maintain Weight', icon: 'balance' },
  { value: 'WEIGHT_LOSS', label: 'Lose Weight', icon: 'trending_down' },
  { value: 'WEIGHT_GAIN', label: 'Gain Weight', icon: 'trending_up' },
  { value: 'MUSCLE_BUILDING', label: 'Build Muscle', icon: 'fitness_center' },
];

export default function CompleteProfilePage() {
  const { user, markProfileComplete } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: '',
    gender: 'MALE',
    height: '',
    weight: '',
    activityLevel: 'MODERATE',
    goal: 'MAINTENANCE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.completeProfile({
        age: parseInt(form.age),
        gender: form.gender,
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        activityLevel: form.activityLevel,
        goal: form.goal,
      });
      markProfileComplete();
      toast(`Profile complete! Welcome to HEALTHTRACKER, ${user?.name?.split(' ')[0]}.`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(145deg, #f8faf8 0%, #e6f4ef 60%, #c7eae1 100%)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8 animate-slide-up">
          <div className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-3">HEALTHTRACKER</div>
          <h1 className="font-serif text-4xl text-on-surface mb-2">One last step.</h1>
          <p className="text-sm text-outline">
            Hey {user?.name?.split(' ')[0]}, we need a few health details to personalise your experience.
          </p>
        </div>

        <div className="card p-8 animate-slide-up delay-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Age</label>
                <input className="input" type="number" placeholder="25"
                  value={form.age} onChange={set('age')} required min={10} max={120} />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select className="input" value={form.gender} onChange={set('gender')}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="input-label">Height (cm)</label>
                <input className="input" type="number" placeholder="170"
                  value={form.height} onChange={set('height')} required />
              </div>
              <div>
                <label className="input-label">Weight (kg)</label>
                <input className="input" type="number" placeholder="70"
                  value={form.weight} onChange={set('weight')} required />
              </div>
            </div>

            <div>
              <label className="input-label">Activity Level</label>
              <select className="input" value={form.activityLevel} onChange={set('activityLevel')}>
                {ACTIVITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Diet Goal</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm({ ...form, goal: g.value })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-left ${
                      form.goal === g.value
                        ? 'border-primary bg-emerald-50 text-primary'
                        : 'border-outline-variant/40 text-outline hover:border-primary/30'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container text-sm font-medium" style={{ color: '#93000a' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            <button className="btn-primary w-full py-3.5 text-base mt-1" type="submit" disabled={loading}>
              {loading ? <Spinner size={20} /> : null}
              {loading ? 'Saving...' : 'Complete Setup →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
