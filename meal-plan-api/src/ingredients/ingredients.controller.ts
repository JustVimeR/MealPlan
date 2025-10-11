import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly svc: IngredientsService) {}

  @Post()
  create(@Body() dto: CreateIngredientDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll(@Query('q') q?: string, @Query('category') category?: string) {
    return this.svc.findAll(q, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() patch: Partial<CreateIngredientDto>) {
    return this.svc.update(id, patch);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
