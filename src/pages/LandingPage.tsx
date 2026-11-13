import { Button } from 'antd';
import { ArrowRight, ChefHat, QrCode, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';

const HERO_BASE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80';

export function LandingPage() {
  return (
    <div className="sf-landing">
      <section className="sf-landing-hero" aria-label="Apresentação SmartFood">
        <div className="sf-landing-hero-media" aria-hidden>
          <img
            className="sf-landing-hero-img"
            alt=""
            src={`${HERO_BASE}&w=1600`}
            srcSet={`${HERO_BASE}&w=800 800w, ${HERO_BASE}&w=1280 1280w, ${HERO_BASE}&w=1920 1920w, ${HERO_BASE}&w=2400 2400w`}
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
          />
          <div className="sf-landing-hero-shade" />
        </div>

        <div className="sf-landing-hero-frame">
          <div className="sf-landing-hero-copy">
            <h1 className="sf-landing-brand sf-landing-rise">
              Smart<span>Food</span>
            </h1>
            <p className="sf-landing-headline sf-landing-rise-2">
              O cardápio digital que transforma mesa em pedido.
            </p>
            <p className="sf-landing-sub sf-landing-rise-3">
              Publique o menu, coloque QR nas mesas e acompanhe a cozinha ao vivo —
              sem app para o cliente baixar.
            </p>
            <div className="sf-landing-cta sf-landing-rise-4">
              <Link to="/register" className="sf-landing-cta-link">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ArrowRight size={18} />}
                  className="sf-landing-btn-primary"
                >
                  Criar meu cardápio
                </Button>
              </Link>
              <Link to="/login" className="sf-landing-cta-link">
                <Button size="large" block className="sf-landing-cta-secondary">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sf-landing-section sf-landing-story">
        <div className="sf-landing-wrap sf-landing-story-inner">
          <p className="sf-landing-kicker">Por que SmartFood</p>
          <h2 className="sf-landing-title">
            Menos papel. Mais pedidos. Operação no ritmo do salão.
          </h2>
          <p className="sf-landing-lead">
            Feito para restaurantes que querem vender pelo visual e organizar a fila
            sem trocar de sistema a cada etapa.
          </p>
        </div>
      </section>

      <section className="sf-landing-section sf-landing-feature">
        <div className="sf-landing-wrap sf-landing-feature-row">
          <div className="sf-landing-feature-text">
            <span className="sf-landing-feature-icon" aria-hidden>
              <Smartphone size={22} />
            </span>
            <h2 className="sf-landing-title">Cardápio público com a cara da sua casa</h2>
            <p className="sf-landing-lead">
              Logo, banner, categorias e fotos em minutos. O cliente abre no celular
              e já entende o que pedir — com a identidade visual do restaurante.
            </p>
          </div>
          <div className="sf-landing-feature-visual sf-landing-visual-menu" aria-hidden>
            <div className="sf-landing-phone">
              <div className="sf-landing-phone-bar" />
              <div className="sf-landing-phone-line wide" />
              <div className="sf-landing-phone-line" />
              <div className="sf-landing-phone-grid">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sf-landing-section sf-landing-feature is-dark">
        <div className="sf-landing-wrap sf-landing-feature-row is-reverse">
          <div className="sf-landing-feature-text">
            <span className="sf-landing-feature-icon" aria-hidden>
              <QrCode size={22} />
            </span>
            <h2 className="sf-landing-title">QR por mesa, pedido direto na cozinha</h2>
            <p className="sf-landing-lead">
              Cada mesa tem seu código. O cliente monta o pedido, paga e o prato entra
              na fila — sem intermediário e sem papel riscado.
            </p>
          </div>
          <div className="sf-landing-feature-visual sf-landing-visual-qr" aria-hidden>
            <div className="sf-landing-qr-frame">
              <div className="sf-landing-qr-grid" />
              <strong>Mesa 12</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="sf-landing-section sf-landing-feature">
        <div className="sf-landing-wrap sf-landing-feature-row">
          <div className="sf-landing-feature-text">
            <span className="sf-landing-feature-icon" aria-hidden>
              <ChefHat size={22} />
            </span>
            <h2 className="sf-landing-title">Painel da cozinha ao vivo</h2>
            <p className="sf-landing-lead">
              Na fila, preparando, pronto. Alertas sonoros e status em tempo real —
              a cozinha abre em uma aba e segue o serviço sem perder o ritmo.
            </p>
          </div>
          <div className="sf-landing-feature-visual sf-landing-visual-kitchen" aria-hidden>
            <div className="sf-landing-kanban">
              <div>
                <em>Na fila</em>
                <span />
                <span />
              </div>
              <div>
                <em>Preparando</em>
                <span />
              </div>
              <div>
                <em>Pronto</em>
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sf-landing-section sf-landing-steps">
        <div className="sf-landing-wrap">
          <p className="sf-landing-kicker">Comece hoje</p>
          <h2 className="sf-landing-title">Três passos até o primeiro pedido</h2>
          <ol className="sf-landing-step-list">
            <li>
              <div>
                <strong>Cadastre o restaurante</strong>
                <span>Dados, identidade visual e horário de funcionamento.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Monte o cardápio</strong>
                <span>Categorias, fotos, preços e destaques do dia.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Imprima os QR das mesas</strong>
                <span>Publique, abra a cozinha e receba pedidos ao vivo.</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="sf-landing-section sf-landing-close">
        <div className="sf-landing-wrap sf-landing-close-inner">
          <h2 className="sf-landing-title">Pronto para o próximo serviço?</h2>
          <p className="sf-landing-lead">
            Crie sua conta, publique o cardápio e coloque a operação digital no ar
            no tempo de um expediente.
          </p>
          <div className="sf-landing-cta">
            <Link to="/register" className="sf-landing-cta-link">
              <Button
                type="primary"
                size="large"
                block
                icon={<ArrowRight size={18} />}
                className="sf-landing-btn-primary"
              >
                Criar conta grátis
              </Button>
            </Link>
            <Link to="/login" className="sf-landing-cta-link">
              <Button size="large" block className="sf-landing-cta-secondary">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter tone="dark" />
    </div>
  );
}
