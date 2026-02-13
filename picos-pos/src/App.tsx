
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { PosPage } from './pages/PosPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProductManager } from './pages/admin/ProductManager';
import { SalesDashboard } from './pages/admin/SalesDashboard';
import { UserSalesHistory } from './pages/admin/UserSalesHistory';
import { CustomerManager } from './pages/admin/CustomerManager';
import IpManager from './pages/admin/IpManager';
import TokenValidator from './components/TokenValidator';

function App() {
  return (
    <BrowserRouter>
      <TokenValidator />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/pos" element={<PosPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<ProductManager />} />
            <Route path="dashboard" element={<SalesDashboard />} />
            <Route path="user-history" element={<UserSalesHistory />} />
            <Route path="customers" element={<CustomerManager />} />
            <Route path="ips" element={<IpManager />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          <Route path="/" element={<Navigate to="/pos" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

