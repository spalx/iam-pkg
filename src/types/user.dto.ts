export interface UserRoleEntityDTO {
  id: number;
  name: string;
  permissions: string[];
}

export interface UserEntityDTO {
  id: number;
  identity: string;
  user_roles: UserRoleEntityDTO[];
  meta: Record<string, unknown>;
}
