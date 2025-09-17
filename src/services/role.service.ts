import { v4 as uuidv4 } from 'uuid';
import { CorrelatedMessage, TransportAwareService, transportService, TransportAdapterName } from 'transport-pkg';
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
  async init(): Promise<void> {
    const service: ServiceDTO = await serviceDiscoveryService.getService(SERVICE_NAME);

    this.useTransport(TransportAdapterName.HTTP, { host: service.host, port: service.port });
  }

  getPriority(): number {
    return AppRunPriority.Highest;
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

    const response: CorrelatedMessage = await transportService.send(message, this.getActiveTransportOptions());
    return response.data;
  }
}

export default new RoleService();
