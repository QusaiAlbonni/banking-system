import { Role } from './role';

export class BaseUser {
  id: number;
  email: string;
  role: Role;

  get isUser(): boolean {
    return this.role === Role.USER;
  }
  get isAdminUser(): boolean {
    return this.role === Role.ADMIN;
  }
  get isManagerUser(): boolean {
    return this.role === Role.MANAGER;
  }
  get isTellerUser(): boolean {
    return this.role === Role.TELLER;
  }
}
