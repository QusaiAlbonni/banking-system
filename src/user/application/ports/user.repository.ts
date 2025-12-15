import { Role } from '@/user/domain/role';
import { User } from '@/user/domain/user';
import { QueryUserDto } from '@/user/presenter/http/dto/query-user.dto';

export abstract class UserRepository {
  abstract create(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    role: Role,
    mustChangePassword?: boolean,
  ): Promise<User>;
  abstract checkEmailIfExist(email: string);
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByPhone(phone: string): Promise<User | null>;
  abstract findOne(id: number, fetchUserInfo?: boolean): Promise<User | null>;
  abstract findByIds(ids: number[]): Promise<User[]>;
  abstract save(user: User);
  abstract deleteUser(user: User);
  abstract buildQb(query: QueryUserDto);
  abstract findAllWithPagination(query: QueryUserDto, url: string);
}
