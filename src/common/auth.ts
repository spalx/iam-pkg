import authService from '../services/auth.service';

export function can(permissions: string[], requireAll: boolean = true): boolean {
  return authService.can(permissions, requireAll);
}
