import { Module } from '@nestjs/common';
import { BffController } from './bff.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { BffService } from './bff.service';
import { GamesModule } from '../games/games.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [QuizzesModule, LeaderboardModule, GamesModule, IntegrationsModule],
  controllers: [BffController],
  providers: [BffService],
})
export class BffModule {}

