import { Layout, Menu, Button, Drawer, Grid } from 'antd';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  QrCode,
  Webhook,
  LogOut,
  Menu as MenuIcon,
  ExternalLink,
  ChefHat,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../hooks/AuthContext';
import { useRestaurant } from '../hooks/useRestaurant';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();

  const selected = useMemo(() => {
    if (location.pathname.startsWith('/app/menu')) return ['menu'];
    if (location.pathname.startsWith('/app/qr')) return ['qr'];
    if (location.pathname.startsWith('/app/webhooks')) return ['webhooks'];
    if (location.pathname.startsWith('/app/profile')) return ['profile'];
    return ['dashboard'];
  }, [location.pathname]);

  const items = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard size={18} />,
      label: <Link to="/app">Visão geral</Link>,
    },
    {
      key: 'profile',
      icon: <Store size={18} />,
      label: <Link to="/app/profile">Perfil</Link>,
    },
    {
      key: 'menu',
      icon: <UtensilsCrossed size={18} />,
      label: <Link to="/app/menu">Cardápio</Link>,
    },
    {
      key: 'qr',
      icon: <QrCode size={18} />,
      label: <Link to="/app/qr">QR / Mesas</Link>,
    },
    {
      key: 'webhooks',
      icon: <Webhook size={18} />,
      label: <Link to="/app/webhooks">Webhooks</Link>,
    },
  ];

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selected}
      items={items}
      onClick={() => setOpen(false)}
      style={{ borderInlineEnd: 0, background: 'transparent' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--sf-cream)' }}>
      {!isMobile && (
        <Sider
          width={248}
          style={{
            background: 'linear-gradient(180deg, #1c1917 0%, #292524 100%)',
            padding: '20px 12px',
          }}
        >
          <Link
            to="/app"
            className="sf-brand"
            style={{
              color: '#fff',
              fontSize: 26,
              display: 'block',
              padding: '4px 12px 24px',
            }}
          >
            Smart<span style={{ color: 'var(--sf-coral)' }}>Food</span>
          </Link>
          <div style={{ color: 'rgba(255,255,255,0.88)' }}>{menu}</div>
        </Sider>
      )}

      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            background: 'rgba(255,247,242,0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--sf-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuIcon size={20} />}
                onClick={() => setOpen(true)}
              />
            )}
            <div>
              <div style={{ fontWeight: 700, lineHeight: 1.2 }}>
                {restaurant?.tradeName || 'Seu restaurante'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>
                Olá, {user?.name?.split(' ')[0]}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<ChefHat size={16} />}
              onClick={() => window.open('/cozinha', '_blank')}
            >
              {isMobile ? null : 'Cozinha'}
            </Button>
            {restaurant?.slug && restaurant.status === 'APPROVED' ? (
              <Button
                icon={<ExternalLink size={16} />}
                onClick={() => window.open(`/m/${restaurant.slug}`, '_blank')}
              >
                {isMobile ? null : 'Ver cardápio'}
              </Button>
            ) : null}
            <Button
              type="text"
              danger
              icon={<LogOut size={16} />}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              {isMobile ? null : 'Sair'}
            </Button>
          </div>
        </Header>

        <Content style={{ padding: isMobile ? 16 : 28, maxWidth: 1100, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </Content>
        <SiteFooter />
      </Layout>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="left"
        width={280}
        styles={{ body: { padding: 12, background: '#1c1917' } }}
        title={
          <span className="sf-brand" style={{ color: '#fff' }}>
            Smart<span style={{ color: 'var(--sf-coral)' }}>Food</span>
          </span>
        }
      >
        <div style={{ color: '#fff' }}>{menu}</div>
      </Drawer>
    </Layout>
  );
}
