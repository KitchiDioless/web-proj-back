import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller('api/games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Get()
  list() {
    return this.games.list();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.games.getById(id);
  }
}

