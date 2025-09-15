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
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string"
  }).min(1, "name cannot be empty"),

  permissions: z.array(z.string({
    invalid_type_error: "each permission must be a string",
  })).min(1, { message: "permissions is required" }),
});

export interface UpdateRoleDTO {
  id: string;
  name?: string;
  permissions?: string[];
}

export const UpdateRoleDTOSchema = z.object({
  id: z.string({
    required_error: "id is required",
    invalid_type_error: "id must be a string"
  }).min(1, "id cannot be empty"),

  name: z.string({
    invalid_type_error: "name must be a string"
  }).optional().refine(val => val === undefined || val.trim() !== '', {
    message: "name cannot be empty",
  }),

  permissions: z.array(z.string({
    invalid_type_error: "each identity must be a string",
  })).optional(),
});

export interface GetRoleDTO {
  id?: string;
  name?: string;
}

export const GetRoleDTOSchema = z.union([
  z.object({
    id: z.string().min(1, "id cannot be empty"),
    name: z.never().optional(),
  }),
  z.object({
    name: z.string().min(1, "name cannot be empty"),
    id: z.never().optional(),
  }),
]);

export interface DeleteRoleDTO {
  id: string;
}

export const DeleteRoleDTOSchema = z.object({
  id: z.string({
    required_error: "id is required",
    invalid_type_error: "id must be a string"
  }).min(1, "id cannot be empty"),
});
