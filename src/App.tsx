import { App as AntApp, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { KitchenLayout } from './layouts/KitchenLayout';
import { MarketingLayout } from './layouts/MarketingLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MenuManagePage } from './pages/MenuManagePage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicMenuPage } from './pages/PublicMenuPage';
import { RegisterPage } from './pages/RegisterPage';
import { TablesQrPage } from './pages/TablesQrPage';
import { WebhooksPage } from './pages/WebhooksPage';
import { BoardPage } from './pages/kitchen/BoardPage';
import { HistoryPage } from './pages/kitchen/HistoryPage';
import { antdTheme } from './theme';

export default function App() {
  return (
    <ConfigProvider locale={ptBR} theme={antdTheme}>
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route path="/m/:slug" element={<PublicMenuPage />} />
              <Route path="/m/:slug/mesa/:tableCode" element={<PublicMenuPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="menu" element={<MenuManagePage />} />
                  <Route path="qr" element={<TablesQrPage />} />
                  <Route path="webhooks" element={<WebhooksPage />} />
                </Route>

                <Route path="/cozinha" element={<KitchenLayout />}>
                  <Route index element={<BoardPage />} />
                  <Route path="history" element={<HistoryPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
