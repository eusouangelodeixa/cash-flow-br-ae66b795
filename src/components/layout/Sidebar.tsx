import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, User, Settings, Shield, LogOut } from 'lucide-react';
import logoImg from '@/assets/logo-cashflow.png';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/estoque', label: 'Estoque', icon: Package },
  { path: '/perfil', label: 'Perfil', icon: User },
  { path: '/plano', label: 'Plano', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { subscription, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const userName = profile?.nome || 'Usuário';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-[#0A0A0A] border-r border-[rgba(255,255,255,0.08)] z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <img src={logoImg} alt="Cash Flow" className="w-7 h-7 brightness-0 invert" />
        <span className="text-lg-apple font-display font-semibold text-foreground tracking-tight">Cash Flow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm-apple transition-all duration-150 relative ${
                isActive
                  ? 'bg-[rgba(255,255,255,0.08)] text-foreground'
                  : 'text-muted-foreground hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
              )}
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin link - only for admins */}
      {isAdmin && (
        <div className="px-3 py-2">
          <NavLink
            to="/admin"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm-apple transition-all duration-150 ${
              location.pathname.startsWith('/admin')
                ? 'bg-[rgba(255,255,255,0.08)] text-foreground'
                : 'text-muted-foreground hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground'
            }`}
          >
            <Shield size={20} strokeWidth={1.5} />
            <span>Admin</span>
          </NavLink>
        </div>
      )}

      {/* User section */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm-apple font-medium text-foreground truncate">{userName}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-cf-gold font-medium">
                {subscription.subscribed ? 'Cash Flow ✦' : 'Sem plano'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.06)] transition-colors"
            title="Sair"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
