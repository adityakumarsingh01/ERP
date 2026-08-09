import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Customers from './pages/Customers';
import Products from './pages/Products';
import Challans from './pages/Challans';
import Inventory from './pages/Inventory';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers/*" element={<Customers />} />
          <Route path="products/*" element={<Products />} />
          <Route path="challans/*" element={<Challans />} />
          <Route path="inventory/*" element={<Inventory />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
