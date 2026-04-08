import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthResolver } from './resolvers/auth.resolver';
import { GamesResolver } from './resolvers/games.resolver';
import { QuizzesResolver } from './resolvers/quizzes.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { LeaderboardResolver } from './resolvers/leaderboard.resolver';
import { AuthModule } from '../auth/auth.module';
import { GamesModule } from '../games/games.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { UsersModule } from '../users/users.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GamesModule,
    QuizzesModule,
    LeaderboardModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      playground: false,
      context: ({ req }) => ({ req }),
    }),
  ],
  providers: [
    AuthResolver,
    GamesResolver,
    QuizzesResolver,
    UsersResolver,
    LeaderboardResolver,
  ],
})
export class AppGraphqlModule {}

