import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const ProtectedRoute = () => {
  const { user, loading, subscription } = useAuth();
  const location = useLocation();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins bypass subscription check
  if (isAdmin) {
    return <Outlet />;
  }

  // Allow access to /plano and /perfil without subscription
  const freeRoutes = ['/plano', '/perfil'];
  if (!subscription.subscribed && !freeRoutes.includes(location.pathname)) {
    return <Navigate to="/plano" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
