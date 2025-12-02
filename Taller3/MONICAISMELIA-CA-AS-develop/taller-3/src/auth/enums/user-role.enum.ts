export enum UserRole {
  ADMIN = 1,
  VETERINARIO = 2,
  ASISTENTE = 3,
  CLIENTE = 4,
}

export const ROLE_NAMES = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.VETERINARIO]: 'Veterinario',
  [UserRole.ASISTENTE]: 'Asistente',
  [UserRole.CLIENTE]: 'Cliente',
};