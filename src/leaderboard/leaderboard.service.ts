import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard() {
    const rows = await this.prisma.quizResult.groupBy({
      by: ['userId'],
      _sum: { score: true },
      _count: { _all: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 100,
    });

    const userIds = rows.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatarUrl: true },
    });
    const usersMap = new Map(users.map((u) => [u.id, u]));

    return rows.map((r, idx) => {
      const u = usersMap.get(r.userId);
      const totalScore = r._sum.score ?? 0;
      const totalQuizzes = r._count._all ?? 0;
      return {
        rank: idx + 1,
        userId: r.userId,
        username: u?.username ?? 'Unknown',
        avatar: u?.avatarUrl ?? null,
        totalScore,
        totalQuizzes,
        averageScore: totalQuizzes > 0 ? Number((totalScore / totalQuizzes).toFixed(2)) : 0,
      };
    });
  }
}

