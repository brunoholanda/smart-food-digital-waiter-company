import { Alert, Button, Switch, Typography, message } from 'antd';
import {
  CheckCircle2,
  ChefHat,
  Copy,
  ExternalLink,
  QrCode,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as restaurantsApi from '../api/restaurants';
import { LoadingScreen } from '../components/LoadingScreen';
import { RestaurantCoverCard } from '../components/RestaurantCoverCard';
import { StatusBanner } from '../components/StatusBanner';
import { SectionTitle } from '../components/ImageUpload';
import { useRestaurant } from '../hooks/useRestaurant';
import { getApiErrorMessage } from '../utils/format';

export function DashboardPage() {
  const { restaurant, loading, refresh, setRestaurant } = useRestaurant();
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && !restaurant) return <LoadingScreen tip="Carregando painel..." />;
  if (!restaurant) {
    return (
      <div className="sf-surface" style={{ padding: 24 }}>
        <Typography.Title level={3}>Restaurante não encontrado</Typography.Title>
      </div>
    );
  }

  const approved = restaurant.status === 'APPROVED';
  const categoriesCount = restaurant.categories?.length ?? 0;
  const itemsCount =
    restaurant.categories?.reduce((acc, cat) => acc + (cat.items?.length ?? 0), 0) ?? 0;
  const publicUrl = `${window.location.origin}/m/${restaurant.slug}`;

  const togglePublish = async (checked: boolean) => {
    if (!approved) {
      message.warning('Publique apenas após a aprovação do cadastro');
      return;
    }
    setPublishing(true);
    try {
      const updated = await restaurantsApi.updateMyRestaurant({ isPublished: checked });
      setRestaurant({ ...restaurant, ...updated });
      message.success(checked ? 'Cardápio publicado' : 'Cardápio despublicado');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Não foi possível alterar a publicação'));
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      message.success('Link copiado');
    } catch {
      message.error('Não foi possível copiar o link');
    }
  };

  return (
    <div className="sf-fade-in">
      <SectionTitle
        title="Visão geral"
        subtitle="Acompanhe o status e o desempenho do seu cardápio digital."
      />

      <StatusBanner status={restaurant.status} rejectionReason={restaurant.rejectionReason} />

      <RestaurantCoverCard
        restaurant={restaurant}
        onUpdated={(updated) => {
          setRestaurant(updated);
          void refresh();
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: 'Categorias', value: categoriesCount, icon: <Store size={18} /> },
          { label: 'Itens', value: itemsCount, icon: <UtensilsCrossed size={18} /> },
          {
            label: 'Publicado',
            value: restaurant.isPublished ? 'Sim' : 'Não',
            icon: <CheckCircle2 size={18} />,
          },
        ].map((card) => (
          <div key={card.label} className="sf-surface" style={{ padding: 18 }}>
            <div style={{ color: 'var(--sf-coral)', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--sf-font-display)' }}>
              {card.value}
            </div>
            <div style={{ color: 'var(--sf-text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="sf-surface" style={{ padding: 20, marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Publicação do cardápio</div>
            <div style={{ color: 'var(--sf-text-muted)', fontSize: 14 }}>
              {approved
                ? 'Link geral para visualizar o menu (sem pedido na mesa).'
                : 'Disponível somente após aprovação do cadastro.'}
            </div>
          </div>
          <Switch
            checked={restaurant.isPublished}
            disabled={!approved}
            loading={publishing}
            onChange={(checked) => void togglePublish(checked)}
            checkedChildren="On"
            unCheckedChildren="Off"
          />
        </div>

        {approved ? (
          <>
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <code
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--sf-sand)',
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {publicUrl}
              </code>
              <Button icon={<Copy size={16} />} onClick={() => void copyLink()}>
                Copiar
              </Button>
              <Button
                type="primary"
                icon={<ExternalLink size={16} />}
                onClick={() => window.open(publicUrl, '_blank')}
              >
                Abrir
              </Button>
            </div>
            <Alert
              type="info"
              showIcon
              icon={<QrCode size={16} />}
              style={{ marginTop: 14, borderRadius: 12 }}
              message="Pedidos na mesa usam outro link"
              description={
                <span>
                  Este é o cardápio geral. Para o cliente pedir pela mesa e enviar à cozinha,
                  use os QR Codes gerados em{' '}
                  <Link to="/app/qr" style={{ fontWeight: 700, color: 'var(--sf-coral)' }}>
                    QR / Mesas
                  </Link>
                  .
                </span>
              }
            />
          </>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/app/profile">
          <Button size="large">Editar perfil</Button>
        </Link>
        <Link to="/app/menu">
          <Button type="primary" size="large" disabled={!approved}>
            Gerenciar cardápio
          </Button>
        </Link>
        <Link to="/app/qr">
          <Button size="large" icon={<QrCode size={16} />} disabled={!approved}>
            QR / Mesas
          </Button>
        </Link>
        <Button
          size="large"
          icon={<ChefHat size={16} />}
          disabled={!approved}
          onClick={() => window.open('/cozinha', '_blank')}
        >
          Cozinha
        </Button>
      </div>
    </div>
  );
}
