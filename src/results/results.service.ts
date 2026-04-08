import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertCanSubmitForUser(actor: CurrentUserPayload, userId: number) {
    if (actor.role === UserRole.admin) return;
    if (actor.userId !== userId) {
      throw new ForbiddenException('Cannot submit result for another user');
    }
  }

  async create(dto: {
    userId: number;
    quizId: number;
    score: number;
    totalQuestions: number;
    timeSeconds?: number;
  }) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      select: { id: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (dto.score < 0 || dto.score > dto.totalQuestions) {
      throw new BadRequestException('Invalid score range');
    }

    return this.prisma.quizResult.create({
      data: {
        userId: dto.userId,
        quizId: dto.quizId,
        score: dto.score,
        correctAnswers: dto.score,
        totalQuestions: dto.totalQuestions,
        timeSeconds: dto.timeSeconds ?? null,
      },
    });
  }

  async createForActor(
    actor: CurrentUserPayload,
    dto: {
      userId: number;
      quizId: number;
      score: number;
      totalQuestions: number;
      timeSeconds?: number;
    },
  ) {
    this.assertCanSubmitForUser(actor, dto.userId);
    return this.create(dto);
  }
}

