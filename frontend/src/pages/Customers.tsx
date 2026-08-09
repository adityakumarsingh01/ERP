import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'lucide-react';

const Customers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '', mobileNumber: '', email: '', businessName: '', 
    gstNumber: '', customerType: 'RETAIL', status: 'ACTIVE', address: ''
  });
  
  const { user } = useAuth();
  const canManageCustomers = user?.role === 'ADMIN' || user?.role === 'SALES';

  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const res = await api.get('/customers', { params: { search } });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newCust: typeof formData) => {
      const res = await api.post('/customers', newCust);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowForm(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 border-2 border-slate-900">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Customer Database</h2>
        {canManageCustomers && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 text-white font-bold py-3 px-6 hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm"
          >
            + Add Customer
          </button>
        )}
      </div>

      {showForm && canManageCustomers && (
        <div className="bg-white p-6 border-2 border-slate-900 mb-6">
          <h4 className="text-lg font-black uppercase mb-4">New Customer</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-medium">
            <input required placeholder="Customer Name *" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
            <input required placeholder="Mobile Number *" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
            <input placeholder="Email" type="email" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Business Name" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
            <input placeholder="GST Number" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
            
            <select required className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
            
            <select required className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            
            <input placeholder="Address" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50 md:col-span-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border-2 border-slate-900 font-bold uppercase tracking-wider hover:bg-slate-100 text-sm">Cancel</button>
              <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold uppercase tracking-wider hover:bg-slate-800 text-sm">Save Customer</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border-2 border-slate-900 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-900 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-900 focus:outline-none bg-white font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-2 border-slate-900">
            <tr>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Customer Name</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Contact</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Business</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Type</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Status</th>
              {canManageCustomers && (
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={canManageCustomers ? 6 : 5} className="p-8 text-center font-bold text-slate-500">LOADING...</td></tr>
            ) : customers?.length === 0 ? (
              <tr><td colSpan={canManageCustomers ? 6 : 5} className="p-8 text-center font-bold text-slate-500">No customers found.</td></tr>
            ) : (
              customers?.map((c: any) => (
                <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{c.customerName}</td>
                  <td className="p-4 text-sm font-medium">{c.mobileNumber}<br/><span className="text-slate-500 text-xs font-mono">{c.email}</span></td>
                  <td className="p-4 text-sm font-medium">{c.businessName || '-'}</td>
                  <td className="p-4">
                    <span className="bg-slate-200 px-2 py-1 font-bold text-slate-700 text-xs tracking-wider uppercase border border-slate-300">
                      {c.customerType}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 font-bold text-xs uppercase tracking-wider border ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                      {c.status}
                    </span>
                  </td>
                  {canManageCustomers && (
                    <td className="p-4 text-right">
                      <button className="text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase tracking-wide">Edit</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
