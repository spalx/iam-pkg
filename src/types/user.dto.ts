import { z } from 'zod';

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

export const CreateUserDTOSchema = z.object({
  identities: z.array(z.string({
    invalid_type_error: "each identity must be a string",
  })).min(1, { message: "identities is required" }),

  password: z.string({
    invalid_type_error: "password must be a string"
  }).optional().refine(val => val === undefined || val.trim() !== '', {
    message: "password cannot be empty",
  }),

  mfa_enabled: z.boolean({
    invalid_type_error: "mfa_enabled must be a boolean",
  }).optional(),

  is_active: z.boolean({
    invalid_type_error: "is_active must be a boolean",
  }).optional(),

  roles: z.array(z.string({
    invalid_type_error: "each role must be a string",
  })).min(1, { message: "roles is required" }),

  meta: z.record(z.unknown(), {
    invalid_type_error: "meta must be an object",
  }).optional(),
});

export interface GetUserDTO {
  id?: string;
  identity?: string;
}

export const GetUserDTOSchema = z.union([
  z.object({
    id: z.string().min(1, "id cannot be empty"),
    identity: z.never().optional(),
  }),
  z.object({
    identity: z.string().min(1, "identity cannot be empty"),
    id: z.never().optional(),
  }),
]);

export interface DeleteUserDTO {
  id: string;
}

export const DeleteUserDTOSchema = z.object([
  id: z.string({
    required_error: "id is required",
    invalid_type_error: "id must be a string"
  }).min(1, "id cannot be empty"),
]);
