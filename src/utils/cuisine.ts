import type { CuisineType } from '../types';

export const CUISINE_OPTIONS: Array<{ value: CuisineType; label: string }> = [
  { value: 'BRAZILIAN', label: 'Brasileira' },
  { value: 'ITALIAN', label: 'Italiana' },
  { value: 'JAPANESE', label: 'Japonesa' },
  { value: 'CHINESE', label: 'Chinesa' },
  { value: 'MEXICAN', label: 'Mexicana' },
  { value: 'ARABIC', label: 'Árabe' },
  { value: 'FAST_FOOD', label: 'Fast Food' },
  { value: 'PIZZA', label: 'Pizza' },
  { value: 'BURGER', label: 'Hambúrguer' },
  { value: 'SEAFOOD', label: 'Frutos do mar' },
  { value: 'VEGETARIAN', label: 'Vegetariana' },
  { value: 'VEGAN', label: 'Vegana' },
  { value: 'STEAKHOUSE', label: 'Churrascaria' },
  { value: 'CAFE', label: 'Café' },
  { value: 'BAKERY', label: 'Padaria' },
  { value: 'HEALTHY', label: 'Saudável' },
  { value: 'OTHER', label: 'Outra' },
];

export function cuisineLabel(type?: CuisineType | null): string {
  return CUISINE_OPTIONS.find((o) => o.value === type)?.label ?? 'Outra';
}
