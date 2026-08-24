/* Entrada do painel: confere a senha e devolve o crachá de sessão.
   A senha vive no segredo PAINEL_SENHA do projeto, nunca no repositório. */

import { criaCracha, cookieSessao, json } from "../../_lib/painel.js";

/* Freio simples contra tentativa em série: uma resposta por vez, com atraso.
   Não é força bruta que preocupa (a senha é longa), é ruído no log. */
const ATRASO = 700;

export async function onRequestPost({ request, env }) {
  if (!env.PAINEL_SENHA) return json({ ok: false, erro: "configuracao" }, 500);

  let senha = "";
  try {
    const corpo = await request.json();
    senha = String(corpo.senha || "");
  } catch (e) {
    return json({ ok: false, erro: "formato" }, 400);
  }

  await new Promise(r => setTimeout(r, ATRASO));

  if (senha !== env.PAINEL_SENHA) return json({ ok: false, erro: "senha" }, 401);

  const cracha = await criaCracha(env.PAINEL_SENHA);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": cookieSessao(cracha)
    }
  });
}
