import { Query, Resolver } from '@nestjs/graphql';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { LeaderboardEntryType } from '../types/leaderboard.type';

@Resolver(() => LeaderboardEntryType)
export class LeaderboardResolver {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Query(() => [LeaderboardEntryType])
  leaderboard() {
    return this.leaderboardService.getLeaderboard();
  }
}

