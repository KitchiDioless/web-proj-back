import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuizDifficulty, UserRole } from '@prisma/client';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

function asFrontendQuiz(quiz: any, rating: { upvotes: number; downvotes: number }) {
  return {
    id: quiz.id,
    gameId: quiz.gameId,
    title: quiz.title,
    description: quiz.description,
    coverImage: quiz.coverImage,
    createdByUserId: quiz.createdByUserId,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    difficulty: quiz.difficulty,
    upvotes: rating.upvotes,
    downvotes: rating.downvotes,
    questions: (quiz.questions || []).map((q: any) => ({
      id: q.id,
      text: q.text,
      image: q.image,
      options: q.options,
      correctAnswer: q.correctOptionIdx,
      order: q.order,
    })).sort((a: any, b: any) => a.order - b.order),
  };
}

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCanManageQuiz(actor: CurrentUserPayload, quizId: number) {
    if (actor.role === UserRole.admin) return;
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { createdByUserId: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.createdByUserId !== actor.userId) {
      throw new ForbiddenException('Not owner');
    }
  }

  private async getRatingForQuiz(quizId: number) {
    const agg = await this.prisma.quizVote.groupBy({
      by: ['value'],
      where: { quizId },
      _count: { _all: true },
    });
    const upvotes = agg.find((a) => a.value === 1)?._count._all ?? 0;
    const downvotes = agg.find((a) => a.value === -1)?._count._all ?? 0;
    return { upvotes, downvotes };
  }

  async list() {
    const quizzes = await this.prisma.quiz.findMany({
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });
    const withRating = await Promise.all(
      quizzes.map(async (q) => asFrontendQuiz(q, await this.getRatingForQuiz(q.id))),
    );
    return withRating;
  }

  async getById(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return asFrontendQuiz(quiz, await this.getRatingForQuiz(id));
  }

  async byGame(gameId: number) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { gameId },
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(
      quizzes.map(async (q) => asFrontendQuiz(q, await this.getRatingForQuiz(q.id))),
    );
  }

  async byRating() {
    const quizzes = await this.prisma.quiz.findMany({
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const mapped = await Promise.all(
      quizzes.map(async (q) => {
        const r = await this.getRatingForQuiz(q.id);
        return { quiz: asFrontendQuiz(q, r), rating: r.upvotes - r.downvotes };
      }),
    );
    return mapped
      .sort((a, b) => b.rating - a.rating || (b.quiz.createdAt as any) - (a.quiz.createdAt as any))
      .map((x) => x.quiz);
  }

  async create(createdByUserId: number, dto: any) {
    const game = await this.prisma.game.findUnique({ where: { id: dto.gameId }, select: { id: true } });
    if (!game) throw new BadRequestException('Invalid gameId');

    const quiz = await this.prisma.quiz.create({
      data: {
        gameId: dto.gameId,
        createdByUserId,
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage ?? null,
        difficulty: QuizDifficulty.easy,
        questions: {
          create: dto.questions.map((q: any, idx: number) => ({
            order: idx + 1,
            text: q.text,
            image: q.image ?? null,
            options: q.options,
            correctOptionIdx: q.correctAnswer,
          })),
        },
      },
      include: { questions: true },
    });
    return asFrontendQuiz(quiz, { upvotes: 0, downvotes: 0 });
  }

  async update(id: number, dto: { title?: string; description?: string }) {
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
      include: { questions: true },
    });
    return asFrontendQuiz(quiz, await this.getRatingForQuiz(id));
  }

  async updateForActor(
    actor: CurrentUserPayload,
    id: number,
    dto: { title?: string; description?: string },
  ) {
    await this.assertCanManageQuiz(actor, id);
    return this.update(id, dto);
  }

  async deleteForActor(actor: CurrentUserPayload, id: number) {
    await this.assertCanManageQuiz(actor, id);
    await this.prisma.quiz.delete({ where: { id } });
    return { success: true };
  }

  async vote(userId: number, quizId: number, vote: 'up' | 'down' | null | undefined) {
    const value = vote === 'up' ? 1 : vote === 'down' ? -1 : 0;
    if (value === 0) {
      await this.prisma.quizVote.deleteMany({ where: { quizId, userId } });
    } else {
      await this.prisma.quizVote.upsert({
        where: { quizId_userId: { quizId, userId } },
        update: { value },
        create: { quizId, userId, value },
      });
    }
    return this.getById(quizId);
  }

  async getUserVote(userId: number, quizId: number) {
    const v = await this.prisma.quizVote.findUnique({
      where: { quizId_userId: { quizId, userId } },
      select: { value: true },
    });
    if (!v) return null;
    return v.value === 1 ? 'up' : 'down';
  }

  async getUserVoteForActor(
    actor: CurrentUserPayload,
    requestedUserId: number,
    quizId: number,
  ) {
    const effectiveUserId =
      actor.role === UserRole.admin ? requestedUserId : actor.userId;
    return this.getUserVote(effectiveUserId, quizId);
  }

  async voteForActor(
    actor: CurrentUserPayload,
    requestedUserId: number,
    quizId: number,
    vote: 'up' | 'down' | null | undefined,
  ) {
    const effectiveUserId =
      actor.role === UserRole.admin ? requestedUserId : actor.userId;
    return this.vote(effectiveUserId, quizId, vote);
  }
}

