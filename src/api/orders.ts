import type {
  CreateOrderPayload,
  CreateServiceCallPayload,
  Order,
  PayOrderPayload,
  ServiceCall,
  TableBill,
  TableStatus,
} from '../types';
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

export async function getPublicTableBill(
  slug: string,
  tableCode: string,
): Promise<TableBill> {
  const { data } = await api.get<TableBill>(
    `/public/tables/${slug}/${tableCode}/bill`,
  );
  return data;
}

export async function getPublicTableStatus(
  slug: string,
  tableCode: string,
): Promise<TableStatus> {
  const { data } = await api.get<TableStatus>(
    `/public/tables/${slug}/${tableCode}/status`,
  );
  return data;
}

export async function createServiceCall(
  payload: CreateServiceCallPayload,
): Promise<ServiceCall> {
  const { data } = await api.post<ServiceCall>('/public/service-calls', payload);
  return data;
}
