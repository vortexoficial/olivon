/* Entrega os arquivos do R2 em /media/...

   Cada arquivo tem nome único (o id do item), então pode ser guardado para
   sempre pelo navegador e pela borda da Cloudflare. Trocar a imagem gera nome
   novo, e por isso não existe cache velho preso na tela de ninguém.

   Atende Range para o vídeo poder ser arrastado sem baixar o arquivo inteiro. */

export async function onRequestGet({ params, env, request }) {
  const chave = (params.chave || []).join("/");
  if (!/^(portfolio|clientes)\/[a-z0-9-]{1,60}\.(webp|png|jpg|mp4|webm)$/.test(chave)) {
    return new Response("não encontrado", { status: 404 });
  }

  const range = request.headers.get("range");
  const objeto = await env.MEDIA.get(chave, range ? { range: request.headers } : undefined);
  if (!objeto) return new Response("não encontrado", { status: 404 });

  const cab = new Headers();
  objeto.writeHttpMetadata(cab);
  cab.set("etag", objeto.httpEtag);
  cab.set("cache-control", "public, max-age=31536000, immutable");
  cab.set("accept-ranges", "bytes");

  if (objeto.range && objeto.size != null) {
    const inicio = objeto.range.offset || 0;
    const fim = inicio + (objeto.range.length || 0) - 1;
    cab.set("content-range", "bytes " + inicio + "-" + fim + "/" + objeto.size);
    return new Response(objeto.body, { status: 206, headers: cab });
  }
  return new Response(objeto.body, { headers: cab });
}
