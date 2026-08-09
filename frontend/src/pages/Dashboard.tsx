import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Package, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    }
  });

  if (isLoading) return <div className="p-8">Loading dashboard metrics...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard data</div>;

  const { user } = useAuth();
  
  const canCreateChallan = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canAddCustomer = user?.role === 'ADMIN' || user?.role === 'SALES';

  const stats = [
    { label: 'Total Customers', value: data.totalCustomers, icon: Users, color: 'bg-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: 'bg-purple-500', bg: 'bg-purple-50' },
    { label: 'Low Stock Items', value: data.lowStockItems, icon: AlertTriangle, color: 'bg-rose-500', bg: 'bg-rose-50' },
    { label: 'Draft Challans', value: data.draftChallans, icon: FileText, color: 'bg-amber-500', bg: 'bg-amber-50' },
    { label: 'Confirmed Challans', value: data.confirmedChallans, icon: CheckCircle, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-12 pb-12">
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-6 border-2 border-slate-900 rounded-none bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <Icon className="w-5 h-5 text-slate-900" />
                </div>
                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-2 border-slate-900 p-8 bg-amber-50 rounded-none">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {canCreateChallan && (
              <a href="/challans" className="flex items-center space-x-3 p-4 bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-colors group">
                <FileText className="w-5 h-5" />
                <span className="font-bold">New Challan</span>
              </a>
            )}
            {canAddCustomer && (
              <a href="/customers" className="flex items-center space-x-3 p-4 bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-colors group">
                <Users className="w-5 h-5" />
                <span className="font-bold">Add Customer</span>
              </a>
            )}
            {!canCreateChallan && !canAddCustomer && (
               <p className="text-slate-500 font-bold col-span-2">No quick actions available for your role.</p>
            )}
          </div>
        </div>

        <div className="border-2 border-slate-900 p-8 bg-white rounded-none flex flex-col justify-center">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">System Status</h3>
          <p className="text-slate-600 mb-6">All systems operating within normal parameters.</p>
          <div className="flex items-center space-x-3 font-mono text-sm font-bold bg-slate-100 p-4 border border-slate-200 w-max">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>API: ONLINE</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
