import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import { parseFormRequest, notificationEmailHtml } from "@/lib/form-endpoint";

const schema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  phone: z.string().trim().min(1).max(30),
  careType: z.enum(["soins-infirmiers", "garde-malade"]),
});

if (!process.env.ADMIN_URL_PREFIX) throw new Error("ADMIN_URL_PREFIX manquant");

export async function POST(req: NextRequest) {
  const { data, error } = await parseFormRequest(req, "appel", schema);
  if (error) return error;

  const { firstName, lastName, phone, careType } = data;

  let id: number;
  try {
    const [result] = await pool.query(
      "INSERT INTO appels (prenom, nom, telephone, type_soin) VALUES (?, ?, ?, ?)",
      [firstName, lastName, phone, careType]
    );
    id = (result as { insertId: number }).insertId;
  } catch (err) {
    console.error("[etre-appele] DB error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  sendNotification({
    subject: "Nouvelle demande de rappel — Maysanté",
    html: notificationEmailHtml({
      heading: "Nouvelle demande de rappel",
      adminUrl: `${process.env.ADMIN_URL_PREFIX}/demandes/appel/${id}`,
      tel: phone,
      rows: [
        { label: "Prénom", value: firstName, strong: true },
        { label: "Nom", value: lastName, strong: true },
        { label: "Téléphone", value: phone },
        {
          label: "Type de soin",
          value: careType === "soins-infirmiers" ? "Soins infirmiers" : "Garde malade",
        },
      ],
    }),
  }).catch((err) => console.error("[etre-appele] Email error:", err));

  return NextResponse.json({ ok: true });
}
