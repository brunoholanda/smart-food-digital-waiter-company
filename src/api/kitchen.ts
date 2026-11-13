import type { ActiveKitchenStatus, KitchenOrder, KitchenStats, KitchenStatus } from '../types';
import { api } from './client';

export async function getKitchenStats(): Promise<KitchenStats> {
  const { data } = await api.get<KitchenStats>('/kitchen/stats');
  return data;
}

export async function getKitchenOrders(
  status?: ActiveKitchenStatus,
): Promise<KitchenOrder[]> {
  const { data } = await api.get<KitchenOrder[]>('/kitchen/orders', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getKitchenHistory(): Promise<KitchenOrder[]> {
  const { data } = await api.get<KitchenOrder[]>('/kitchen/orders/history');
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: KitchenStatus,
): Promise<KitchenOrder> {
  const { data } = await api.patch<KitchenOrder>(
    `/kitchen/orders/${orderId}/status`,
    { status },
  );
  return data;
}
