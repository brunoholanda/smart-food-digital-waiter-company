import type { CreateOrderPayload, Order, PayOrderPayload } from '../types';
import { api } from './client';

export async function createPublicOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>('/public/orders', payload);
  return data;
}

export async function payPublicOrder(
  id: string,
  payload: PayOrderPayload,
): Promise<Order> {
  const { data } = await api.post<Order>(`/public/orders/${id}/pay`, payload);
  return data;
}

export async function getPublicOrder(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/public/orders/${id}`);
  return data;
}
