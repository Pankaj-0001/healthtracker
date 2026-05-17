import { useAuth } from '../context/AuthContext';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass h-16 flex items-center px-4 gap-4">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-emerald-50 transition-colors"
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>menu</span>
      </button>
      <span className="text-base font-black tracking-[0.18em] text-primary flex-1">HEALTHTRACKER</span>
      {user && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
      )}
    </header>
  );
}
