import { i18nErrorMessage } from '@/translations/error-message';
import { UserRepository } from '@/user/application/ports/user.repository';
import { Role } from '@/user/domain/role';
import { User } from '@/user/domain/user';
import { QueryUserDto } from '@/user/presenter/http/dto/query-user.dto';
import {
  BadRequestException,
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { OrmUserMapper } from '../mappers/user.mapper';

@Injectable()
export class OrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
  }

  async create(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    role: Role,
    mustChangePassword?: boolean,
  ) {
    const entity = this.userRepo.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      mustChangePassword: mustChangePassword ?? false,
    });
    const saved = await this.userRepo.save(entity);
    const user = OrmUserMapper.toDomain(saved);
    return user;
  }
  async checkEmailIfExist(email: string) {
    const emailInUse = await this.userRepo.findOneBy({ email });
    if (emailInUse) {
      throw new BadRequestException(i18nErrorMessage('common.EXISTING_USER'));
    }
  }


  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) return null;
    return OrmUserMapper.toDomain(user);
  }
  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) return null;
    return OrmUserMapper.toDomain(user);
  }

  async findOne(
    id: number,
    fetchUserInfo: boolean = false,
  ): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) return null;
    return OrmUserMapper.toDomain(user);
  }

  async findByIds(ids: number[]): Promise<User[]> {
    const userEntities = await this.userRepo.findBy({ id: In(ids) });

    return userEntities.map((u) => OrmUserMapper.toDomain(u));
  }

  async save(user: User) {
    const entity = OrmUserMapper.toPersistence(user);
    const saved = await this.userRepo.save(entity);
    return OrmUserMapper.toDomain(saved);
  }
  async deleteUser(user: User) {
    const entity = OrmUserMapper.toPersistence(user);
    const deleted = await this.userRepo.remove(entity);
    return;
  }
  async findAllWithPagination(query: QueryUserDto, url: string) {
    const qb = await this.buildQb(query);
    const options = await this.createPaginationOptions(query, url);
    const result = await paginate<UserEntity>(qb, options);
    return result;
  }
  private createPaginationOptions(
    query: QueryUserDto,
    url: string,
  ): IPaginationOptions {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      route: url,
    };
  }

  async buildQb(query: QueryUserDto) {
    const { role, isActive, search, orderBy, ordering } = query;

    const qb = this.userRepo
      .createQueryBuilder('user');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }
    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }
    if (search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    qb.orderBy(`user.${orderBy}`, ordering);
    return qb;
  }
}
