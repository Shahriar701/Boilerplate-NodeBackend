import { IUser } from './DbInterfaces';

export interface IAuthLoginDTO {
  email: string;
  password: string;
}

export interface IAuthRegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface IAuthResponse {
  token: string;
  user: Omit<IUser, 'password'>;
}

export interface IAuthService {
  login(data: IAuthLoginDTO): Promise<IAuthResponse>;
  register(data: IAuthRegisterDTO): Promise<IAuthResponse>;
} 