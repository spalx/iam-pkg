import { v4 as uuidv4 } from 'uuid';
import { CorrelatedResponseDTO, TransportAwareService, transportService } from 'transport-pkg';
import { throwErrorForStatus } from 'rest-pkg';
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
  DidRevokeTokenDTO
} from '../types/auth.dto';
import { AuthAction } from '../common/constants';

class AuthService extends TransportAwareService implements IAppPkg {
  private refreshTokenRetrieveCallback: ((accessToken: string) => Promise<string>) | null = null;
  private refreshTokenStoreCallback: ((userId: string, refreshToken: string) => Promise<void>) | null = null;
  private refreshTokenEncryptionKey: string = '';

  async init(): Promise<void> {
    transportService.transportsSend([
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
    //TODO
    // When doing this, it must validate (verify) the access token. If expired, use the refresh token source to refresh the token.
  }

  setRefreshTokenRetrieveCallback(callback: (accessToken: string) => Promise<string>): void {
    this.refreshTokenRetrieveCallback = callback;
  }

  setRefreshTokenStoreCallback(encryptionKey: string, callback: (userId: string, refreshToken: string) => Promise<void>): void {
    this.refreshTokenStoreCallback = callback;
    this.refreshTokenEncryptionKey = encryptionKey;
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
