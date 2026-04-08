import { Injectable } from '@nestjs/common';

type WikiSummary = {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
};

@Injectable()
export class WikiIntegration {
  async getSummary(title: string) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'web-proj-lab/1.0 (NestJS)' },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const data = (await res.json()) as WikiSummary;
      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail?.source ?? null,
        url: data.content_urls?.desktop?.page ?? null,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

