import { App } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as kitchenApi from '../api/kitchen';
import type {
  KitchenOrder,
  KitchenStats,
  KitchenStatus,
  ServiceCall,
  UpdateKitchenOrderPayload,
} from '../types';
import { getApiErrorMessage } from '../utils/format';
import { useKitchenSocket } from './useKitchenSocket';
import { useNewOrderAlert } from './useNewOrderAlert';

const FALLBACK_POLL_MS = 30000;

export function useKitchenOrders() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [stats, setStats] = useState<KitchenStats>({ queued: 0, preparing: 0, ready: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [callFlashIds, setCallFlashIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string> | null>(null);
  const {
    notifyNewQueued,
    soundEnabled,
    audioReady,
    toggleSound,
    unlockAudio,
  } = useNewOrderAlert();

  const flashOrder = useCallback((orderId: string) => {
    setFlashIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
    window.setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }, 4000);
  }, []);

  const flashCall = useCallback((callId: string) => {
    setCallFlashIds((prev) => {
      const next = new Set(prev);
      next.add(callId);
      return next;
    });
    window.setTimeout(() => {
      setCallFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(callId);
        return next;
      });
    }, 6000);
  }, []);

  const refresh = useCallback(async (silent = false) => {
    try {
      const [nextOrders, nextStats, nextCalls] = await Promise.all([
        kitchenApi.getKitchenOrders(),
        kitchenApi.getKitchenStats(),
        kitchenApi.getServiceCalls(),
      ]);

      const known = knownIdsRef.current;
      if (known) {
        const newlyQueued = nextOrders.filter(
          (o) => o.kitchenStatus === 'QUEUED' && !known.has(o.id),
        );
        if (newlyQueued.length > 0) {
          notifyNewQueued(newlyQueued.length);
          newlyQueued.forEach((o) => flashOrder(o.id));
        }
      }
      knownIdsRef.current = new Set(nextOrders.map((o) => o.id));

      setOrders(nextOrders);
      setStats(nextStats);
      setServiceCalls(nextCalls);
    } catch (err) {
      if (!silent) {
        message.error(getApiErrorMessage(err, 'Falha ao carregar pedidos'));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [flashOrder, message, notifyNewQueued]);

  const { connected } = useKitchenSocket({
    onOrderCreated: (payload) => {
      knownIdsRef.current?.add(payload.order.id);
      flashOrder(payload.order.id);
      void refresh(true);
    },
    onOrderUpdated: () => {
      void refresh(true);
    },
    onServiceCallCreated: (payload) => {
      flashCall(payload.call.id);
      void refresh(true);
    },
    onServiceCallUpdated: () => {
      void refresh(true);
    },
  });

  useEffect(() => {
    void refresh(false);
    const id = window.setInterval(() => {
      void refresh(true);
    }, FALLBACK_POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const updateStatus = useCallback(
    async (orderId: string, status: KitchenStatus) => {
      setUpdatingId(orderId);
      try {
        const updated = await kitchenApi.updateOrderStatus(orderId, status);
        await refresh(true);
        const labels: Record<KitchenStatus, string> = {
          QUEUED: 'Pedido na fila',
          PREPARING: 'Preparando',
          READY: 'Marcado como pronto',
          DELIVERED: 'Pedido entregue',
          CANCELLED: 'Pedido cancelado',
        };
        if (status === 'DELIVERED' && updated.tableFinalized) {
          const mesa = updated.tableNumber ?? updated.table?.number;
          message.success(
            mesa != null
              ? `Pedido entregue · Mesa ${mesa} finalizada`
              : 'Pedido entregue · Mesa finalizada',
          );
        } else {
          message.success(labels[status]);
        }
      } catch (err) {
        message.error(getApiErrorMessage(err, 'Não foi possível atualizar o pedido'));
        throw err;
      } finally {
        setUpdatingId(null);
      }
    },
    [message, refresh],
  );

  const updateOrder = useCallback(
    async (orderId: string, payload: UpdateKitchenOrderPayload) => {
      setUpdatingId(orderId);
      try {
        const updated = await kitchenApi.updateKitchenOrder(orderId, payload);
        await refresh(true);
        if (updated.kitchenStatus === 'CANCELLED' || updated.status === 'CANCELLED') {
          message.success('Pedido cancelado');
        } else {
          message.success('Pedido atualizado');
        }
        return updated;
      } catch (err) {
        message.error(getApiErrorMessage(err, 'Não foi possível alterar o pedido'));
        throw err;
      } finally {
        setUpdatingId(null);
      }
    },
    [message, refresh],
  );

  const updateServiceCall = useCallback(
    async (callId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
      setUpdatingId(callId);
      try {
        await kitchenApi.updateServiceCall(callId, status);
        await refresh(true);
        message.success(
          status === 'RESOLVED' ? 'Chamado resolvido' : 'Chamado em atendimento',
        );
      } catch (err) {
        message.error(getApiErrorMessage(err, 'Não foi possível atualizar o chamado'));
        throw err;
      } finally {
        setUpdatingId(null);
      }
    },
    [message, refresh],
  );

  const byStatus = {
    QUEUED: orders.filter((o) => o.kitchenStatus === 'QUEUED'),
    PREPARING: orders.filter((o) => o.kitchenStatus === 'PREPARING'),
    READY: orders.filter((o) => o.kitchenStatus === 'READY'),
  };

  const highlightedTableNumbers = new Set(
    serviceCalls.map((call) => call.tableNumber),
  );

  return {
    orders,
    byStatus,
    serviceCalls,
    highlightedTableNumbers,
    stats,
    loading,
    updatingId,
    flashIds,
    callFlashIds,
    connected,
    refresh,
    updateStatus,
    updateOrder,
    updateServiceCall,
    soundEnabled,
    audioReady,
    toggleSound,
    unlockAudio,
  };
}
