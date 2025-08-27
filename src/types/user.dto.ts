export interface RoleEntityDTO {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserEntityDTO {
  id: string;
  identity: string;
  user_roles: UserRoleEntityDTO[];
  meta: Record<string, unknown>;
}
