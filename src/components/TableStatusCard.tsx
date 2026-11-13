import { Tag } from 'antd';
import { CheckCircle2, ChefHat, Clock3, Flame, PackageCheck } from 'lucide-react';
import type { KitchenStatus, TableStatus, TableStatusOrder } from '../types';
import { formatCurrency } from '../utils/format';

const kitchenLabel: Record<
  Exclude<KitchenStatus, 'CANCELLED' | 'DELIVERED'>,
  { label: string; color: string; icon: typeof Clock3 }
> = {
  QUEUED: { label: 'Na fila', color: 'gold', icon: Clock3 },
  PREPARING: { label: 'Preparando', color: 'orange', icon: Flame },
  READY: { label: 'Pronto', color: 'green', icon: PackageCheck },
};

function orderStatusMeta(order: TableStatusOrder) {
  if (order.status === 'AWAITING_PAYMENT' && !order.kitchenStatus) {
    return { label: 'Aguardando pagamento', color: 'default', icon: Clock3 };
  }
  if (order.status === 'AWAITING_PAYMENT' && order.kitchenStatus) {
    const kitchen = kitchenLabel[order.kitchenStatus as keyof typeof kitchenLabel];
    if (kitchen) {
      return {
        label: `${kitchen.label} · conta aberta`,
        color: kitchen.color,
        icon: kitchen.icon,
      };
    }
  }
  if (order.kitchenStatus && order.kitchenStatus in kitchenLabel) {
    return kitchenLabel[order.kitchenStatus as keyof typeof kitchenLabel];
  }
  return { label: 'Em andamento', color: 'blue', icon: ChefHat };
}

interface TableStatusCardProps {
  status: TableStatus;
}

export function TableStatusCard({ status }: TableStatusCardProps) {
  if (status.sessionStatus === 'IDLE' && status.activeOrderCount === 0) {
    return (
      <div className="sf-table-status sf-table-status--idle">
        <div className="sf-table-status__head">
          <CheckCircle2 size={18} />
          <div>
            <strong>Mesa livre</strong>
            <p>Nenhum pedido em andamento nesta mesa.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-table-status">
      <div className="sf-table-status__head">
        <ChefHat size={18} />
        <div>
          <strong>
            {status.sessionStatus === 'READY_TO_PAY'
              ? 'Pronto para fechar a conta'
              : 'Pedidos em andamento'}
          </strong>
          <p>
            Mesa {status.tableNumber} · {status.activeOrderCount} pedido(s)
            {status.hasOpenBill
              ? ` · aberto ${formatCurrency(status.openBillTotal)}`
              : ''}
          </p>
        </div>
      </div>

      <div className="sf-table-status__list">
        {status.orders.map((order) => {
          const meta = orderStatusMeta(order);
          const Icon = meta.icon;
          return (
            <article key={order.id} className="sf-table-status__order">
              <div className="sf-table-status__order-top">
                <div>
                  <strong>{order.code}</strong>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                <Tag
                  color={meta.color}
                  icon={<Icon size={12} />}
                  style={{
                    marginInlineEnd: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {meta.label}
                </Tag>
              </div>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.name}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
