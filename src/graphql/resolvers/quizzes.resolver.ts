import {
  Args,
  Context,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuizzesService } from '../../quizzes/quizzes.service';
import { QuizType } from '../types/quiz.type';
import { CreateQuizInput, UpdateQuizInput, VoteQuizInput } from '../inputs/quiz.input';
import { GqlJwtAuthGuard } from '../gql-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { UserType } from '../types/user.type';
import { GameType } from '../types/game.type';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

function getUserFromCtx(ctx: any): CurrentUserPayload {
  const reqUser = ctx?.req?.user;
  return { userId: reqUser.userId, role: reqUser.role };
}

@Resolver(() => QuizType)
export class QuizzesResolver {
  constructor(
    private readonly quizzes: QuizzesService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [QuizType])
  quizzesList() {
    return this.quizzes.list();
  }

  @Query(() => QuizType)
  quiz(@Args('id', { type: () => Int }) id: number) {
    return this.quizzes.getById(id);
  }

  @Query(() => [QuizType])
  quizzesByGame(@Args('gameId', { type: () => Int }) gameId: number) {
    return this.quizzes.byGame(gameId);
  }

  @Query(() => [QuizType])
  quizzesByRating() {
    return this.quizzes.byRating();
  }

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  createQuiz(
    @Args('input') input: CreateQuizInput,
    @Context() ctx?: any,
  ) {
    const user = getUserFromCtx(ctx);
    return this.quizzes.create(user.userId, input);
  }

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  async updateQuiz(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateQuizInput,
    @Context() ctx?: any,
  ) {
    const user = getUserFromCtx(ctx);
    return this.quizzes.updateForActor(user, id, input);
  }

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  voteQuiz(@Args('input') input: VoteQuizInput, @Context() ctx?: any) {
    const user = getUserFromCtx(ctx);
    const vote =
      input.vote === 'up' || input.vote === 'down' ? (input.vote as any) : null;
    return this.quizzes.vote(user.userId, input.quizId, vote);
  }

  @ResolveField(() => GameType, { nullable: true })
  game(@Parent() quiz: any) {
    return this.prisma.game.findUnique({ where: { id: quiz.gameId } });
  }

  @ResolveField(() => UserType, { nullable: true })
  createdBy(@Parent() quiz: any) {
    return this.prisma.user.findUnique({ where: { id: quiz.createdByUserId } });
  }
}

