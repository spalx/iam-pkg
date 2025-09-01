import { v4 as uuidv4 } from 'uuid';
import { CorrelatedResponseDTO, TransportAwareService, transportService } from 'transport-pkg';
import { throwErrorForStatus, GetAllRestQueryParams, GetAllRestPaginatedResponse } from 'rest-pkg';
import { IAppPkg, AppRunPriority } from 'app-life-cycle-pkg';

import {
  GetUserDTO,
  UserEntityDTO,
  CreateUserDTO,
  UpdateUserDTO,
  DeleteUserDTO,
  DidDeleteUserDTO
} from '../types/user.dto';
import { UserAction } from '../common/constants';

class UserService extends TransportAwareService implements IAppPkg {
  async init(): Promise<void> {
    transportService.transportsSend([
      UserAction.GetUser,
      UserAction.GetUsers,
      UserAction.CreateUser,
      UserAction.UpdateUser,
      UserAction.DeleteUser
    ]);
  }

  getPriority(): number {
    return AppRunPriority.Highest;
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

  async deleteUser(data: DeleteUserDTO, correlationId?: string): Promise<DidDeleteUserDTO> {
    return (await this.sendActionViaTransport(UserAction.DeleteUser, data, correlationId) as DidDeleteUserDTO);
  }

  private async sendActionViaTransport(action: UserAction, data: object, correlationId?: string): Promise<object> {
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

export default new UserService();
