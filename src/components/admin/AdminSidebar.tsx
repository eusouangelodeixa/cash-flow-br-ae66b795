import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Plug, ArrowLeft } from 'lucide-react';
import logoImg from '@/assets/logo-cashflow.png';

const adminNavItems = [
  { path: '/admin', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { path: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { path: '/admin/conexoes', label: 'Conexões', icon: Plug },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-[hsl(var(--sidebar-background))] border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <img src={logoImg} alt="Cash Flow" className="w-7 h-7 brightness-0 invert" />
        <div>
          <span className="text-lg-apple font-display font-semibold text-foreground tracking-tight">Admin</span>
          <p className="text-xs-apple text-muted-foreground">Cash Flow</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {adminNavItems.map(item => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
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
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cf-red rounded-r" />
              )}
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Back to app */}
      <div className="px-3 py-4 border-t border-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm-apple text-muted-foreground hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground transition-all duration-150"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span>Voltar ao App</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
