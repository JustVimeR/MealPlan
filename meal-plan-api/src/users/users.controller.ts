import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt.strategy';
import { UpdateProfileDto } from './dto/update-profile.dto';

type AuthRequest = Request & { user: JwtPayload };

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthRequest) {
    return this.users.getByIdLean(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.users.updateById(req.user.sub, dto);
  }
}
