import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Plug, ArrowLeft } from 'lucide-react';

const adminNavItems = [
  { path: '/admin', label: 'Geral', icon: LayoutDashboard, end: true },
  { path: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { path: '/admin/conexoes', label: 'Conexões', icon: Plug },
  { path: '/', label: 'Voltar', icon: ArrowLeft },
];

const AdminBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--sidebar-background))]/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {adminNavItems.map(item => {
          const isActive = item.end
            ? location.pathname === item.path
            : item.path !== '/' && location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors duration-150 ${
                isActive ? 'text-cf-red' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
