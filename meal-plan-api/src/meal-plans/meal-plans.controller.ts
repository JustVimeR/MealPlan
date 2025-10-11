import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { UpsertMealPlanDto } from './dto/upsert-meal-plan.dto';

@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly svc: MealPlansService) {}

  @Get(':weekStartISO')
  get(@Param('weekStartISO') week: string) {
    return this.svc.getForWeek(week);
  }

  @Put(':weekStartISO')
  upsert(@Param('weekStartISO') week: string, @Body() dto: UpsertMealPlanDto) {
    return this.svc.upsertForWeek(week, dto);
  }
}
