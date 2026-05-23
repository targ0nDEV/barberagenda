import { NextResponse } from "next/server";

type SendConfirmationEmailPayload = {
  email?: string;
  name?: string;
  confirmationUrl?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as SendConfirmationEmailPayload;
  const email = payload.email?.trim().toLowerCase();
  const name = payload.name?.trim() || "Cliente";
  const confirmationUrl = payload.confirmationUrl?.trim();

  if (!email || !confirmationUrl) {
    return NextResponse.json(
      { ok: false, message: "E-mail e link de confirmacao sao obrigatorios." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Agende sua consulta <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      simulated: true,
      message: "RESEND_API_KEY ausente. Envio simulado em ambiente de desenvolvimento."
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Confirme seu cadastro - Agende sua consulta",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h1>Confirme seu cadastro</h1>
          <p>Ola, ${name}.</p>
          <p>Recebemos seu cadastro no Agende sua consulta. Clique no botao abaixo para confirmar seu e-mail.</p>
          <p>
            <a href="${confirmationUrl}" style="display:inline-block;background:#047857;color:white;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700;">
              Confirmar e-mail
            </a>
          </p>
          <p>Se o botao nao funcionar, copie e cole este link no navegador:</p>
          <p>${confirmationUrl}</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { ok: false, message: "Falha ao enviar e-mail.", error },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
