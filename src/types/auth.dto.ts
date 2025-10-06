import { z } from 'zod';
import { exportJWK } from 'jose';

type JoseJWK = Awaited<ReturnType<typeof exportJWK>>;

export interface JWKSKey extends JoseJWK {
  kid: string;
  alg: string;
  use: 'sig';
}

export interface GetJWKSDTO {
  //
}

export interface DidGetJWKSDTO {
  keys: JWKSKey[];
}

export interface AuthenticateDTO {
  identity: string;
  password?: string;
}

export const AuthenticateDTOSchema = z.object({
  identity: z.string('identity must be a string').min(1, 'identity cannot be empty'),
  password: z.string('password must be a string').optional(),
});

export interface DidAuthenticateDTO {
  mfa_code: string;
  challenge_id: string;
}

export interface CreateTokenDTO {
  identity: string;
  password?: string;
  fingerprints?: string[];
}

export const CreateTokenDTOSchema = z.object({
  identity: z.string('identity must be a string').min(1, 'identity cannot be empty'),
  password: z.string('password must be a string').optional(),
  fingerprints: z.array(z.string('each fingerprint must be a string').min(1, 'each fingerprint cannot be empty'), 'fingerprints must be an array').optional(),
});

export interface CreateMFATokenDTO {
  challenge_id: string;
  mfa_code: string;
  fingerprints?: string[];
}

export const CreateMFATokenDTOSchema = z.object({
  challenge_id: z.string('challenge_id must be a string').min(1, 'challenge_id cannot be empty'),
  mfa_code: z.string('mfa_code must be a string').min(1, 'mfa_code cannot be empty'),
  fingerprints: z.array(z.string('each fingerprint must be a string').min(1, 'each fingerprint cannot be empty'), 'fingerprints must be an array').optional(),
});

export interface DidCreateTokenDTO {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenDTO {
  refresh_token: string;
  fingerprints?: string[];
  min_fingerprints_to_match?: number;
}

export const RefreshTokenDTOSchema = z.object({
  refresh_token: z.string('refresh_token must be a string').min(1, 'refresh_token cannot be empty'),
  fingerprints: z.array(z.string('each fingerprint must be a string').min(1, 'each fingerprint cannot be empty'), 'fingerprints must be an array').optional(),
});

export interface DidRefreshTokenDTO {
  access_token: string;
  refresh_token: string;
}

export interface RevokeTokenDTO {
  refresh_token: string;
}

export const RevokeTokenDTOSchema = z.object({
  refresh_token: z.string('refresh_token must be a string').min(1, 'refresh_token cannot be empty'),
});
