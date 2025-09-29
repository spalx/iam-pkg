import { v4 as uuidv4 } from 'uuid';
import { CorrelatedMessage, TransportAwareService, transportService, TransportAdapterName, CircuitBreaker } from 'transport-pkg';
import { GetAllRestQueryParams, GetAllRestPaginatedResponse } from 'rest-pkg';
import { IAppPkg, AppRunPriority } from 'app-life-cycle-pkg';
import { serviceDiscoveryService, ServiceDTO } from 'service-discovery-pkg';

import {
  GetUserDTO,
  UserEntityDTO,
  CreateUserDTO,
  UpdateUserDTO,
  DeleteUserDTO
} from '../types/user.dto';
import { UserAction, SERVICE_NAME } from '../common/constants';

class UserService extends TransportAwareService implements IAppPkg {
  private sendBreaker: CircuitBreaker<[CorrelatedMessage, Record<string, unknown>], CorrelatedMessage>;

  constructor() {
    super();

    this.sendBreaker = new CircuitBreaker<[CorrelatedMessage, Record<string, unknown>], CorrelatedMessage>(
      (req, options) => transportService.send(req, options),
      {
        timeout: 2000,
        errorThresholdPercentage: 50,
        retryTimeout: 5000,
      }
    );
  }

  async init(): Promise<void> {
    const service: ServiceDTO = await serviceDiscoveryService.getService(SERVICE_NAME);

    this.useTransport(TransportAdapterName.HTTP, { host: service.host, port: service.port });
  }

  getPriority(): number {
    return AppRunPriority.Medium;
  }

  getName(): string {
    return 'iam-user';
  }

  getDependencies(): IAppPkg[] {
    return [
      transportService,
      serviceDiscoveryService
    ];
  }

  async getUser(data: GetUserDTO, correlationId?: string): Promise<UserEntityDTO> {
    return (await this.sendActionViaTransport(UserAction.GetUser, data, correlationId) as UserEntityDTO);
  }

  async getUsers(data: GetAllRestQueryParams, correlationId?: string): Promise<GetAllRestPaginatedResponse<UserEntityDTO>> {
    return (await this.sendActionViaTransport(UserAction.GetUsers, data, correlationId) as GetAllRestPaginatedResponse<UserEntityDTO>);
  }

  async createUser(data: CreateUserDTO, correlationId?: string): Promise<UserEntityDTO> {
    return (await this.sendActionViaTransport(UserAction.CreateUser, data, correlationId) as UserEntityDTO);
  }

  async updateUser(data: UpdateUserDTO, correlationId?: string): Promise<UserEntityDTO> {
    return (await this.sendActionViaTransport(UserAction.UpdateUser, data, correlationId) as UserEntityDTO);
  }

  async deleteUser(data: DeleteUserDTO, correlationId?: string): Promise<void> {
    await this.sendActionViaTransport(UserAction.DeleteUser, data, correlationId);
  }

  private async sendActionViaTransport(action: UserAction, data: object, correlationId?: string): Promise<object> {
    const message: CorrelatedMessage = CorrelatedMessage.create(
      correlationId || uuidv4(),
      action,
      this.getActiveTransport(),
      data
    );

    const response: CorrelatedMessage = await this.sendBreaker.exec(message, this.getActiveTransportOptions());
    return response.data;
  }
}

export default new UserService();
