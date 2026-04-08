import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { VoteDto } from './dto/vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('quizzes')
@Controller('api/quizzes')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get()
  list() {
    return this.quizzes.list();
  }

  @Get('by-game/:gameId')
  byGame(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.quizzes.byGame(gameId);
  }

  @Get('by-rating')
  byRating() {
    return this.quizzes.byRating();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.quizzes.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: any, @Body() dto: CreateQuizDto) {
    return this.quizzes.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzes.updateForActor(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quizzes.deleteForActor(user, id);
  }

  @Post(':quizId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  vote(
    @CurrentUser() user: CurrentUserPayload,
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: VoteDto,
  ) {
    return this.quizzes.voteForActor(user, dto.userId, quizId, dto.vote ?? null);
  }

  @Get(':quizId/vote/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getVote(
    @CurrentUser() user: CurrentUserPayload,
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.quizzes.getUserVoteForActor(user, userId, quizId);
  }
}

