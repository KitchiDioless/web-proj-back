import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { GamesService } from '../../games/games.service';
import { GameType } from '../types/game.type';

@Resolver(() => GameType)
export class GamesResolver {
  constructor(private readonly gamesService: GamesService) {}

  @Query(() => [GameType])
  games() {
    return this.gamesService.list();
  }

  @Query(() => GameType)
  game(@Args('id', { type: () => Int }) id: number) {
    return this.gamesService.getById(id);
  }
}

