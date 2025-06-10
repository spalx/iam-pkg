import { z } from 'zod';

export interface AuthenticateDTO {
  identity: string;
  password: string;
}

export const AuthenticateDTOSchema = z.object({
  identity: z.string(),
  password: z.string(),
});

export interface CreateTokenDTO {
  identity: string;
  password?: string;
  code?: string;
}

export const CreateTokenDTOSchema = z.object({
  client: z.string(),
  password: z.string().optional(),
  code: z.string().optional(),
});

export interface DidCreateTokenDTO {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenDTO {
  refresh_token: string;
}

export const RefreshTokenDTOSchema = z.object({
  refresh_token: z.string(),
});

export interface DidRefreshTokenDTO {
  access_token: string;
  refresh_token: string;
}
