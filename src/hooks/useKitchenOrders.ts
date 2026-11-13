import { App } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as kitchenApi from '../api/kitchen';
import type { KitchenOrder, KitchenStats, KitchenStatus } from '../types';
import { getApiErrorMessage } from '../utils/format';
import { useKitchenSocket } from './useKitchenSocket';
import { useNewOrderAlert } from './useNewOrderAlert';

const FALLBACK_POLL_MS = 30000;

export function useKitchenOrders() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [stats, setStats] = useState<KitchenStats>({ queued: 0, preparing: 0, ready: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
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

  const refresh = useCallback(async (silent = false) => {
    try {
      const [nextOrders, nextStats] = await Promise.all([
        kitchenApi.getKitchenOrders(),
        kitchenApi.getKitchenStats(),
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
        await kitchenApi.updateOrderStatus(orderId, status);
        await refresh(true);
        const labels: Record<KitchenStatus, string> = {
          QUEUED: 'Pedido na fila',
          PREPARING: 'Preparando',
          READY: 'Marcado como pronto',
          DELIVERED: 'Pedido entregue',
          CANCELLED: 'Pedido cancelado',
        };
        message.success(labels[status]);
      } catch (err) {
        message.error(getApiErrorMessage(err, 'Não foi possível atualizar o pedido'));
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

  return {
    orders,
    byStatus,
    stats,
    loading,
    updatingId,
    flashIds,
    connected,
    refresh,
    updateStatus,
    soundEnabled,
    audioReady,
    toggleSound,
    unlockAudio,
  };
}
