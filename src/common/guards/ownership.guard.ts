import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuizOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { userId?: number; role?: UserRole } | undefined;
    if (!user?.userId || !user.role) throw new ForbiddenException('No user');
    if (user.role === UserRole.admin) return true;

    const quizId = Number(req.params?.id ?? req.params?.quizId);
    if (!quizId || Number.isNaN(quizId)) throw new ForbiddenException('No quizId');

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { createdByUserId: true },
    });
    if (!quiz) throw new ForbiddenException('Quiz not found');
    if (quiz.createdByUserId !== user.userId) throw new ForbiddenException('Not owner');
    return true;
  }
}

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { userId?: number; role?: UserRole } | undefined;
    if (!user?.userId || !user.role) throw new ForbiddenException('No user');
    if (user.role === UserRole.admin) return true;
    const id = Number(req.params?.id);
    if (!id || Number.isNaN(id)) throw new ForbiddenException('No id');
    if (id !== user.userId) throw new ForbiddenException('Forbidden');
    return true;
  }
}

