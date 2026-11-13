import { Link, Outlet } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';

export function AuthLayout() {
  return (
    <div
      className="sf-page sf-atmosphere"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
          padding: '28px 20px 24px',
        }}
      >
        <Link
          to="/"
          className="sf-brand sf-fade-in"
          style={{ fontSize: 32, display: 'inline-block', marginBottom: 24 }}
        >
          Smart<span>Food</span>
        </Link>
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
