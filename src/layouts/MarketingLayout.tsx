import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export function MarketingLayout() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  return (
    <div className={`sf-page${isHome ? ' sf-marketing' : ' sf-atmosphere'}`}>
      <header
        className={[
          'sf-marketing-nav',
          isHome ? 'is-home' : '',
          isHome && scrolled ? 'is-scrolled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="sf-marketing-nav-inner">
          <Link to="/" className="sf-brand sf-marketing-nav-brand">
            Smart<span>Food</span>
          </Link>
          <div className="sf-marketing-nav-actions">
            {isAuthenticated ? (
              <Link to="/app">
                <Button type="primary" className="sf-marketing-nav-cta">
                  Painel
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="sf-marketing-nav-login">
                  <Button type="text" className="sf-marketing-nav-ghost">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" className="sf-marketing-nav-cta">
                    Começar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
