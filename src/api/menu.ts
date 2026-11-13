import type {
  CreateCategoryPayload,
  CreateItemPayload,
  MenuCategory,
  MenuItem,
  UpdateCategoryPayload,
  UpdateItemPayload,
} from '../types';
import { api } from './client';

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<MenuCategory> {
  const { data } = await api.post<MenuCategory>('/menu/categories', payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<MenuCategory> {
  const { data } = await api.patch<MenuCategory>(`/menu/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/menu/categories/${id}`);
}

export async function uploadCategoryImage(
  id: string,
  image: File,
): Promise<MenuCategory> {
  const form = new FormData();
  form.append('image', image);
  const { data } = await api.post<MenuCategory>(
    `/menu/categories/${id}/image`,
    form,
  );
  return data;
}

export async function createItem(payload: CreateItemPayload): Promise<MenuItem> {
  const { data } = await api.post<MenuItem>('/menu/items', payload);
  return data;
}

export async function updateItem(
  id: string,
  payload: UpdateItemPayload,
): Promise<MenuItem> {
  const { data } = await api.patch<MenuItem>(`/menu/items/${id}`, payload);
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  await api.delete(`/menu/items/${id}`);
}

export async function uploadItemImage(id: string, image: File): Promise<MenuItem> {
  const form = new FormData();
  form.append('image', image);
  const { data } = await api.post<MenuItem>(`/menu/items/${id}/image`, form);
  return data;
}
