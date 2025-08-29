export enum AuthAction {
  Authenticate = 'iam.auth.authenticate',
  CreateToken = 'iam.auth.createToken',
  RefreshToken = 'iam.auth.refreshToken',
  RevokeToken = 'iam.auth.revokeToken',
}

export enum UserAction {
  GetUsers = 'iam.user.getUsers',
  GetUser = 'iam.user.getUser',
  CreateUser = 'iam.user.createUser',
  UpdateUser = 'iam.user.updateUser',
  DeleteUser = 'iam.user.deleteUser',
}
