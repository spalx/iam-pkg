export interface RoleEntityDTO {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserEntityDTO {
  id: string;
  roles: RoleEntityDTO[];
  meta: Record<string, unknown>;
}

export interface CreateUserDTO {
  identities: string[];
  password?: string;
  mfa_enabled?: boolean;
  is_active?: boolean;
  roles: string[];
  meta?: Record<string, unknown>;
}
