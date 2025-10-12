import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { UpsertMealPlanDto } from './dto/upsert-meal-plan.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt.strategy';

type AuthRequest = Request & { user: JwtPayload };

@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly svc: MealPlansService) {}

  @Get(':weekStartISO')
  get(@Req() req: AuthRequest, @Param('weekStartISO') week: string) {
    return this.svc.getForWeek(week, req.user.sub);
  }

  @Put(':weekStartISO')
  upsert(
    @Req() req: AuthRequest,
    @Param('weekStartISO') week: string,
    @Body() dto: UpsertMealPlanDto,
  ) {
    return this.svc.upsertForWeek(week, req.user.sub, dto);
  }
}
