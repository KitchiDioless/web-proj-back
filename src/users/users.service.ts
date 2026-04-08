import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async getByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async create(data: { username: string; email: string; password: string; avatarUrl?: string | null }) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('User already exists');
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        avatarUrl: data.avatarUrl ?? null,
        role: 'user',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: number,
    updates: { username?: string; avatarUrl?: string | null; role?: UserRole },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(updates.username ? { username: updates.username } : {}),
        ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
        ...(updates.role ? { role: updates.role } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async updateForActor(
    actor: CurrentUserPayload,
    id: number,
    updates: { username?: string; avatarUrl?: string | null; role?: UserRole },
  ) {
    if (updates.role && actor.role !== UserRole.admin) {
      throw new ForbiddenException('Only admin can change role');
    }
    if (actor.role !== UserRole.admin && actor.userId !== id) {
      throw new ForbiddenException('Forbidden');
    }
    return this.update(id, updates);
  }

  async getResults(userId: number) {
    return this.prisma.quizResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quizId: true,
        userId: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true,
        timeSeconds: true,
        createdAt: true,
      },
    });
  }
}

