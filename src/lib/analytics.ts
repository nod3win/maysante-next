import crypto from "crypto";
import pool from "@/lib/db";

/**
 * Analytics maison — sans cookies, conforme RGPD.
 *
 * Un visiteur est identifié par SHA-256(sel quotidien + IP + user-agent).
 * Le sel change chaque jour (dérivé de ANALYTICS_SECRET + date), donc un
 * même visiteur est indistinguable d'un jour à l'autre et aucune IP n'est
 * jamais stockée.
 */

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|scrapy|python-requests|curl|wget/i;

export function isBot(userAgent: string): boolean {
  return userAgent.length === 0 || BOT_RE.test(userAgent);
}

export function visitorHash(ip: string, userAgent: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const dailySalt = crypto
    .createHmac("sha256", process.env.ANALYTICS_SECRET ?? "maysante-analytics")
    .update(day)
    .digest("hex");
  return crypto.createHash("sha256").update(`${dailySalt}|${ip}|${userAgent}`).digest("hex");
}

export type Device = "desktop" | "mobile" | "tablet";

export function parseUserAgent(ua: string): {
  device: Device;
  browser: string | null;
  os: string | null;
} {
  const device: Device = /ipad|tablet/i.test(ua)
    ? "tablet"
    : /mobi|android.+mobile|iphone/i.test(ua)
      ? "mobile"
      : "desktop";

  let browser: string | null = null;
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/chrome\/|crios\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let os: string | null = null;
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

/** Extrait le domaine du référent, en ignorant les navigations internes. */
export function referrerDomain(referrer: string | null, ownHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || host === ownHost.replace(/^www\./, "")) return null;
    return host.slice(0, 255);
  } catch {
    return null;
  }
}

export function countryFromHeaders(headers: Headers): string | null {
  const raw =
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-geo-country");
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export async function recordPageview(event: {
  visitorHash: string;
  path: string;
  referrerDomain: string | null;
  device: Device;
  browser: string | null;
  os: string | null;
  country: string | null;
}): Promise<void> {
  await pool.execute(
    `INSERT INTO analytics_events
       (visitor_hash, path, referrer_domain, device, browser, os, country)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      event.visitorHash,
      event.path,
      event.referrerDomain,
      event.device,
      event.browser,
      event.os,
      event.country,
    ],
  );
}
