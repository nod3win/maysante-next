import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { rateLimit, getIp } from "@/lib/ratelimit";
import { escapeHtml } from "@/lib/sanitize";

/**
 * Garde-fous communs aux endpoints de formulaires publics :
 * rate-limit par IP (5 envois / 10 min), parsing JSON, validation zod.
 */
export async function parseFormRequest<S extends z.ZodTypeAny>(
  req: NextRequest,
  key: string,
  schema: S,
): Promise<{ data: z.infer<S>; error: null } | { data: null; error: NextResponse }> {
  if (!rateLimit(`${key}:${getIp(req)}`, 5, 10 * 60 * 1000)) {
    return {
      data: null,
      error: NextResponse.json(
        { error: "Trop de demandes. Réessayez dans 10 minutes." },
        { status: 429 },
      ),
    };
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return {
      data: null,
      error: NextResponse.json({ error: "Corps invalide." }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      data: null,
      error: NextResponse.json({ error: "Données invalides." }, { status: 400 }),
    };
  }

  return { data: parsed.data, error: null };
}

export interface NotificationRow {
  label: string;
  /** Valeur brute — échappée ici. */
  value: string | null;
  strong?: boolean;
  /** Convertit les retours à la ligne en <br/> (après échappement). */
  multiline?: boolean;
}

/**
 * Gabarit commun des emails de notification de demande : en-tête, tableau
 * de champs, bouton "Voir la demande" et actions rapides téléphone/WhatsApp.
 */
export function notificationEmailHtml(opts: {
  heading: string;
  rows: NotificationRow[];
  adminUrl: string;
  tel?: string | null;
}): string {
  const rowsHtml = opts.rows
    .map((row, i) => {
      let value = row.value === null ? "—" : escapeHtml(row.value);
      if (row.multiline) value = value.replace(/\n/g, "<br/>");
      const weight = row.strong ? "font-weight:600;" : "";
      const width = i === 0 ? "width:110px;" : "";
      return `<tr><td style="padding:8px 0;color:#737373;font-size:13px;${width}vertical-align:top">${row.label}</td><td style="padding:8px 0;font-size:13px;${weight}color:#0a0a0a">${value}</td></tr>`;
    })
    .join("\n        ");

  const sTel = opts.tel ? escapeHtml(opts.tel) : null;
  const telDigits = opts.tel ? opts.tel.replace(/\D/g, "") : null;
  const telButtons = sTel
    ? `
        <a href="tel:${encodeURIComponent(sTel)}" style="display:inline-block;padding:10px 20px;background:#f3f3f3;color:#0a0a0a;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">📞 Appeler</a>
        <a href="https://wa.me/${telDigits}" style="display:inline-block;padding:10px 20px;background:#25D366;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">💬 WhatsApp</a>`
    : "";

  return `
      <h2 style="margin:0 0 4px;font-size:18px;color:#0a0a0a">${escapeHtml(opts.heading)}</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#737373">Reçue le ${new Date().toLocaleString("fr-BE")}</p>
      <table style="width:100%;border-collapse:collapse">
        ${rowsHtml}
      </table>
      <div style="margin-top:24px;display:flex;gap:10px;flex-wrap:wrap">
        <a href="${opts.adminUrl}" style="display:inline-block;padding:10px 20px;background:#0a0a0a;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">Voir la demande →</a>${telButtons}
      </div>
    `;
}
