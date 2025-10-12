import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt.strategy';

type AuthRequest = Request & { user: JwtPayload };

@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly svc: IngredientsService) {}

  @Get()
  list(@Req() req: AuthRequest, @Query('q') q?: string) {
    return this.svc.list(req.user.sub, q);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateIngredientDto) {
    return this.svc.create(req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.svc.remove(req.user.sub, id);
  }
}
