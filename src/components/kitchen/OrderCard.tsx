import { App, Button, Typography } from 'antd';
import { Check, Flame, PackageCheck, X } from 'lucide-react';
import type { KitchenOrder, KitchenStatus } from '../../types';
import {
  formatCurrency,
  parseAddons,
  paymentMethodLabel,
} from '../../utils/format';
import { ElapsedTime } from './ElapsedTime';

interface OrderCardProps {
  order: KitchenOrder;
  flashing?: boolean;
  updating?: boolean;
  onUpdateStatus: (orderId: string, status: KitchenStatus) => Promise<void>;
}

export function OrderCard({
  order,
  flashing = false,
  updating = false,
  onUpdateStatus,
}: OrderCardProps) {
  const { modal } = App.useApp();
  const mesa = order.tableNumber ?? order.table?.number;
  const status = order.kitchenStatus;

  const confirmCancel = () => {
    modal.confirm({
      title: 'Cancelar pedido?',
      content: `O pedido ${order.code} será cancelado e sairá da fila da cozinha.`,
      okText: 'Sim, cancelar',
      okButtonProps: { danger: true },
      cancelText: 'Voltar',
      centered: true,
      onOk: () => onUpdateStatus(order.id, 'CANCELLED'),
    });
  };

  return (
    <article className={`order-card${flashing ? ' is-flashing' : ''}`}>
      <header className="order-card-header">
        <div className="order-mesa">
          <span className="order-mesa-label">Mesa</span>
          <span className="order-mesa-number">{mesa ?? '—'}</span>
        </div>
        <div className="order-meta">
          <Typography.Text className="order-code">#{order.code}</Typography.Text>
          <ElapsedTime from={order.queuedAt} />
        </div>
      </header>

      {(order.customerName || order.paymentMethod) && (
        <div className="order-submeta">
          {order.customerName ? <span>{order.customerName}</span> : null}
          {order.paymentMethod ? (
            <span>{paymentMethodLabel(order.paymentMethod)}</span>
          ) : null}
        </div>
      )}

      <ul className="order-items">
        {order.items?.map((item, idx) => {
          const addons = parseAddons(item.addonsJson);
          return (
            <li key={item.id ?? `${order.id}-${idx}`}>
              <div className="order-item-row">
                <span className="order-qty">{item.quantity}×</span>
                <div className="order-item-body">
                  <strong>{item.name}</strong>
                  {item.variationName ? (
                    <span className="order-item-extra">{item.variationName}</span>
                  ) : null}
                  {addons.length > 0 ? (
                    <span className="order-item-extra">+ {addons.join(', ')}</span>
                  ) : null}
                  {item.notes ? (
                    <span className="order-item-notes">Obs: {item.notes}</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {order.notes ? (
        <p className="order-notes">
          <strong>Pedido:</strong> {order.notes}
        </p>
      ) : null}

      <footer className="order-card-footer">
        <span className="order-total">{formatCurrency(order.total)}</span>
        <div className="order-actions">
          {status === 'QUEUED' ? (
            <Button
              type="primary"
              size="large"
              icon={<Flame size={18} />}
              loading={updating}
              onClick={() => void onUpdateStatus(order.id, 'PREPARING')}
            >
              Preparar
            </Button>
          ) : null}
          {status === 'PREPARING' ? (
            <Button
              type="primary"
              size="large"
              icon={<Check size={18} />}
              loading={updating}
              onClick={() => void onUpdateStatus(order.id, 'READY')}
            >
              Pronto
            </Button>
          ) : null}
          {status === 'READY' ? (
            <Button
              type="primary"
              size="large"
              icon={<PackageCheck size={18} />}
              loading={updating}
              onClick={() => void onUpdateStatus(order.id, 'DELIVERED')}
            >
              Entregar
            </Button>
          ) : null}
          {status === 'QUEUED' || status === 'PREPARING' || status === 'READY' ? (
            <Button
              danger
              size="large"
              icon={<X size={18} />}
              disabled={updating}
              onClick={confirmCancel}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
