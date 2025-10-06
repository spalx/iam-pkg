import { z } from 'zod';

import { RoleEntityDTO } from './role.dto';

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
  identities: z.array(z.string('each identity must be a string').min(1, 'each identity cannot be empty'), 'identities must be an array').min(1, 'identities cannot be empty'),
  password: z.string('password must be a string').optional(),
  mfa_enabled: z.boolean('mfa_enabled must be a boolean').optional(),
  is_active: z.boolean('is_active must be a boolean').optional(),
  roles: z.array(z.string('each role must be a string').min(1, 'each role cannot be empty'), 'roles must be an array').min(1, 'roles cannot be empty'),
  meta: z.record(z.string(), z.unknown(), 'meta must be an object').optional(),
});

export interface UpdateUserDTO {
  id: string;
  identities?: string[];
  password?: string;
  mfa_enabled?: boolean;
  is_active?: boolean;
  roles?: string[];
  meta?: Record<string, unknown>;
}

export const UpdateUserDTOSchema = z.object({
  id: z.uuidv4('id must be in uuid4 format'),
  identities: z.array(z.string('each identity must be a string').min(1, 'each identity cannot be empty'), 'identities must be an array').optional(),
  password: z.string('password must be a string').optional(),
  mfa_enabled: z.boolean('mfa_enabled must be a boolean').optional(),
  is_active: z.boolean('is_active must be a boolean').optional(),
  roles: z.array(z.string('each role must be a string').min(1, 'each role cannot be empty'), 'roles must be an array').optional(),
  meta: z.record(z.string(), z.unknown(), 'meta must be an object').optional(),
});

export interface GetUserDTO {
  id?: string;
  identity?: string;
}

export const GetUserDTOSchema = z.union([
  z.object({
    id: z.uuidv4('id must be in uuid4 format'),
    identity: z.never().optional(),
  }),
  z.object({
    identity: z.string().min(1, 'identity cannot be empty'),
    id: z.never().optional(),
  }),
]);

export interface DeleteUserDTO {
  id: string;
}

export const DeleteUserDTOSchema = z.object({
  id: z.uuidv4('id must be in uuid4 format'),
});
