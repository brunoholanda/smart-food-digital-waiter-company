import type {
  BulkCreateTablesPayload,
  CreateTablePayload,
  PublicTableContext,
  Table,
  TablesListResponse,
  UpdateTablePayload,
} from '../types';
import { api } from './client';

export async function listTables(): Promise<TablesListResponse> {
  const { data } = await api.get<TablesListResponse>('/tables');
  return data;
}

export async function createTable(payload: CreateTablePayload): Promise<Table> {
  const { data } = await api.post<Table>('/tables', payload);
  return data;
}

export async function bulkCreateTables(
  payload: BulkCreateTablesPayload,
): Promise<{ created: number; tables: Table[] }> {
  const { data } = await api.post<{ created: number; tables: Table[] }>(
    '/tables/bulk',
    payload,
  );
  return data;
}

export async function updateTable(
  id: string,
  payload: UpdateTablePayload,
): Promise<Table> {
  const { data } = await api.patch<Table>(`/tables/${id}`, payload);
  return data;
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/tables/${id}`);
}

export async function getPublicTable(
  slug: string,
  code: string,
): Promise<PublicTableContext> {
  const { data } = await api.get<PublicTableContext>(
    `/tables/public/${slug}/${code}`,
  );
  return data;
}
