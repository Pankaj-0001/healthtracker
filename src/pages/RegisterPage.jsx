import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: 'MALE', height: '', weight: '',
    activityLevel: 'MODERATE', goal: 'MAINTENANCE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function nextStep(e) {
    e.preventDefault();
    setError('');
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register({
        ...form,
        age: parseInt(form.age),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
      });
      toast(`Welcome to HEALTHTRACKER, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      setStep(1);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(145deg, #f8faf8 0%, #e6f4ef 60%, #c7eae1 100%)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-3">HEALTHTRACKER</div>
          <h1 className="font-serif text-4xl text-on-surface mb-2">Start your journey.</h1>
          <p className="text-sm text-outline">Step {step} of 2 · {step === 1 ? 'Account Details' : 'Health Profile'}</p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8 justify-center animate-fade-in">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all duration-500"
              style={{ width: 56, background: s <= step ? '#004532' : '#bec9c2' }}
            />
          ))}
        </div>

        <div className="card p-8 animate-slide-up delay-100">
          {step === 1 ? (
            <form onSubmit={nextStep} className="flex flex-col gap-5">
              <div>
                <label className="input-label">Full Name</label>
                <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input className="input" type="email" placeholder="arjun@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select className="input" value={form.gender} onChange={set('gender')}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <button className="btn-primary w-full py-3.5 text-base mt-2" type="submit">
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Age</label>
                  <input className="input" type="number" placeholder="25" value={form.age} onChange={set('age')} required min={10} max={120} />
                </div>
                <div>
                  <label className="input-label">Height (cm)</label>
                  <input className="input" type="number" placeholder="170" value={form.height} onChange={set('height')} required />
                </div>
                <div>
                  <label className="input-label">Weight (kg)</label>
                  <input className="input" type="number" placeholder="70" value={form.weight} onChange={set('weight')} required />
                </div>
                <div>
                  <label className="input-label">Activity Level</label>
                  <select className="input" value={form.activityLevel} onChange={set('activityLevel')}>
                    {ACTIVITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
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

              <div className="flex gap-3 mt-2">
                <button type="button" className="btn-ghost flex-1 py-3" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-[2] py-3.5 text-base" type="submit" disabled={loading}>
                  {loading ? <Spinner size={18} /> : null}
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-outline mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-primary font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
