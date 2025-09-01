import { v4 as uuidv4 } from 'uuid';
import { CorrelatedResponseDTO, TransportAwareService, transportService } from 'transport-pkg';
import { throwErrorForStatus, GetAllRestQueryParams, GetAllRestPaginatedResponse } from 'rest-pkg';
import { IAppPkg, AppRunPriority } from 'app-life-cycle-pkg';

import {
  GetRoleDTO,
  RoleEntityDTO,
  CreateRoleDTO,
  UpdateRoleDTO,
  DeleteRoleDTO,
  DidDeleteRoleDTO
} from '../types/role.dto';
import { RoleAction } from '../common/constants';

class RoleService extends TransportAwareService implements IAppPkg {
  async init(): Promise<void> {
    transportService.transportsSend([
      RoleAction.GetRole,
      RoleAction.GetRoles,
      RoleAction.CreateRole,
      RoleAction.UpdateRole,
      RoleAction.DeleteRole
    ]);
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

  async deleteRole(data: DeleteRoleDTO, correlationId?: string): Promise<DidDeleteRoleDTO> {
    return (await this.sendActionViaTransport(RoleAction.DeleteRole, data, correlationId) as DidDeleteRoleDTO);
  }

  private async sendActionViaTransport(action: RoleAction, data: object, correlationId?: string): Promise<object> {
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

export default new RoleService();
