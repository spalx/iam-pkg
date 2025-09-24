import type { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { jwtVerify, createLocalJWKSet, errors } from 'jose';
import { CorrelatedMessage, TransportAwareService, transportService, TransportAdapterName } from 'transport-pkg';
import { UnauthorizedError, ForbiddenError } from 'rest-pkg';
import { IAppPkg, AppRunPriority } from 'app-life-cycle-pkg';
import { serviceDiscoveryService, ServiceDTO } from 'service-discovery-pkg';

import {
  AuthenticateDTO,
  DidAuthenticateDTO,
  CreateTokenDTO,
  CreateMFATokenDTO,
  DidCreateTokenDTO,
  RefreshTokenDTO,
  DidRefreshTokenDTO,
  RevokeTokenDTO,
  DidGetJWKSDTO
} from '../types/auth.dto';
import { UserEntityDTO } from '../types/user.dto';
import { AuthAction, JWT_KEY_ALGORITHM, SERVICE_NAME } from '../common/constants';

class AuthService extends TransportAwareService implements IAppPkg {
  private accessToken: string = '';
  private user: UserEntityDTO | null = null;
  private jwks = null;

  async init(): Promise<void> {
    const service: ServiceDTO = await serviceDiscoveryService.getService(SERVICE_NAME);

    this.useTransport(TransportAdapterName.HTTP, { host: service.host, port: service.port });
  }

  getPriority(): number {
    return AppRunPriority.Medium;
  }

  getName(): string {
    return 'iam-auth';
  }

  getDependencies(): IAppPkg[] {
    return [
      transportService,
      serviceDiscoveryService
    ];
  }

  async setAccessToken(accessToken: string): Promise<void> {
    const jwks = this.jwks ?? createLocalJWKSet(
      await this.getJWKS()
    );

    try {
      const { payload } = await jwtVerify(accessToken, jwks, {
        algorithms: [JWT_KEY_ALGORITHM],
      });

      if (payload.user) {
        this.user = payload.user as UserEntityDTO;
        this.accessToken = accessToken;
      } else {
        throw new ForbiddenError('Invalid token');
      }
    } catch (err) {
      this.user = null;
      this.accessToken = '';

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
    if (!this.user?.roles) {
      return false;
    }

    return this.user.roles.some(role => {
      const rolePerms = role.permissions;
      return requireAll
        ? permissions.every(p => rolePerms.includes(p)) // All permissions must exist
        : permissions.some(p => rolePerms.includes(p)); // At least one permission
    });
  }

  async getJWKS(correlationId?: string): Promise<DidGetJWKSDTO> {
    return (await this.sendActionViaTransport(AuthAction.GetJWKS, {}, correlationId) as DidGetJWKSDTO);
  }

  async authenticate(data: AuthenticateDTO, correlationId?: string): Promise<DidAuthenticateDTO> {
    return (await this.sendActionViaTransport(AuthAction.Authenticate, data, correlationId) as DidAuthenticateDTO);
  }

  async createToken(data: CreateTokenDTO | CreateMFATokenDTO, request?: IncomingMessage, correlationId?: string): Promise<DidCreateTokenDTO> {
    if (request) {
      const fingerprints = [
        this.getClientIpFromRequest(request),
        this.getUserAgentFromRequest(request)
      ].filter(Boolean);
      data.fingerprints = fingerprints;
    }

    return (await this.sendActionViaTransport(AuthAction.CreateToken, data, correlationId) as DidCreateTokenDTO);
  }

  async refreshToken(data: RefreshTokenDTO, request?: IncomingMessage, correlationId?: string): Promise<DidRefreshTokenDTO> {
    if (request) {
      const fingerprints = [
        this.getClientIpFromRequest(request),
        this.getUserAgentFromRequest(request)
      ].filter(Boolean);
      data.fingerprints = fingerprints;
      data.min_fingerprints_to_match = 2;
    }

    return (await this.sendActionViaTransport(AuthAction.RefreshToken, data, correlationId) as DidRefreshTokenDTO);
  }

  async revokeToken(data: RevokeTokenDTO, correlationId?: string): Promise<void> {
    await this.sendActionViaTransport(AuthAction.RevokeToken, data, correlationId);
  }

  private async sendActionViaTransport(action: AuthAction, data: object, correlationId?: string): Promise<object> {
    const message: CorrelatedMessage = CorrelatedMessage.create(
      correlationId || uuidv4(),
      action,
      this.getActiveTransport(),
      data
    );

    const response: CorrelatedMessage = await transportService.send(message, this.getActiveTransportOptions());
    return response.data;
  }

  private getClientIpFromRequest(req: IncomingMessage): string {
    const xForwardedFor = req.headers['x-forwarded-for'];

    if (typeof xForwardedFor === 'string') {
      const ips = xForwardedFor.split(',').map((ip: string) => ip.trim());
      return ips[0];
    }

    if (Array.isArray(xForwardedFor)) {
      const firstHeader = xForwardedFor[0];
      if (typeof firstHeader === 'string') {
        const ips = firstHeader.split(',').map((ip: string) => ip.trim());
        return ips[0];
      }
    }

    return req.socket?.remoteAddress || '';
  }

  private getUserAgentFromRequest(req: IncomingMessage): string {
    const userAgent = req.headers['user-agent'];

    if (typeof userAgent === 'string') {
      return userAgent;
    }

    if (Array.isArray(userAgent)) {
      const firstAgent = userAgent[0];
      if (typeof firstAgent === 'string') {
        return firstAgent;
      }
    }

    return '';
  }
}

export default new AuthService();
