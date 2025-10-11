import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly svc: ShoppingListsService) {}

  @Get(':weekStartISO')
  get(@Param('weekStartISO') week: string) {
    return this.svc.get(week);
  }

  @Post(':weekStartISO/generate')
  generate(@Param('weekStartISO') week: string) {
    return this.svc.generate(week);
  }

  @Patch(':weekStartISO/items/:itemId')
  patch(
    @Param('weekStartISO') week: string,
    @Param('itemId') itemId: string,
    @Body()
    body: {
      checked?: boolean;
      note?: string;
      totalQty?: number;
      index?: number;
    },
  ) {
    return this.svc.patchItem(week, itemId, body);
  }

  @Post(':weekStartISO/clear-checked')
  clear(@Param('weekStartISO') week: string) {
    return this.svc.clearChecked(week);
  }
}
