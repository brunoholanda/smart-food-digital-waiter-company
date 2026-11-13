import type { Restaurant } from '../types';

export type CompletionItem = {
  key: string;
  label: string;
  done: boolean;
  weight: number;
  href?: string;
};

function filled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  return Boolean(value);
}

export function getProfileCompletion(restaurant: Restaurant): {
  percent: number;
  completed: number;
  total: number;
  items: CompletionItem[];
  missing: CompletionItem[];
} {
  const hasAddress =
    filled(restaurant.zipCode) &&
    filled(restaurant.street) &&
    filled(restaurant.number) &&
    filled(restaurant.neighborhood) &&
    filled(restaurant.city) &&
    filled(restaurant.state);

  const categories = restaurant.categories ?? [];
  const itemsCount = categories.reduce(
    (acc, cat) => acc + (cat.items?.length ?? 0),
    0,
  );
  const hasMenu = categories.length > 0 && itemsCount > 0;
  const hasHours = (restaurant.openingHours?.length ?? 0) >= 7;

  const items: CompletionItem[] = [
    {
      key: 'logo',
      label: 'Logo / foto de perfil',
      done: filled(restaurant.logoUrl),
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'banner',
      label: 'Imagem de banner',
      done: filled(restaurant.bannerUrl),
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'description',
      label: 'Descrição do restaurante',
      done: filled(restaurant.description),
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'document',
      label: 'CPF ou CNPJ',
      done: filled(restaurant.document),
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'legalName',
      label: 'Razão social',
      done: filled(restaurant.legalName),
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      done: filled(restaurant.whatsapp),
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'address',
      label: 'Endereço completo',
      done: hasAddress,
      weight: 2,
      href: '/app/profile',
    },
    {
      key: 'hours',
      label: 'Horários de funcionamento',
      done: hasHours,
      weight: 1,
      href: '/app/profile',
    },
    {
      key: 'menu',
      label: 'Cardápio com ao menos 1 item',
      done: hasMenu,
      weight: 2,
      href: '/app/menu',
    },
    {
      key: 'published',
      label: 'Cardápio publicado',
      done: restaurant.isPublished === true,
      weight: 1,
      href: '/app',
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const doneWeight = items
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);

  const percent = Math.round((doneWeight / totalWeight) * 100);
  const completed = items.filter((item) => item.done).length;
  const missing = items.filter((item) => !item.done);

  return {
    percent,
    completed,
    total: items.length,
    items,
    missing,
  };
}
