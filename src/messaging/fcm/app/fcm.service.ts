import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FCMDevice } from '../domain/device';
import { CreateFcmDto } from '../presenters/http/dto/create-fcm.dto';
import { FcmDeviceResponseDto } from '../presenters/http/dto/response.dto';
import { UpdateFcmDto } from '../presenters/http/dto/update.dto';
import { FirebaseService } from './firebase/firebase.service';
import { FcmDeviceRepository } from './ports/fcm-device.repository';

@Injectable()
export class FcmService {
  constructor(
    private readonly firebaseSerivce: FirebaseService,
    private readonly fcmRepository: FcmDeviceRepository,
  ) {}

  async findByToken(token: string) {
    return await this.fcmRepository.findOneByRegistrationId(token);
  }

  async findUserDeviceByToken(userId: number, token: string) {
    return await this.fcmRepository.findOneByRegistrationId(token, userId);
  }

  async findByUserIds(ids: number[]) {
    return await this.fcmRepository.findByUserIds(ids);
  }

  async create(createFcmDto: CreateFcmDto, userId: number) {
    await this.testToken(createFcmDto.registrationId);

    const existingDevice = await this.findByToken(createFcmDto.registrationId);

    if (existingDevice && existingDevice.userId === userId) {
      throw new BadRequestException('Token already exists');
    } else if (existingDevice) {
      return await this.performUpdate(createFcmDto, existingDevice, userId);
    }

    const device = await this.fcmRepository.create({
      ...createFcmDto,
      userId,
    });

    return plainToInstance(FcmDeviceResponseDto, device);
  }

  async update(dto: UpdateFcmDto, userId: number, token: string) {
    const device = await this.findUserDeviceByToken(userId, token);

    if (!device) throw new NotFoundException();

    if (dto.registrationId) {
      await this.testToken(dto.registrationId);
    }

    return await this.performUpdate(dto, device);
  }

  async performUpdate(dto: UpdateFcmDto, device: FCMDevice, userId?: number) {
    if (dto.registrationId) {
      device.registrationId = dto.registrationId;
    }

    if (dto.type) {
      device.type = dto.type;
    }

    if (userId && device.userId !== userId) {
      device.userId = userId;
    }

    return plainToInstance(
      FcmDeviceResponseDto,
      await this.fcmRepository.update(device),
    );
  }

  async delete(userId: number, token: string) {
    const device = await this.findUserDeviceByToken(userId, token);

    if (!device) throw new NotFoundException();

    await this.fcmRepository.remove(device);
  }

  async findAll(userId: number) {
    const devices = await this.findByUserIds([userId]);
    return plainToInstance(FcmDeviceResponseDto, devices);
  }

  async testToken(registrationId: string) {
    try {
      await this.firebaseSerivce.sendTestMessage({
        token: registrationId,
        notification: {
          title: 'Test',
          body: 'Testing token',
        },
      });
    } catch (error) {
      if (
        error.code === 'messaging/invalid-argument' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        throw new BadRequestException('The Fcm token is invalid');
      } else {
        throw error;
      }
    }
  }
}
