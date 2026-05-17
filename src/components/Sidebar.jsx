import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { to: '/log', icon: 'restaurant', label: 'Log Meal' },
  { to: '/records', icon: 'history', label: 'My Records' },
  { to: '/weekly', icon: 'analytics', label: 'Weekly Report' },
  { to: '/food', icon: 'search', label: 'Food Library' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast('Signed out successfully');
    navigate('/');
  }

  const sidebarContent = (
    <aside className="flex flex-col h-full bg-white border-r border-emerald-900/5 shadow-[4px_0_24px_rgba(6,95,70,0.05)]">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-emerald-900/5">
        <div className="text-[18px] font-black tracking-[0.18em] text-primary">HEALTHTRACKER</div>
        <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-outline mt-0.5">Health Intelligence</div>
      </div>

      {/* User chip */}
      {user && (
        <div className="px-4 py-4 border-b border-emerald-900/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-container-low">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{user.name}</p>
              <p className="text-xs text-outline truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 pt-3 border-t border-emerald-900/5">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-error hover:text-error hover:bg-red-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-64 h-full animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
