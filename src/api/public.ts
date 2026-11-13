import type { PublicRestaurantListItem, Restaurant } from '../types';
import { api } from './client';

export async function listPublicRestaurants(): Promise<PublicRestaurantListItem[]> {
  const { data } = await api.get<PublicRestaurantListItem[]>('/public/restaurants');
  return data;
}

export async function getPublicMenu(slug: string): Promise<Restaurant> {
  const { data } = await api.get<Restaurant>(`/public/menu/${slug}`);
  return data;
}
