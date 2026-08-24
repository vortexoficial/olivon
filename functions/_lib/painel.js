/* ============================================================
   Peças compartilhadas do painel: sessão, respostas e a chave do KV.
   Arquivo em pasta com underline, então o Pages não publica como rota.
   ============================================================ */

export const CHAVE_CONTEUDO = "conteudo";
const COOKIE = "oliveon_painel";
const DURACAO = 60 * 60 * 12;          // 12 horas de sessão

function bytes(texto) { return new TextEncoder().encode(texto); }

function base64url(buf) {
  let s = "";
  const arr = new Uint8Array(buf);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function assina(texto, segredo) {
  const chave = await crypto.subtle.importKey("raw", bytes(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", chave, bytes(texto)));
}

/* O crachá é só "vence em tal hora" + assinatura. Sem a senha do painel
   ninguém consegue forjar, e trocar a senha derruba as sessões abertas. */
export async function criaCracha(senha) {
  const vence = String(Math.floor(Date.now() / 1000) + DURACAO);
  return vence + "." + (await assina(vence, senha));
}

export async function crachaVale(valor, senha) {
  if (!valor || valor.indexOf(".") < 0) return false;
  const [vence, marca] = valor.split(".");
  if (!/^\d+$/.test(vence) || Number(vence) < Math.floor(Date.now() / 1000)) return false;
  const esperado = await assina(vence, senha);
  // comparação de tempo constante, para não vazar a assinatura por medida de tempo
  if (marca.length !== esperado.length) return false;
  let dif = 0;
  for (let i = 0; i < marca.length; i++) dif |= marca.charCodeAt(i) ^ esperado.charCodeAt(i);
  return dif === 0;
}

export function leCookie(request, nome) {
  const bruto = request.headers.get("cookie") || "";
  const parte = bruto.split(";").map(s => s.trim()).find(s => s.startsWith(nome + "="));
  return parte ? decodeURIComponent(parte.slice(nome.length + 1)) : "";
}

export function cookieSessao(valor, apaga) {
  return COOKIE + "=" + encodeURIComponent(valor) +
    "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + (apaga ? 0 : DURACAO);
}

export const NOME_COOKIE = COOKIE;

export function json(dados, status) {
  return new Response(JSON.stringify(dados), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

/* Toda rota do painel passa por aqui antes de fazer qualquer coisa */
export async function exigeSessao({ request, env }) {
  if (!env.PAINEL_SENHA) return json({ ok: false, erro: "configuracao" }, 500);
  const vale = await crachaVale(leCookie(request, COOKIE), env.PAINEL_SENHA);
  if (!vale) return json({ ok: false, erro: "sessao" }, 401);
  return null;
}

export async function leConteudo(env) {
  const bruto = await env.CMS.get(CHAVE_CONTEUDO);
  if (!bruto) return { portfolio: [], clientes: [] };
  try {
    const c = JSON.parse(bruto);
    return { portfolio: c.portfolio || [], clientes: c.clientes || [], atualizado: c.atualizado };
  } catch (e) {
    return { portfolio: [], clientes: [] };
  }
}
