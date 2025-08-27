export interface RoleEntityDTO {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserEntityDTO {
  id: string;
  identities: string[];
  roles: RoleEntityDTO[];
  meta: Record<string, unknown>;
}
