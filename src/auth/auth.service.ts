import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

function parseDurationToMs(value: string, fallbackMs: number) {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;
  const num = Number(match[1]);
  const unit = match[2];
  const mult =
    unit === 's'
      ? 1000
      : unit === 'm'
        ? 60 * 1000
        : unit === 'h'
          ? 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;
  return num * mult;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async signAccessToken(userId: number, role: UserRole) {
    const ttl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const expiresInSeconds = Math.floor(parseDurationToMs(ttl, 15 * 60 * 1000) / 1000);
    return this.jwt.signAsync(
      { sub: userId, role } as any,
      {
        secret: this.config.get<string>(
          'JWT_ACCESS_SECRET',
          'dev_access_secret_change_me',
        ),
        expiresIn: expiresInSeconds,
      } as any,
    );
  }

  private async createRefreshToken(userId: number) {
    const raw = crypto.randomBytes(48).toString('base64url');
    const ttl = this.config.get<string>('JWT_REFRESH_TTL', '30d');
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(ttl, 30 * 24 * 60 * 60 * 1000),
    );
    const tokenHash = await bcrypt.hash(raw, 10);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    return { raw, expiresAt };
  }

  async register(username: string, email: string, password: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('User already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { username, email, passwordHash, role: 'user' },
      select: { id: true, username: true, email: true, role: true, createdAt: true, avatarUrl: true },
    });
    const accessToken = await this.signAccessToken(user.id, user.role);
    const refresh = await this.createRefreshToken(user.id);
    return { user, accessToken, refreshToken: refresh.raw };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(user.id, user.role);
    const refresh = await this.createRefreshToken(user.id);
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken: refresh.raw,
    };
  }

  async refresh(refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    for (const t of tokens) {
      const ok = await bcrypt.compare(refreshToken, t.tokenHash);
      if (!ok) continue;
      await this.prisma.refreshToken.update({
        where: { id: t.id },
        data: { revokedAt: new Date() },
      });
      const accessToken = await this.signAccessToken(t.userId, t.user.role);
      const refresh = await this.createRefreshToken(t.userId);
      return {
        user: {
          id: t.user.id,
          username: t.user.username,
          email: t.user.email,
          role: t.user.role,
          avatarUrl: t.user.avatarUrl,
          createdAt: t.user.createdAt,
        },
        accessToken,
        refreshToken: refresh.raw,
      };
    }
    throw new UnauthorizedException('Invalid refresh token');
  }
}

