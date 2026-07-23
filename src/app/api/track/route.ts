import { NextResponse } from "next/server";
import {
  countryFromHeaders,
  isBot,
  parseUserAgent,
  recordPageview,
  referrerDomain,
  visitorHash,
} from "@/lib/analytics";
import { getIp, rateLimit } from "@/lib/ratelimit";

// Réponse vide systématique : le tracking ne doit jamais faire échouer
// la navigation du visiteur, quoi qu'il arrive côté serveur.
const EMPTY = new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    if (!rateLimit(`track:${ip}`, 60, 60_000)) return EMPTY;

    const ua = req.headers.get("user-agent") ?? "";
    if (isBot(ua)) return EMPTY;

    const body = (await req.json()) as { path?: unknown; referrer?: unknown };
    const path = typeof body.path === "string" ? body.path : "";
    if (!path.startsWith("/") || path.length > 512) return EMPTY;
    const referrer = typeof body.referrer === "string" ? body.referrer : null;

    const ownHost = req.headers.get("host") ?? "maysante.be";
    const { device, browser, os } = parseUserAgent(ua);

    await recordPageview({
      visitorHash: visitorHash(ip, ua),
      path,
      referrerDomain: referrerDomain(referrer, ownHost),
      device,
      browser,
      os,
      country: countryFromHeaders(req.headers),
    });
  } catch {
    // silencieux volontairement
  }
  return EMPTY;
}
