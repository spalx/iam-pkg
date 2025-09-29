import { v4 as uuidv4 } from 'uuid';
import { CorrelatedMessage, TransportAwareService, transportService, TransportAdapterName, CircuitBreaker } from 'transport-pkg';
import { GetAllRestQueryParams, GetAllRestPaginatedResponse } from 'rest-pkg';
import { IAppPkg, AppRunPriority } from 'app-life-cycle-pkg';
import { serviceDiscoveryService, ServiceDTO } from 'service-discovery-pkg';

import {
  GetRoleDTO,
  RoleEntityDTO,
  CreateRoleDTO,
  UpdateRoleDTO,
  DeleteRoleDTO
} from '../types/role.dto';
import { RoleAction, SERVICE_NAME } from '../common/constants';

class RoleService extends TransportAwareService implements IAppPkg {
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
    return 'iam-role';
  }

  getDependencies(): IAppPkg[] {
    return [
      transportService,
      serviceDiscoveryService
    ];
  }

  async getRole(data: GetRoleDTO, correlationId?: string): Promise<RoleEntityDTO> {
    return (await this.sendActionViaTransport(RoleAction.GetRole, data, correlationId) as RoleEntityDTO);
  }

  async getRoles(data: GetAllRestQueryParams, correlationId?: string): Promise<GetAllRestPaginatedResponse<RoleEntityDTO>> {
    return (await this.sendActionViaTransport(RoleAction.GetRoles, data, correlationId) as GetAllRestPaginatedResponse<RoleEntityDTO>);
  }

  async createRole(data: CreateRoleDTO, correlationId?: string): Promise<RoleEntityDTO> {
    return (await this.sendActionViaTransport(RoleAction.CreateRole, data, correlationId) as RoleEntityDTO);
  }

  async updateRole(data: UpdateRoleDTO, correlationId?: string): Promise<RoleEntityDTO> {
    return (await this.sendActionViaTransport(RoleAction.UpdateRole, data, correlationId) as RoleEntityDTO);
  }

  async deleteRole(data: DeleteRoleDTO, correlationId?: string): Promise<void> {
    await this.sendActionViaTransport(RoleAction.DeleteRole, data, correlationId);
  }

  private async sendActionViaTransport(action: RoleAction, data: object, correlationId?: string): Promise<object> {
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

export default new RoleService();
