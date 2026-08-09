import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Package, FileText, Activity, LogOut } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Challans', path: '/challans', icon: FileText },
    { name: 'Inventory', path: '/inventory', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-800">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-extrabold tracking-tighter">FUNDSROOM</h1>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {location.pathname === '/' ? 'Overview' : location.pathname.split('/')[1]}
          </h2>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
