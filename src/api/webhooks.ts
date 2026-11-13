import { api } from './client';

export type WebhookEndpoint = {
  id: string;
  restaurantId: string;
  url: string;
  secret: string;
  description?: string | null;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { deliveries: number };
};

export type WebhookDelivery = {
  id: string;
  endpointId: string;
  event: string;
  payload: unknown;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  responseCode?: number | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  attempts: number;
  createdAt: string;
};

export async function listWebhooks() {
  const { data } = await api.get<WebhookEndpoint[]>('/webhooks');
  return data;
}

export async function createWebhook(payload: {
  url: string;
  description?: string;
  events?: string[];
}) {
  const { data } = await api.post<WebhookEndpoint>('/webhooks', payload);
  return data;
}

export async function updateWebhook(
  id: string,
  payload: Partial<{
    url: string;
    description: string;
    events: string[];
    isActive: boolean;
  }>,
) {
  const { data } = await api.patch<WebhookEndpoint>(`/webhooks/${id}`, payload);
  return data;
}

export async function deleteWebhook(id: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`/webhooks/${id}`);
  return data;
}

export async function rotateWebhookSecret(id: string) {
  const { data } = await api.post<WebhookEndpoint>(
    `/webhooks/${id}/rotate-secret`,
  );
  return data;
}

export async function listWebhookDeliveries(id: string) {
  const { data } = await api.get<WebhookDelivery[]>(
    `/webhooks/${id}/deliveries`,
  );
  return data;
}
