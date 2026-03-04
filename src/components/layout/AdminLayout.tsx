import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBottomNav from '@/components/admin/AdminBottomNav';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 min-h-screen md:ml-[240px] pb-24 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 md:py-8">
          <Outlet />
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
};

export default AdminLayout;
