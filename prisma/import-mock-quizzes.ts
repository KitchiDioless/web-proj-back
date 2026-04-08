import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type MockQuiz = {
  title: string;
  description: string;
  gameTitle: string;
  coverImage?: string | null;
  questions: Array<{
    text: string;
    options: string[];
    correctAnswer: number;
    image?: string | null;
  }>;
};

const mockQuizzes: MockQuiz[] = [
  {
    title: 'Квиз по Counter-Strike 2',
    description: 'Ну моковый квиз и моковый квиз',
    gameTitle: 'Counter-Strike 2',
    coverImage:
      'https://s0.rbk.ru/v6_top_pics/media/img/0/66/346959045956660.webp',
    questions: [
      {
        text: 'Сколько раундов нужно выиграть для победы в матче?',
        options: ['13', '16', '15', '12'],
        correctAnswer: 1,
        image: null,
      },
      {
        text: 'Какое оружие самое дорогое в игре?',
        options: ['AK-47', 'AWP', 'M4A4', 'Desert Eagle'],
        correctAnswer: 1,
        image: null,
      },
    ],
  },
  {
    title: 'Квиз по Cyberpunk 2077',
    description: 'Пара глупых вопросов',
    gameTitle: 'Cyberpunk 2077',
    coverImage:
      'https://cdn.kanobu.ru/r/c369697658c1420200a8656749fa105f/1040x-/u.kanobu.ru/editor/images/30/f9ec5e56-7869-44b0-8b09-6a1282359b56.jpg',
    questions: [
      {
        text: 'Как найти игуану после предыстории?',
        options: [
          'В башне Арасаки',
          'У Джеки дома',
          'В лагере кочевников',
          'Хз чет, не знаю',
        ],
        correctAnswer: 0,
        image: null,
      },
      {
        text: 'А кота?',
        options: [
          'Не поверите, в башне Арасаки',
          'На помойке рядом с квартирой Ви',
          'На выходе из Посмертия',
        ],
        correctAnswer: 1,
        image: null,
      },
    ],
  },
];

async function findGameIdByTitle(gameTitle: string) {
  const exact = await prisma.game.findFirst({
    where: { title: gameTitle },
    select: { id: true },
  });
  if (exact) return exact.id;

  const contains = await prisma.game.findFirst({
    where: { title: { contains: gameTitle, mode: 'insensitive' } },
    select: { id: true },
  });
  return contains?.id ?? null;
}

async function main() {
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
    select: { id: true },
  });
  if (!admin) {
    const passwordHash = await bcrypt.hash('password', 10);
    admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { role: 'admin' },
      create: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin',
      },
      select: { id: true },
    });
    console.log('Created fallback admin@example.com for mock quizzes import');
  }

  let imported = 0;
  for (const q of mockQuizzes) {
    const gameId = await findGameIdByTitle(q.gameTitle);
    if (!gameId) {
      console.warn(`Skip quiz "${q.title}" - game "${q.gameTitle}" not found`);
      continue;
    }

    const existing = await prisma.quiz.findFirst({
      where: { title: q.title, gameId },
      select: { id: true },
    });

    if (existing) {
      await prisma.quiz.update({
        where: { id: existing.id },
        data: {
          description: q.description,
          coverImage: q.coverImage ?? null,
          updatedAt: new Date(),
        },
      });
      imported++;
      continue;
    }

    await prisma.quiz.create({
      data: {
        gameId,
        createdByUserId: admin.id,
        title: q.title,
        description: q.description,
        coverImage: q.coverImage ?? null,
        difficulty: 'easy',
        questions: {
          create: q.questions.map((qq, idx) => ({
            order: idx + 1,
            text: qq.text,
            image: qq.image ?? null,
            options: qq.options,
            correctOptionIdx: qq.correctAnswer,
          })),
        },
      },
    });
    imported++;
  }

  console.log(`Imported mock quizzes: ${imported}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

