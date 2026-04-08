import { PrismaClient, QuizDifficulty, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.admin,
      avatarUrl: null,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'user',
      email: 'user@example.com',
      passwordHash,
      role: UserRole.user,
      avatarUrl: null,
    },
  });

  const games = await Promise.all([
    prisma.game.upsert({
      where: { slug: 'dota-2' },
      update: {},
      create: {
        title: 'Dota 2',
        slug: 'dota-2',
        description: 'MOBA by Valve.',
        coverImageUrl: null,
        releasedAt: new Date('2013-07-09'),
      },
    }),
    prisma.game.upsert({
      where: { slug: 'cs2' },
      update: {},
      create: {
        title: 'Counter-Strike 2',
        slug: 'cs2',
        description: 'Tactical FPS.',
        coverImageUrl: null,
        releasedAt: new Date('2023-09-27'),
      },
    }),
  ]);

  const quiz = await prisma.quiz.upsert({
    where: { id: 1 },
    update: {},
    create: {
      gameId: games[0].id,
      createdByUserId: admin.id,
      title: 'Dota basics',
      description: 'Starter quiz',
      difficulty: QuizDifficulty.easy,
      questions: {
        create: [
          {
            order: 1,
            text: 'How many players per team?',
            options: ['3', '5', '7', '11'],
            correctOptionIdx: 1,
          },
          {
            order: 2,
            text: 'Main map name?',
            options: ['Summoner’s Rift', 'The Arena', 'The Ancient', 'Dust II'],
            correctOptionIdx: 2,
          },
        ],
      },
    },
  });

  await prisma.quizResult.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score: 2,
      correctAnswers: 2,
      totalQuestions: 2,
      timeSeconds: 34,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

