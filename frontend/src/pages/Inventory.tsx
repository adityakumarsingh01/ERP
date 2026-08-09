import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

const Inventory: React.FC = () => {
  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      const res = await api.get('/inventory/movements');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-8">
      <div className="border-2 border-slate-900 bg-white p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-8 h-8 text-slate-900" />
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stock Movements Log</h3>
        </div>
        
        <p className="text-slate-600 font-medium mb-8">
          This log strictly records every stock reduction or addition as executed by confirmed sales challans or manual stock entries.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-50">
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Date</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Product</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Type</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Qty</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Reason / Reference</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-slate-900">Operator</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-bold text-slate-500">LOADING LOGS...</td>
                </tr>
              ) : movements?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-bold text-slate-500">NO INVENTORY MOVEMENTS YET.</td>
                </tr>
              ) : (
                movements?.map((m: any) => (
                  <tr key={m.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm">{format(new Date(m.createdAt), 'PP p')}</td>
                    <td className="p-4 font-bold text-slate-900">{m.product?.name} <span className="text-slate-500 font-mono text-xs block">SKU: {m.product?.sku}</span></td>
                    <td className="p-4">
                      {m.movementType === 'IN' ? (
                        <span className="inline-flex items-center text-emerald-600 font-black text-xs uppercase tracking-wider bg-emerald-100 px-2 py-1">
                          <ArrowDownRight className="w-4 h-4 mr-1" /> STOCK IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-600 font-black text-xs uppercase tracking-wider bg-rose-100 px-2 py-1">
                          <ArrowUpRight className="w-4 h-4 mr-1" /> STOCK OUT
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-black text-lg text-slate-900">{m.quantity}</td>
                    <td className="p-4 font-medium text-slate-600 text-sm">{m.reason}</td>
                    <td className="p-4 font-bold text-slate-900 text-sm">{m.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
