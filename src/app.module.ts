import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { ResultsModule } from './results/results.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AppGraphqlModule } from './graphql/graphql.module';
import { BffModule } from './bff/bff.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GamesModule,
    QuizzesModule,
    ResultsModule,
    LeaderboardModule,
    AppGraphqlModule,
    BffModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
