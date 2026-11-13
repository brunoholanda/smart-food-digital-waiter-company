import type {
  ActiveKitchenStatus,
  KitchenOrder,
  KitchenStats,
  KitchenStatus,
  PaymentMethod,
  ServiceCall,
  ServiceCallStatus,
  TableBill,
  UpdateKitchenOrderPayload,
} from '../types';
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
): Promise<KitchenOrder & { tableFinalized?: boolean }> {
  const { data } = await api.patch<KitchenOrder & { tableFinalized?: boolean }>(
    `/kitchen/orders/${orderId}/status`,
    { status },
  );
  return data;
}

export async function updateKitchenOrder(
  orderId: string,
  payload: UpdateKitchenOrderPayload,
): Promise<KitchenOrder> {
  const { data } = await api.patch<KitchenOrder>(
    `/kitchen/orders/${orderId}`,
    payload,
  );
  return data;
}

export async function getServiceCalls(): Promise<ServiceCall[]> {
  const { data } = await api.get<ServiceCall[]>('/kitchen/service-calls');
  return data;
}

export async function updateServiceCall(
  callId: string,
  status: ServiceCallStatus,
): Promise<ServiceCall> {
  const { data } = await api.patch<ServiceCall>(`/kitchen/service-calls/${callId}`, {
    status,
  });
  return data;
}

export async function getTableBill(tableId: string): Promise<TableBill> {
  const { data } = await api.get<TableBill>(`/kitchen/tables/${tableId}/bill`);
  return data;
}

export async function settleTableBill(
  tableId: string,
  payload: { method: PaymentMethod; paymentRef?: string; notes?: string },
): Promise<{
  settledCount: number;
  method: PaymentMethod;
  paymentRef: string;
  bill: TableBill;
  tableFinalized?: boolean;
}> {
  const { data } = await api.post(`/kitchen/tables/${tableId}/settle`, payload);
  return data;
}
