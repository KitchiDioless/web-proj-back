import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 240);
}

function parseCsvLine(line: string) {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

async function main() {
  const csvPath = path.join(process.cwd(), 'frontend', 'public', 'games.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`games.csv not found at ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]).map((h, idx) => {
    const cleaned = h.trim();
    return idx === 0 ? cleaned.replace(/^\uFEFF/, '') : cleaned;
  });
  const idx = (name: string) => header.indexOf(name);

  const iAppid = idx('appid');
  const iName = idx('name');
  const iDev = idx('developer');
  const iPub = idx('publisher');
  const iTags = idx('tags');
  const iYear = idx('release_year');
  const iMonth = idx('release_month');

  if (iAppid < 0 || iName < 0) {
    throw new Error('CSV header missing required columns appid/name');
  }

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const appid = Number(cols[iAppid] ?? 0);
    const name = (cols[iName] ?? '').trim();
    if (!appid || !name) continue;

    const developer = (cols[iDev] ?? '').trim();
    const publisher = (cols[iPub] ?? '').trim();
    const tagsRaw = cols[iTags] ?? '[]';
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = [];
    }

    const year = Number(cols[iYear] ?? 0) || null;
    const month = Number(cols[iMonth] ?? 0) || null;
    const releasedAt =
      year && month ? new Date(Date.UTC(year, Math.max(1, month) - 1, 1)) : null;

    const slugBase = slugify(name) || `game-${appid}`;
    const slug = `${slugBase}-${appid}`;

    const descriptionParts: string[] = [];
    if (developer) descriptionParts.push(`Developer: ${developer}`);
    if (publisher) descriptionParts.push(`Publisher: ${publisher}`);
    if (tags.length) descriptionParts.push(`Tags: ${tags.slice(0, 6).join(', ')}`);

    await prisma.game.upsert({
      where: { slug },
      update: {
        title: name,
        description: descriptionParts.join(' • ') || null,
        releasedAt,
      },
      create: {
        title: name,
        slug,
        description: descriptionParts.join(' • ') || null,
        coverImageUrl: null,
        releasedAt,
      },
    });
    imported++;
  }

  console.log(`Imported/updated games: ${imported}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

