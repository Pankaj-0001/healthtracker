import { useEffect, useState } from 'react';
import { userApi } from '../api';
import { useToast } from '../context/ToastContext';
import { PageLoader, Spinner, NutrientRow } from '../components/UI';

const ACTIVITY_LABELS = {
  SEDENTARY: 'Sedentary',
  LIGHT: 'Light Activity',
  MODERATE: 'Moderate Activity',
  ACTIVE: 'Active',
  VERY_ACTIVE: 'Very Active',
};

const GOAL_LABELS = {
  MAINTENANCE: 'Maintain Weight',
  WEIGHT_LOSS: 'Lose Weight',
  WEIGHT_GAIN: 'Gain Weight',
  MUSCLE_BUILDING: 'Build Muscle',
};

function BMIIndicator({ bmi }) {
  if (!bmi) return null;
  const label = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const isHealthy = label === 'Normal';
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: isHealthy ? 'rgba(139,214,183,0.18)' : 'rgba(251,191,36,0.13)',
        border: `1px solid ${isHealthy ? 'rgba(0,69,50,0.12)' : 'rgba(217,119,6,0.2)'}`,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: isHealthy ? '#004532' : '#d97706' }}>
        {isHealthy ? 'check_circle' : 'info'}
      </span>
      <div>
        <p className="text-sm font-semibold text-on-surface">
          BMI: {bmi} · <span style={{ color: isHealthy ? '#004532' : '#d97706' }}>{label}</span>
        </p>
        <p className="text-xs text-outline">
          {isHealthy ? 'Your BMI is in the healthy range.' : 'Focus on your goal to reach the optimal range.'}
        </p>
      </div>
    </div>
  );
}

function ProfileView({ profile, onEdit }) {
  const bmi = profile.height && profile.weight
    ? parseFloat((profile.weight / ((profile.height / 100) ** 2)).toFixed(1))
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar card */}
      <div className="card flex items-center gap-5 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {profile.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-on-surface">{profile.name}</h2>
          <p className="text-sm text-outline mt-0.5">{profile.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs font-bold bg-emerald-100 text-primary px-3 py-0.5 rounded-full">{profile.gender}</span>
            <span className="text-xs font-bold bg-surface-container text-secondary px-3 py-0.5 rounded-full">
              {GOAL_LABELS[profile.goal] || profile.goal}
            </span>
            <span className="text-xs font-bold bg-surface-container text-secondary px-3 py-0.5 rounded-full">
              {ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel}
            </span>
          </div>
        </div>
        <button className="btn-ghost text-sm px-4 py-2" onClick={onEdit}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
          Edit
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up delay-50">
        {[
          { l: 'Age',    v: profile.age,    unit: 'yrs', icon: 'cake'           },
          { l: 'Height', v: profile.height, unit: 'cm',  icon: 'height'         },
          { l: 'Weight', v: profile.weight, unit: 'kg',  icon: 'monitor_weight' },
          { l: 'BMI',    v: bmi,            unit: '',    icon: 'accessibility'   },
        ].map((s) => (
          <div key={s.l} className="card-sm flex flex-col gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>{s.icon}</span>
            <p className="text-2xl font-black text-on-surface leading-none">
              {s.v ?? '--'}<span className="text-xs font-medium text-outline ml-1">{s.unit}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{s.l}</p>
          </div>
        ))}
      </div>

      {/* BMI indicator */}
      <div className="animate-slide-up delay-100">
        <BMIIndicator bmi={bmi} />
      </div>

      {/* Nutritional targets — show as target values only, NOT as consumed/progress bars */}
      {profile.targets && (
        <div className="card animate-slide-up delay-150">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] font-bold tracking-widest uppercase text-outline">Daily Nutritional Targets</p>
            <span className="text-[10px] font-bold bg-emerald-100 text-primary px-2.5 py-1 rounded-full">
              Based on your profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Calories',       value: Math.round(profile.targets.dailyCalories),  unit: 'kcal', icon: 'local_fire_department', color: '#004532', bg: 'rgba(139,214,183,0.15)' },
              { label: 'Protein',        value: Math.round(profile.targets.proteinGrams),   unit: 'g',    icon: 'fitness_center',        color: '#1e4334', bg: 'rgba(30,67,52,0.08)'    },
              { label: 'Carbohydrates',  value: Math.round(profile.targets.carbsGrams),     unit: 'g',    icon: 'grain',                 color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
              { label: 'Fats',           value: Math.round(profile.targets.fatsGrams),      unit: 'g',    icon: 'water_drop',            color: '#b45309', bg: 'rgba(180,83,9,0.08)'    },
              { label: 'Fiber',          value: Math.round(profile.targets.fiberGrams),     unit: 'g',    icon: 'eco',                   color: '#45645e', bg: 'rgba(69,100,94,0.08)'   },
            ].map((t) => (
              <div key={t.label}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                style={{ background: t.bg, border: `1px solid ${t.color}20` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.color }}>
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>{t.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{t.label}</p>
                  <p className="text-xl font-black leading-tight" style={{ color: t.color }}>
                    {t.value}<span className="text-sm font-medium text-outline ml-1">{t.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-outline mt-4">
            * Calculated using Mifflin-St Jeor equation based on your age, height, weight, activity level and goal.
            Update your profile to recalculate.
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileEditForm({ profile, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    age: profile.age || '',
    height: profile.height || '',
    weight: profile.weight || '',
    activityLevel: profile.activityLevel || 'MODERATE',
    goal: profile.goal || 'MAINTENANCE',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        ...form,
        age: parseInt(form.age),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
      });
      toast('Profile updated!');
      onSave(updated);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-5 animate-slide-up max-w-lg">
      <p className="text-[11px] font-bold tracking-widest uppercase text-outline">Edit Profile</p>

      <div>
        <label className="input-label">Full Name</label>
        <input className="input" value={form.name} onChange={set('name')} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Age</label>
          <input className="input" type="number" value={form.age} onChange={set('age')} required min={10} max={120} />
        </div>
        <div>
          <label className="input-label">Height (cm)</label>
          <input className="input" type="number" value={form.height} onChange={set('height')} required />
        </div>
        <div>
          <label className="input-label">Weight (kg)</label>
          <input className="input" type="number" value={form.weight} onChange={set('weight')} required />
        </div>
        <div>
          <label className="input-label">Activity Level</label>
          <select className="input" value={form.activityLevel} onChange={set('activityLevel')}>
            <option value="SEDENTARY">Sedentary</option>
            <option value="LIGHT">Light</option>
            <option value="MODERATE">Moderate</option>
            <option value="ACTIVE">Active</option>
            <option value="VERY_ACTIVE">Very Active</option>
          </select>
        </div>
      </div>

      <div>
        <label className="input-label">Diet Goal</label>
        <select className="input" value={form.goal} onChange={set('goal')}>
          <option value="MAINTENANCE">Maintain Weight</option>
          <option value="WEIGHT_LOSS">Lose Weight</option>
          <option value="WEIGHT_GAIN">Gain Weight</option>
          <option value="MUSCLE_BUILDING">Build Muscle</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-ghost flex-1 py-3" onClick={onCancel}>Cancel</button>
        <button className="btn-primary flex-[2] py-3" type="submit" disabled={saving}>
          {saving ? <Spinner size={18} /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    userApi.getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-slide-up">
        <h1 className="font-serif text-4xl text-primary">Health Profile</h1>
        <p className="text-sm text-outline mt-2">Your personal health data and nutritional targets</p>
      </div>

      {editing ? (
        <ProfileEditForm
          profile={profile}
          onSave={(updated) => { setProfile(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileView profile={profile} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}
