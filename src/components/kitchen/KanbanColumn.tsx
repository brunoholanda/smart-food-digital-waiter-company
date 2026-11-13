import type { KitchenOrder, KitchenStatus } from '../../types';
import { OrderCard } from './OrderCard';

interface KanbanColumnProps {
  title: string;
  accent: 'queued' | 'preparing' | 'ready';
  count: number;
  orders: KitchenOrder[];
  flashIds: Set<string>;
  updatingId: string | null;
  onUpdateStatus: (orderId: string, status: KitchenStatus) => Promise<void>;
}

export function KanbanColumn({
  title,
  accent,
  count,
  orders,
  flashIds,
  updatingId,
  onUpdateStatus,
}: KanbanColumnProps) {
  return (
    <section className={`kanban-column accent-${accent}`}>
      <header className="kanban-column-header">
        <h2>{title}</h2>
        <span className="kanban-count">{count}</span>
      </header>
      <div className="kanban-column-body">
        {orders.length === 0 ? (
          <p className="kanban-empty">Nenhum pedido</p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              flashing={flashIds.has(order.id)}
              updating={updatingId === order.id}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </section>
  );
}
