import { BaseUser } from './base-user';
import { Role } from './role';

export class User extends BaseUser {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  isActive: boolean;
  mustChangePassword: boolean;
  files: File[];
  role: Role = Role.USER;
  profilePicture?: string | null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  get phoneNumber() {
    return this.phone;
  }

  get isUser(): boolean {
    return this.role === Role.USER;
  }
  get isManagerUser(): boolean {
    return this.role === Role.MANAGER;
  }
  get isTellerUser(): boolean {
    return this.role === Role.TELLER;
  }
  get isAdminUser(): boolean {
    return this.role === Role.ADMIN;
  }
}
