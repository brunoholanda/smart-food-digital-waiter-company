import dayjs from 'dayjs';
import type { KitchenStatus, PaymentMethod } from '../types';

export function formatCurrency(value: number | string | null | undefined): string {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatElapsed(from: string | null | undefined, now = Date.now()): string {
  if (!from) return '—';
  const start = dayjs(from);
  if (!start.isValid()) return '—';
  const totalSeconds = Math.max(0, Math.floor((now - start.valueOf()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : '—';
}

export function kitchenStatusLabel(status: KitchenStatus | null | undefined): string {
  switch (status) {
    case 'QUEUED':
      return 'Na fila';
    case 'PREPARING':
      return 'Preparando';
    case 'READY':
      return 'Pronto';
    case 'DELIVERED':
      return 'Entregue';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return '—';
  }
}

export function paymentMethodLabel(method: PaymentMethod | null | undefined): string {
  switch (method) {
    case 'PIX':
      return 'PIX';
    case 'CARD':
      return 'Cartão';
    case 'CASH':
      return 'Dinheiro';
    default:
      return '—';
  }
}

export function parseAddons(addons: string[] | null | undefined): string[] {
  if (!addons || !Array.isArray(addons)) return [];
  return addons.filter(Boolean);
}

export function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === '') return 0;
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}

export const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${withCountry}${text}`;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } })
      .response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
