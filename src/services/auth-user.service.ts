import { jwtVerify, createLocalJWKSet, errors, JWTPayload } from 'jose';
import { UnauthorizedError, ForbiddenError } from '@spalx/rest-pkg';

import { UserEntityDTO } from '../types/user.dto';
import { JWT_KEY_ALGORITHM } from '../common/constants';
import authService from './auth.service';

class AuthUserService {
  private user: UserEntityDTO | null = null;
  private jwks = null;

  async getUserFromToken(accessToken: string): Promise<UserEntityDTO | null> {
    try {
      const payload = await this.parseJwtToken(accessToken);
      return payload.user as UserEntityDTO ?? null;
    } catch (err) {
      if (err instanceof errors.JWTExpired) {
        return (err as errors.JWTExpired).payload.user as UserEntityDTO;
      }

      return null;
    }
  }

  async setAccessToken(accessToken: string): Promise<void> {
    try {
      const payload = await this.parseJwtToken(accessToken);
      this.user = payload.user as UserEntityDTO;
    } catch (err) {
      this.user = null;

      if (err instanceof errors.JWTExpired) {
        throw new UnauthorizedError('Token expired');
      }

      throw new ForbiddenError('Invalid token');
    }
  }

  getCurrentUser(): UserEntityDTO | null {
    return this.user;
  }

  can(permissions: string[], requireAll: boolean = true): boolean {
    if (!this.user) {
      return false;
    }

    return this.canUser(this.user, permissions, requireAll);
  }

  canUser(user: UserEntityDTO, permissions: string[], requireAll: boolean = true): boolean {
    if (!permissions.length) {
      return true;
    }

    if (!user.roles) {
      return false;
    }

    return user.roles.some(role => {
      const rolePerms = role.permissions;
      return requireAll
        ? permissions.every(p => rolePerms.includes(p)) // All permissions must exist
        : permissions.some(p => rolePerms.includes(p)); // At least one permission
    });
  }

  private async parseJwtToken(jwt: string): Promise<JWTPayload> {
    const jwks = this.jwks ?? createLocalJWKSet(await authService.getJWKS());

    const { payload } = await jwtVerify(jwt, jwks, {
      algorithms: [JWT_KEY_ALGORITHM],
    });

    return payload;
  }    
}

export default AuthUserService;
