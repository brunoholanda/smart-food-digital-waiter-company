import type {
  Restaurant,
  UpdateOpeningHoursPayload,
  UpdateRestaurantPayload,
} from '../types';
import { api } from './client';

export async function getMyRestaurant(): Promise<Restaurant> {
  const { data } = await api.get<Restaurant>('/restaurants/me');
  return data;
}

export async function updateMyRestaurant(
  payload: UpdateRestaurantPayload,
): Promise<Restaurant> {
  const { data } = await api.patch<Restaurant>('/restaurants/me', payload);
  return data;
}

export async function updateOpeningHours(
  payload: UpdateOpeningHoursPayload,
): Promise<Restaurant> {
  const { data } = await api.patch<Restaurant>(
    '/restaurants/me/opening-hours',
    payload,
  );
  return data;
}

export async function uploadRestaurantImages(files: {
  logo?: File;
  banner?: File;
}): Promise<Restaurant> {
  const form = new FormData();
  if (files.logo) form.append('logo', files.logo);
  if (files.banner) form.append('banner', files.banner);
  const { data } = await api.post<Restaurant>('/restaurants/me/images', form);
  return data;
}
