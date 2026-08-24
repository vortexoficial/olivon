/* Envio e remoção de arquivo no R2.

   O painel já entrega o arquivo convertido (logo em WebP branco, vídeo em MP4
   720p, pôster em WebP), então aqui é só guardar. O corpo vem cru, e o nome e
   o tipo vêm por cabeçalho, que é mais leve que multipart e não precisa de
   biblioteca nenhuma dos dois lados. */

import { exigeSessao, json } from "../../_lib/painel.js";

const LIMITE = 26 * 1024 * 1024;        // 26 MB: vídeo convertido não passa disso
const TIPOS = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "video/mp4": "mp4",
  "video/webm": "webm"
};

/* Nome seguro: só o que a gente mesmo monta no painel entra */
function chaveValida(k) {
  return /^(portfolio|clientes)\/[a-z0-9-]{1,60}\.(webp|png|jpg|mp4|webm)$/.test(k);
}

export async function onRequestPut(ctx) {
  const barrado = await exigeSessao(ctx);
  if (barrado) return barrado;

  const chave = String(ctx.request.headers.get("x-arquivo") || "");
  const tipo = String(ctx.request.headers.get("content-type") || "").split(";")[0].trim();
  if (!chaveValida(chave)) return json({ ok: false, erro: "nome" }, 400);
  if (!TIPOS[tipo]) return json({ ok: false, erro: "tipo" }, 415);

  const tamanho = Number(ctx.request.headers.get("content-length") || 0);
  if (tamanho > LIMITE) return json({ ok: false, erro: "grande", limite: LIMITE }, 413);

  const dados = await ctx.request.arrayBuffer();
  if (dados.byteLength > LIMITE) return json({ ok: false, erro: "grande", limite: LIMITE }, 413);

  await ctx.env.MEDIA.put(chave, dados, {
    httpMetadata: { contentType: tipo, cacheControl: "public, max-age=31536000, immutable" }
  });

  return json({ ok: true, caminho: "/media/" + chave, bytes: dados.byteLength });
}

export async function onRequestDelete(ctx) {
  const barrado = await exigeSessao(ctx);
  if (barrado) return barrado;
  const chave = String(new URL(ctx.request.url).searchParams.get("arquivo") || "");
  if (!chaveValida(chave)) return json({ ok: false, erro: "nome" }, 400);
  await ctx.env.MEDIA.delete(chave);
  return json({ ok: true });
}
