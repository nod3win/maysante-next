import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import { parseFormRequest, notificationEmailHtml } from "@/lib/form-endpoint";

const schema = z.object({
  nom: z.string().trim().min(1).max(100),
  email: z.string().email().max(150),
  telephone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
});

if (!process.env.ADMIN_URL_PREFIX) throw new Error("ADMIN_URL_PREFIX manquant");

export async function POST(req: NextRequest) {
  const { data, error } = await parseFormRequest(req, "contact", schema);
  if (error) return error;

  const { nom, email, telephone, message } = data;
  const tel = telephone || null;

  let id: number;
  try {
    const [result] = await pool.query(
      "INSERT INTO contacts (nom, email, telephone, message) VALUES (?, ?, ?, ?)",
      [nom, email, tel, message]
    );
    id = (result as { insertId: number }).insertId;
  } catch (err) {
    console.error("[contact] DB error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  sendNotification({
    subject: "Nouvelle demande de contact — Maysanté",
    html: notificationEmailHtml({
      heading: "Nouvelle demande de contact",
      adminUrl: `${process.env.ADMIN_URL_PREFIX}/demandes/contact/${id}`,
      tel,
      rows: [
        { label: "Nom", value: nom, strong: true },
        { label: "Email", value: email },
        { label: "Téléphone", value: tel },
        { label: "Message", value: message, multiline: true },
      ],
    }),
  }).catch((err) => console.error("[contact] Email error:", err));

  return NextResponse.json({ ok: true });
}
