import { Injectable } from '@nestjs/common';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { GamesService } from '../games/games.service';
import { WikiIntegration } from '../integrations/wiki.integration';
import { TtlCache } from '../common/utils/ttl-cache';

@Injectable()
export class BffService {
  private readonly homeCache = new TtlCache<any>(30_000);

  constructor(
    private readonly quizzes: QuizzesService,
    private readonly leaderboard: LeaderboardService,
    private readonly games: GamesService,
    private readonly wiki: WikiIntegration,
  ) {}

  async home() {
    const cached = this.homeCache.get('home');
    if (cached) return cached;

    const [topQuizzes, leaderboard] = await Promise.all([
      this.quizzes.byRating(),
      this.leaderboard.getLeaderboard(),
    ]);
    const payload = { topQuizzes, leaderboard, cachedAt: new Date().toISOString() };
    this.homeCache.set('home', payload);
    return payload;
  }

  async quizDetails(userId: number, quizId: number) {
    const [quiz, userVote] = await Promise.all([
      this.quizzes.getById(quizId),
      this.quizzes.getUserVote(userId, quizId),
    ]);
    return { quiz, userVote };
  }

  async gameDetails(gameId: number) {
    const game = await this.games.getById(gameId);
    const wiki = await this.wiki.getSummary(game.title);
    return { game, wiki };
  }
}

