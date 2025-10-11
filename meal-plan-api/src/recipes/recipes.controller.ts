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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly svc: RecipesService) {}

  @Post()
  create(@Body() dto: CreateRecipeDto) {
    return this.svc.create(dto);
  }

  @Get()
  search(@Query('q') q?: string, @Query('tags') tags?: string) {
    const tagArr = tags ? tags.split(',').filter(Boolean) : [];
    return this.svc.search(q, tagArr);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() patch: Partial<CreateRecipeDto>) {
    return this.svc.update(id, patch);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
