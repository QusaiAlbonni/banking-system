import { JwtGuard } from '@/auth/guard';
import { GetUser } from '@/common/decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FcmService } from '../../app/fcm.service';
import { CreateFcmDto } from './dto/create-fcm.dto';
import { UpdateFcmDto } from './dto/update.dto';

@Controller('fcm/devices')
@UseGuards(ThrottlerGuard, JwtGuard)
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @Post()
  create(@Body() createFcmDto: CreateFcmDto, @GetUser('id') userId: number) {
    return this.fcmService.create(createFcmDto, userId);
  }

  @Patch('/:token')
  update(
    @Body() dto: UpdateFcmDto,
    @GetUser('id') userId: number,
    @Param('token') token: string,
  ) {
    return this.fcmService.update(dto, userId, token);
  }

  @Delete('/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@GetUser('id') userId: number, @Param('token') token: string) {
    return this.fcmService.delete(userId, token);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.fcmService.findAll(userId);
  }
}
