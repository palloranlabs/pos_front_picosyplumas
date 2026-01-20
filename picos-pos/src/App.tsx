import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { PosPage } from './pages/PosPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProductManager } from './pages/admin/ProductManager';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/pos" element={<PosPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<ProductManager />} />
            <Route index element={<Navigate to="products" replace />} />
          </Route>
          <Route path="/" element={<Navigate to="/pos" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
