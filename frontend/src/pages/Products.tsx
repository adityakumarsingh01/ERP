import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'lucide-react';

const Products: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'Electronics', unitPrice: 0, 
    minimumStock: 5, warehouseLocation: ''
  });

  const { user } = useAuth();
  const canManageProducts = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res = await api.get('/products', { params: { search } });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newProd: typeof formData) => {
      const res = await api.post('/products', newProd);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Product Catalog</h2>
        {canManageProducts && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 text-white font-bold py-3 px-6 hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm"
          >
            + Add Product
          </button>
        )}
      </div>

      {showForm && canManageProducts && (
        <div className="bg-white p-6 border-2 border-slate-900 mb-6">
          <h4 className="text-lg font-black uppercase mb-4">New Product</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-medium">
            <input required placeholder="Product Name *" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="SKU *" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50 uppercase" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} />
            <input required type="number" placeholder="Unit Price (₹) *" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.unitPrice || ''} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
            <input required type="number" placeholder="Minimum Stock Alert" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.minimumStock || ''} onChange={e => setFormData({...formData, minimumStock: Number(e.target.value)})} />
            
            <select required className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Spares">Spares</option>
              <option value="Software">Software</option>
            </select>
            
            <input placeholder="Warehouse Location (e.g., A1-B2)" className="border-2 border-slate-900 p-3 focus:outline-none bg-slate-50" value={formData.warehouseLocation} onChange={e => setFormData({...formData, warehouseLocation: e.target.value})} />
            
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border-2 border-slate-900 font-bold uppercase tracking-wider hover:bg-slate-100 text-sm">Cancel</button>
              <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold uppercase tracking-wider hover:bg-slate-800 text-sm">Save Product</button>
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
              placeholder="Search products by SKU or Name..."
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-900 focus:outline-none bg-white font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-2 border-slate-900">
            <tr>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Product Name</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">SKU</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Category</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900 text-right">Price</th>
              <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900 text-center">Stock</th>
              {canManageProducts && (
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={canManageProducts ? 6 : 5} className="p-8 text-center font-bold text-slate-500">LOADING...</td></tr>
            ) : products?.length === 0 ? (
              <tr><td colSpan={canManageProducts ? 6 : 5} className="p-8 text-center font-bold text-slate-500">No products found.</td></tr>
            ) : (
              products?.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{p.name}</td>
                  <td className="p-4"><span className="bg-slate-100 font-mono text-xs px-2 py-1 font-bold border border-slate-300">{p.sku}</span></td>
                  <td className="p-4 text-sm font-medium">{p.category}</td>
                  <td className="p-4 text-sm font-bold text-right">₹{p.unitPrice.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 font-black text-sm border ${p.currentStock <= p.minimumStock ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}>
                      {p.currentStock}
                    </span>
                  </td>
                  {canManageProducts && (
                    <td className="p-4 text-right">
                      <button className="text-slate-500 hover:text-indigo-600 font-bold text-sm uppercase tracking-wide mr-3">Edit</button>
                      <button className="text-slate-500 hover:text-emerald-600 font-bold text-sm uppercase tracking-wide">+ Stock</button>
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

export default Products;
