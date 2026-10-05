/* ============================================================
   /instagram/: entrega do material do Instagram, com senha.

   A página e as peças ficam no R2 (binding MEDIA, pasta "instagram/"),
   fora do repositório, que é público. A senha fica no KV do painel
   (binding CMS, chave "instagram:senha"), também fora do código.
   Quem acerta a senha recebe um cookie assinado (12 horas) e passa a ver
   /instagram/ e os arquivos; sem ele, só a tela de senha.
   Para trocar a senha: gravar o novo valor na chave do KV.
   ============================================================ */
import { criaCracha, crachaVale, leCookie } from "../_lib/painel.js";

const COOKIE = "oliveon_instagram";
const TIPOS = {
  html: "text/html; charset=utf-8", jpg: "image/jpeg", png: "image/png", webp: "image/webp",
  zip: "application/zip", txt: "text/plain; charset=utf-8"
};

async function segredo(env) {
  const senha = (await env.CMS.get("instagram:senha")) || "";
  // a assinatura usa a senha do painel (forte) + a senha atual: trocar a senha derruba as sessões
  return { senha, chave: (env.PAINEL_SENHA || "") + "|instagram|" + senha };
}

function cookie(valor, apaga) {
  return COOKIE + "=" + encodeURIComponent(valor) +
    "; Path=/instagram; HttpOnly; Secure; SameSite=Lax; Max-Age=" + (apaga ? 0 : 60 * 60 * 12);
}

function telaSenha(erro) {
  return new Response(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="only light"><title>Instagram · OLIVEON Performance</title>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,600..700&family=Barlow:wght@400;500;600&family=Martian+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;background:#F4F5F7;color:#0B0C0E;font-family:Barlow,system-ui,sans-serif;padding:24px 16px}
form{width:min(400px,100%);background:#fff;border:1px solid #E3E5E9;border-radius:12px;padding:36px 28px;text-align:center}
.marca{width:170px;margin:0 auto 28px}.marca img{width:100%;height:auto;display:block}
.rot{font-family:'Martian Mono',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#6B7079}
h1{font-family:Archivo,sans-serif;font-stretch:118%;font-weight:600;font-size:26px;letter-spacing:-.01em;margin:10px 0 8px}
p{color:#4A4E57;font-size:16px}
label{display:block;text-align:left;font-size:14px;font-weight:500;color:#4A4E57;margin:26px 0 8px}
input{width:100%;height:50px;border:1px solid #D5D8DD;border-radius:6px;padding:0 14px;font:inherit;font-size:17px;color:#0B0C0E;background:#fff}
input:focus{outline:2px solid #0B0C0E;outline-offset:1px}
button{width:100%;height:50px;margin-top:14px;border:0;border-radius:6px;background:#0B0C0E;color:#fff;font:inherit;font-weight:600;font-size:16px;cursor:pointer}
.erro{color:#C9000F;font-size:15px;margin-top:14px}
</style></head><body>
<form method="post" action="/instagram/entrar">
  <div class="marca"><img src="/assets/logo-oliveon-claro.svg" alt="OLIVEON Performance"></div>
  <p class="rot">Material do Instagram</p>
  <h1>Acesso com senha</h1>
  <p>Digite a senha que você recebeu para ver e baixar as peças.</p>
  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" autocomplete="current-password" autocapitalize="none" autofocus required>
  <button type="submit">Entrar</button>
  ${erro ? '<p class="erro" role="alert">Senha incorreta. Confira e tente de novo.</p>' : ""}
</form></body></html>`, {
    status: erro ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" }
  });
}

export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const caminho = (params.caminho || []).join("/");
  if (url.pathname === "/instagram") return Response.redirect(url.origin + "/instagram/", 301);
  if (!env.CMS || !env.MEDIA) return new Response("configuração incompleta", { status: 500 });
  const { senha, chave } = await segredo(env);

  if (caminho === "entrar" && request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const digitada = String((form && form.get("senha")) || "").trim().toLowerCase();
    if (!senha || digitada !== senha.trim().toLowerCase()) return telaSenha(true);
    return new Response(null, { status: 303, headers: { location: "/instagram/", "set-cookie": cookie(await criaCracha(chave)), "cache-control": "no-store" } });
  }
  if (caminho === "sair") {
    return new Response(null, { status: 303, headers: { location: "/instagram/", "set-cookie": cookie("", true), "cache-control": "no-store" } });
  }

  const dentro = senha && (await crachaVale(leCookie(request, COOKIE), chave));
  if (!dentro) {
    if (caminho === "" || caminho === "index.html" || caminho === "entrar") return telaSenha(false);
    return new Response("acesso restrito", { status: 401, headers: { "cache-control": "no-store" } });
  }

  const arquivo = caminho === "" ? "index.html" : caminho;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9/_.-]{0,200}$/.test(arquivo) || arquivo.includes("..")) return new Response("não encontrado", { status: 404 });
  const objeto = await env.MEDIA.get("instagram/" + arquivo);
  if (!objeto) return new Response("não encontrado", { status: 404 });
  const ext = arquivo.split(".").pop().toLowerCase();
  const cab = new Headers();
  cab.set("content-type", TIPOS[ext] || "application/octet-stream");
  cab.set("etag", objeto.httpEtag);
  cab.set("x-robots-tag", "noindex, nofollow");
  // privado: a borda não guarda cópia para quem não entrou; a página sempre confere o que há de novo
  cab.set("cache-control", ext === "html" || ext === "txt" ? "private, no-cache" : "private, max-age=86400");
  if (ext === "zip") cab.set("content-disposition", 'attachment; filename="' + arquivo.split("/").pop() + '"');
  return new Response(objeto.body, { headers: cab });
}
