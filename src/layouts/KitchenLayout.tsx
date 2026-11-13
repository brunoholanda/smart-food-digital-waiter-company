import { ConfigProvider } from 'antd';
import { Button, Layout, Typography } from 'antd';
import { ChefHat, History, LayoutGrid, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../hooks/AuthContext';
import { kitchenAntdTheme } from '../theme/kitchen';
import '../styles/kitchen.css';

const { Header, Content } = Layout;

export function KitchenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('kitchen-mode');
    document.title = 'SmartFood Cozinha';
    return () => {
      document.body.classList.remove('kitchen-mode');
      document.title = 'SmartFood';
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ConfigProvider theme={kitchenAntdTheme}>
      <Layout className="kitchen-shell">
        <Header className="kitchen-header">
          <div className="kitchen-brand">
            <ChefHat size={28} strokeWidth={2.25} />
            <div>
              <Typography.Title level={4} className="kitchen-brand-title">
                SmartFood Cozinha
              </Typography.Title>
              <Typography.Text className="kitchen-brand-sub">
                {user?.restaurant?.tradeName ?? user?.name ?? 'Operação'}
              </Typography.Text>
            </div>
          </div>

          <nav className="kitchen-nav">
            <NavLink
              to="/cozinha"
              end
              className={({ isActive }) =>
                `kitchen-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <LayoutGrid size={18} />
              Quadro
            </NavLink>
            <NavLink
              to="/cozinha/history"
              className={({ isActive }) =>
                `kitchen-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <History size={18} />
              Histórico
            </NavLink>
          </nav>

          <Button
            type="text"
            className="kitchen-logout"
            icon={<LogOut size={18} />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Header>
        <Content className="kitchen-content">
          <Outlet />
        </Content>
        <SiteFooter tone="kitchen" />
      </Layout>
    </ConfigProvider>
  );
}
