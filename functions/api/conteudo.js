/* O que o painel publicou, entregue ao site como um pedacinho de JavaScript.

   A página carrega isto logo depois de js/dados.js e antes de js/main.js, então
   o que foi salvo no painel entra por cima do que está escrito no arquivo. Sem
   nada salvo, devolve um script vazio e o site segue com o conteúdo de dados.js.

   Fica um minuto em cache na borda: salvar no painel aparece no site em até
   um minuto, sem precisar publicar nada. */

import { leConteudo } from "../_lib/painel.js";

export async function onRequestGet({ env }) {
  let corpo = "/* nada publicado pelo painel */";
  try {
    const c = await leConteudo(env);
    const novo = {};
    if (c.portfolio && c.portfolio.length) novo.portfolio = c.portfolio;
    if (c.clientes && c.clientes.length) novo.clientes = c.clientes;
    if (Object.keys(novo).length) {
      corpo = "window.OLIVEON = Object.assign(window.OLIVEON || {}, " + JSON.stringify(novo) + ");";
    }
  } catch (e) {
    // qualquer problema aqui não pode derrubar o site: ele segue com dados.js
  }
  return new Response(corpo, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=60"
    }
  });
}
