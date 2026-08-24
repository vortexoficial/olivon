/* ============================================================
   Recebe o formulário do site e entrega o lead por e-mail.

   Roda no Cloudflare Pages, no endereço /api/contato. A página envia os
   campos em JSON; aqui eles são conferidos, montados em uma mensagem e
   passados para a Resend, que entrega em contato@oliveonperformance.com.br.

   A chave da Resend vive em RESEND_API_KEY, uma variável secreta do projeto
   no painel do Cloudflare. Ela nunca aparece no código nem na página.
   ============================================================ */

const PARA = "contato@oliveonperformance.com.br";
const DE = "Site Oliveon <formulario@oliveonperformance.com.br>";
const LIMITE = 4000;          // corpo maior que isto é lixo ou ataque
const CAMPO_MAX = 1200;       // nenhum campo do formulário passa disso

/* Rótulo de cada campo no e-mail, na ordem em que aparecem no formulário.
   Só entra na mensagem o campo que veio preenchido. */
const CAMPOS = [
  ["nome", "Nome"],
  ["empresa", "Empresa"],
  ["whatsapp", "WhatsApp"],
  ["email", "E-mail"],
  ["site", "Site ou Instagram"],
  ["investimento", "Investimento atual em marketing"],
  ["frente", "Precisa primeiro de"],
  ["objetivo", "O que busca melhorar"],
  ["frentes", "Frentes marcadas no site"]
];

function limpa(v) {
  return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, CAMPO_MAX);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

function resposta(dados, status) {
  return new Response(JSON.stringify(dados), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) return resposta({ ok: false, erro: "configuracao" }, 500);

  let corpo;
  try {
    const bruto = await request.text();
    if (bruto.length > LIMITE) return resposta({ ok: false, erro: "grande" }, 413);
    corpo = JSON.parse(bruto);
  } catch (e) {
    return resposta({ ok: false, erro: "formato" }, 400);
  }

  // Armadilha para robô: campo escondido na página, que só um robô preenche.
  // Responde ok para o robô não perceber e não ficar tentando de novo.
  if (limpa(corpo.assunto)) return resposta({ ok: true });

  const nome = limpa(corpo.nome);
  const email = limpa(corpo.email);
  const whatsapp = limpa(corpo.whatsapp);
  if (!nome || !email || !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return resposta({ ok: false, erro: "campos" }, 400);
  }

  const linhas = CAMPOS
    .map(function (par) { return [par[1], limpa(corpo[par[0]])]; })
    .filter(function (par) { return par[1]; });

  const ip = request.headers.get("cf-connecting-ip") || "";
  const pais = request.cf && request.cf.country ? request.cf.country : "";

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#0a0b0d;line-height:1.6">' +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a8f98">Site Oliveon</p>' +
    '<h2 style="margin:0 0 18px;font-size:20px">Novo pedido de diagnóstico</h2>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">' +
    linhas.map(function (par) {
      return '<tr><td style="padding:6px 18px 6px 0;color:#5b616b;vertical-align:top;white-space:nowrap">' +
        esc(par[0]) + '</td><td style="padding:6px 0"><b>' + esc(par[1]) + "</b></td></tr>";
    }).join("") +
    "</table>" +
    '<p style="margin:22px 0 0;font-size:12px;color:#8a8f98">Enviado pelo formulário de oliveonperformance.com.br' +
    (ip ? " · IP " + esc(ip) : "") + (pais ? " · " + esc(pais) : "") + "</p></div>";

  const texto = "Novo pedido de diagnóstico, site Oliveon\n\n" +
    linhas.map(function (par) { return par[0] + ": " + par[1]; }).join("\n");

  const envio = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: DE,
      to: [PARA],
      reply_to: [email],                       // responder no e-mail cai direto no lead
      subject: "Diagnóstico: " + nome + (whatsapp ? " · " + whatsapp : ""),
      html: html,
      text: texto
    })
  });

  if (!envio.ok) {
    // o detalhe fica no log do Cloudflare; a página só precisa saber que falhou
    console.log("resend falhou", envio.status, await envio.text());
    return resposta({ ok: false, erro: "envio" }, 502);
  }

  return resposta({ ok: true });
}
