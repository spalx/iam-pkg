import { z } from 'zod';

export interface RoleEntityDTO {
  id: string;
  name: string;
  permissions: string[];
}

export interface CreateRoleDTO {
  name: string;
  permissions: string[];
}

export const CreateRoleDTOSchema = z.object({
  name: z.string('name must be a string').min(1, 'name cannot be empty'),
  permissions: z.array(z.string('each permission must be a string').min(1, 'each permission cannot be empty'), 'permissions must be an array').min(1, 'permissions cannot be empty'),
});

export interface UpdateRoleDTO {
  id: string;
  name?: string;
  permissions?: string[];
}

export const UpdateRoleDTOSchema = z.object({
  id: z.uuidv4('id must be in uuid4 format'),
  name: z.string('name must be a string').optional(),
  permissions: z.array(z.string('each permission must be a string').min(1, 'each permission cannot be empty'), 'permissions must be an array').optional(),
});

export interface GetRoleDTO {
  id?: string;
  name?: string;
}

export const GetRoleDTOSchema = z.union([
  z.object({
    id: z.uuidv4('id must be in uuid4 format'),
    name: z.never().optional(),
  }),
  z.object({
    name: z.string().min(1, 'name cannot be empty'),
    id: z.never().optional(),
  }),
]);

export interface DeleteRoleDTO {
  id: string;
}

export const DeleteRoleDTOSchema = z.object({
  id: z.uuidv4('id must be in uuid4 format'),
});
