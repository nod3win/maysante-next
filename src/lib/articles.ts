import pool from "./db";
import type { RowDataPacket } from "mysql2";

/**
 * Pendant `next build`, les pages blog sont prérendues : si la base n'est
 * pas accessible à ce moment-là (CI, poste local), on prérend une liste
 * vide plutôt que de faire échouer le build — l'ISR (revalidate 60 s)
 * remplira les pages dès que la base répond. Au runtime, l'erreur est
 * propagée normalement (Next conserve alors la version en cache).
 */
async function buildSafe<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("[articles] base inaccessible pendant le build, fallback vide :", err);
      return fallback;
    }
    throw err;
  }
}

export interface PublicArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  published_at: string;
}

export interface PublicArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
}

export async function listPublishedArticles(limit?: number): Promise<PublicArticleSummary[]> {
  return buildSafe([], async () => {
    const sql = `
      SELECT id, title, slug, excerpt, published_at
      FROM articles
      WHERE status = 'published' AND published_at IS NOT NULL
      ORDER BY published_at DESC
      ${limit ? "LIMIT ?" : ""}
    `;
    const params = limit ? [limit] : [];
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as PublicArticleSummary[];
  });
}

export async function getPublishedArticleBySlug(slug: string): Promise<PublicArticle | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, slug, excerpt, body, published_at
     FROM articles
     WHERE slug = ? AND status = 'published' AND published_at IS NOT NULL
     LIMIT 1`,
    [slug]
  );
  return (rows[0] as PublicArticle) ?? null;
}

export async function getPublishedSlugs(): Promise<{ slug: string; published_at: string }[]> {
  return buildSafe([], async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT slug, published_at
       FROM articles
       WHERE status = 'published' AND published_at IS NOT NULL`
    );
    return rows as { slug: string; published_at: string }[];
  });
}
