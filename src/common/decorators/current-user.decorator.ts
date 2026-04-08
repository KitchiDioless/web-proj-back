import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export type CurrentUserPayload = { userId: number; role: UserRole };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload | null => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as any;
    if (!user?.userId) return null;
    return { userId: user.userId, role: user.role };
  },
);

