import { z } from 'zod';

export interface AuthenticateDTO {
  identity: string;
  password: string;
}

export const AuthenticateDTOSchema = z.object({
  identity: z.string({
    required_error: "identity is required",
    invalid_type_error: "identity must be a string"
  }).min(1, "identity cannot be empty"),

  password: z.string({
    required_error: "password is required",
    invalid_type_error: "password must be a string"
  }).min(1, "password cannot be empty"),
});

export interface DidAuthenticateDTO {
  code?: string;
}

export interface CreateTokenDTO {
  identity: string;
  password?: string;
  code?: string;
}

export const CreateTokenDTOSchema = z.object({
  identity: z.string({
    required_error: "identity is required",
    invalid_type_error: "identity must be a string"
  }).min(1, "identity cannot be empty"),

  password: z.string({
    invalid_type_error: "password must be a string"
  })
  .optional()
  .refine(val => val === undefined || val.trim() !== '', {
    message: "password cannot be empty",
  }),

  code: z.string({
    invalid_type_error: "code must be a string"
  })
  .optional()
  .refine(val => val === undefined || val.trim() !== '', {
    message: "code cannot be empty",
  }),
});

export interface DidCreateTokenDTO {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenDTO {
  refresh_token: string;
}

export const RefreshTokenDTOSchema = z.object({
  refresh_token: z.string({
    required_error: "refresh_token is required",
    invalid_type_error: "refresh_token must be a string"
  }).min(1, "refresh_token cannot be empty"),
});

export interface DidRefreshTokenDTO {
  access_token: string;
  refresh_token: string;
}

export interface RevokeTokenDTO {
  refresh_token: string;
}

export const RevokeTokenDTOSchema = z.object({
  refresh_token: z.string({
    required_error: "refresh_token is required",
    invalid_type_error: "refresh_token must be a string"
  }).min(1, "refresh_token cannot be empty"),
});
