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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt.strategy';

type AuthRequest = Request & { user: JwtPayload };

@Controller('recipes')
export class RecipesController {
  constructor(private readonly svc: RecipesService) {}

  // --------- Private (user) ---------
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: AuthRequest, @Query('q') q?: string) {
    return this.svc.list(req.user.sub, q);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateRecipeDto) {
    return this.svc.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.svc.remove(req.user.sub, id);
  }

  // --------- Public library ---------
  @Get('public')
  listPublic(@Query('q') q?: string) {
    return this.svc.listPublic(q);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.svc.publish(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unpublish')
  unpublish(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.svc.unpublish(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/fork')
  fork(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.svc.fork(req.user.sub, id);
  }
}
