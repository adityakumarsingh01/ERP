import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { XCircle } from 'lucide-react';
import { format } from 'date-fns';

const Challans: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [errorMsg, setErrorMsg] = useState('');

  const { user } = useAuth();
  const canManageChallans = user?.role === 'ADMIN' || user?.role === 'SALES';

  const { data: challans, isLoading } = useQuery({
    queryKey: ['challans'],
    queryFn: async () => {
      const res = await api.get('/challans');
      return res.data.data;
    }
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/challans', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      setShowForm(false);
      setErrorMsg('');
      setCustomerId('');
      setItems([{ productId: '', quantity: 1 }]);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create')
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/challans/${id}/confirm`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['products-list'] });
      setErrorMsg('');
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Confirmation failed')
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const payload = {
      customerId: Number(customerId),
      items: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) }))
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 border-2 border-slate-900">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sales Challans</h2>
        {canManageChallans && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 text-white font-bold py-3 px-6 hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm"
          >
            + New Challan
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border-2 border-red-200 font-bold uppercase tracking-widest text-sm">
          {errorMsg}
        </div>
      )}

      {showForm && canManageChallans && (
        <div className="bg-white p-6 border-2 border-slate-900 mb-6">
          <h4 className="text-lg font-black uppercase mb-4">Create Draft Challan</h4>
          <form onSubmit={handleCreate}>
            <div className="mb-4">
              <label className="block text-sm font-black uppercase text-slate-700 mb-2">Select Customer</label>
              <select required className="w-full border-2 border-slate-900 p-3 bg-slate-50 focus:outline-none" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">-- Choose Customer --</option>
                {customers?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.customerName}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 border-2 border-slate-900 p-4 bg-slate-50">
              <h5 className="font-black text-sm uppercase mb-3">Products</h5>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 mb-3">
                  <div className="flex-1">
                    <select
                      className="w-full p-3 border-2 border-slate-900 bg-white focus:outline-none font-medium"
                      value={item.productId}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].productId = e.target.value;
                        setItems(newItems);
                      }}
                      required
                    >
                      <option value="">-- Choose Product --</option>
                      {products?.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock}) - ₹{p.unitPrice}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32 flex items-center border-2 border-slate-900 bg-white">
                    <span className="px-3 text-xs font-bold uppercase text-slate-500 border-r-2 border-slate-900 bg-slate-200 py-3">QTY</span>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-3 bg-transparent focus:outline-none font-medium text-center"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].quantity = Number(e.target.value);
                        setItems(newItems);
                      }}
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                      <XCircle className="w-6 h-6" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setItems([...items, { productId: '', quantity: 1 }])} className="text-slate-900 border-2 border-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-wider bg-white hover:bg-slate-100 mt-2">
                + Add Another Product
              </button>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border-2 border-slate-900 font-bold uppercase tracking-wider hover:bg-slate-100 text-sm">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="px-6 py-3 bg-slate-900 text-white font-bold uppercase tracking-wider hover:bg-slate-800 text-sm">
                {createMutation.isPending ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border-2 border-slate-900 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-2 border-slate-900">
            <tr>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Challan #</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Customer</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Quantity</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Amount</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900 text-center">Status</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Date</th>
              {canManageChallans && (
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={canManageChallans ? 7 : 6} className="p-8 text-center font-bold text-slate-500">LOADING...</td></tr>
            ) : challans?.length === 0 ? (
              <tr><td colSpan={canManageChallans ? 7 : 6} className="p-8 text-center font-bold text-slate-500">No challans found.</td></tr>
            ) : (
              challans?.map((c: any) => {
                const totalAmt = c.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
                const isDraft = c.status === 'DRAFT';
                return (
                  <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4"><span className="bg-slate-100 font-mono text-xs px-2 py-1 font-bold border border-slate-300">{c.challanNumber}</span></td>
                    <td className="p-4 font-bold text-slate-900">{c.customer?.customerName}</td>
                    <td className="p-4 text-sm font-medium">{c.totalQuantity} items</td>
                    <td className="p-4 text-sm font-bold">₹{totalAmt.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 font-black text-xs uppercase tracking-wider border ${isDraft ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs">{format(new Date(c.createdAt), 'PP')}</td>
                    {canManageChallans && (
                      <td className="p-4 text-right">
                        {isDraft && (
                          <button 
                            onClick={() => confirmMutation.mutate(c.id)}
                            className="bg-slate-900 text-white font-bold px-3 py-1 text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {!isDraft && (
                          <button className="text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-end w-full space-x-1">
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Challans;
