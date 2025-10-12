import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { JwtPayload } from '../auth/jwt.strategy';

type AuthRequest = Request & { user: JwtPayload };

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get('me')
  me(@Req() req: AuthRequest) {
    return this.svc.getByIdLean(req.user.sub);
  }

  @Patch('me')
  updateMe(
    @Req() req: AuthRequest,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateProfileDto,
  ) {
    return this.svc.updateById(req.user.sub, dto);
  }
}
