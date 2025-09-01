import { v4 as uuidv4 } from 'uuid';
import { jwtVerify, createLocalJWKSet, errors } from 'jose';
import { CorrelatedResponseDTO, TransportAwareService, transportService } from 'transport-pkg';
import { throwErrorForStatus, UnauthorizedError, ForbiddenError } from 'rest-pkg';
import { IAppPkg, AppRunPriority } from 'app-life-cycle-pkg';

import {
  AuthenticateDTO,
  DidAuthenticateDTO,
  CreateTokenDTO,
  CreateMFATokenDTO,
  DidCreateTokenDTO,
  RefreshTokenDTO,
  DidRefreshTokenDTO,
  RevokeTokenDTO,
  DidRevokeTokenDTO,
  GetJWKSDTO,
  DidGetJWKSDTO
} from '../types/auth.dto';
import { UserEntityDTO } from '../types/user.dto';
import { AuthAction, JWT_KEY_ALGORITHM } from '../common/constants';

class AuthService extends TransportAwareService implements IAppPkg {
  private accessToken: string = '';
  private user: UserEntityDTO | null = null;
  private jwks = null;

  async init(): Promise<void> {
    transportService.transportsSend([
      AuthAction.GetJWKS,
      AuthAction.Authenticate,
      AuthAction.CreateToken,
      AuthAction.RefreshToken,
      AuthAction.RevokeToken
    ]);
  }

  getPriority(): number {
    return AppRunPriority.Highest;
  }

  async setAccessToken(accessToken: string): Promise<void> {
    const jwks = this.jwks ?? createLocalJWKSet(
      await this.getJWKS({})
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

  async getJWKS(data: GetJWKSDTO, correlationId?: string): Promise<DidGetJWKSDTO> {
    return (await this.sendActionViaTransport(AuthAction.GetJWKS, data, correlationId) as DidGetJWKSDTO);
  }

  async authenticate(data: AuthenticateDTO, correlationId?: string): Promise<DidAuthenticateDTO> {
    return (await this.sendActionViaTransport(AuthAction.Authenticate, data, correlationId) as DidAuthenticateDTO);
  }

  async createToken(data: CreateTokenDTO | CreateMFATokenDTO, correlationId?: string): Promise<DidCreateTokenDTO> {
    return (await this.sendActionViaTransport(AuthAction.CreateToken, data, correlationId) as DidCreateTokenDTO);
  }

  async refreshToken(data: RefreshTokenDTO, correlationId?: string): Promise<DidRefreshTokenDTO> {
    return (await this.sendActionViaTransport(AuthAction.RefreshToken, data, correlationId) as DidRefreshTokenDTO);
  }

  async revokeToken(data: RevokeTokenDTO, correlationId?: string): Promise<DidRevokeTokenDTO> {
    return (await this.sendActionViaTransport(AuthAction.RevokeToken, data, correlationId) as DidRevokeTokenDTO);
  }

  private async sendActionViaTransport(action: AuthAction, data: object, correlationId?: string): Promise<object> {
    const response: CorrelatedResponseDTO = await transportService.send(
      {
        action,
        data,
        correlation_id: correlationId || uuidv4(),
        transport_name: this.getActiveTransport()
      },
      this.getActiveTransportOptions()
    );

    if (response.status !== 0) {
      throwErrorForStatus(response.status, response.error || '');
    }

    return response.data;
  }
}

export default new AuthService();
