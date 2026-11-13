import { App } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';
import { useAuth } from './AuthContext';
import { useNewOrderAlert } from './useNewOrderAlert';

export type KitchenSocketOrderPayload = {
  event: string;
  occurredAt: string;
  restaurantId: string;
  order: {
    id: string;
    code: string;
    tableNumber: number | null;
    customerName: string | null;
    total: string | number;
    kitchenStatus: string | null;
  };
};

type Options = {
  onOrderCreated?: (payload: KitchenSocketOrderPayload) => void;
  onOrderUpdated?: (payload: KitchenSocketOrderPayload) => void;
};

export function useKitchenSocket(options: Options = {}) {
  const { token, isAuthenticated } = useAuth();
  const { message } = App.useApp();
  const { notifyNewQueued } = useNewOrderAlert();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(`${env.socketUrl}/kitchen`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('kitchen.order.created', (payload: KitchenSocketOrderPayload) => {
      notifyNewQueued(1);
      message.info({
        content: `Novo pedido ${payload.order.code}${
          payload.order.tableNumber != null
            ? ` · Mesa ${payload.order.tableNumber}`
            : ''
        }`,
        duration: 4,
      });
      optionsRef.current.onOrderCreated?.(payload);
    });

    socket.on('kitchen.order.updated', (payload: KitchenSocketOrderPayload) => {
      optionsRef.current.onOrderUpdated?.(payload);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, token, message, notifyNewQueued]);

  return { connected };
}
