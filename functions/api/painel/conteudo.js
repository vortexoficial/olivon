/* Lista do painel: lê e grava o portfólio e os clientes no KV.
   Os arquivos em si moram no R2; aqui ficam só os caminhos e os textos. */

import { CHAVE_CONTEUDO, exigeSessao, leConteudo, json } from "../../_lib/painel.js";

const LIMITE_ITENS = 60;

function texto(v, max) {
  return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max || 300);
}

/* Só entra o que o painel realmente usa: qualquer campo a mais é descartado */
function limpaPortfolio(lista) {
  return (Array.isArray(lista) ? lista : []).slice(0, LIMITE_ITENS).map(function (i) {
    return {
      id: texto(i.id, 40),
      tipo: texto(i.tipo, 20) || "sites",
      titulo: texto(i.titulo, 120),
      descricao: texto(i.descricao, 300),
      entregas: (Array.isArray(i.entregas) ? i.entregas : []).slice(0, 4).map(e => texto(e, 40)).filter(Boolean),
      video: texto(i.video, 200),
      poster: texto(i.poster, 200)
    };
  }).filter(i => i.titulo);
}

function limpaClientes(lista) {
  return (Array.isArray(lista) ? lista : []).slice(0, LIMITE_ITENS).map(function (i) {
    return { id: texto(i.id, 40), nome: texto(i.nome, 60), logo: texto(i.logo, 200) };
  }).filter(i => i.nome);
}

export async function onRequestGet(ctx) {
  const barrado = await exigeSessao(ctx);
  if (barrado) return barrado;
  return json({ ok: true, conteudo: await leConteudo(ctx.env) });
}

export async function onRequestPut(ctx) {
  const barrado = await exigeSessao(ctx);
  if (barrado) return barrado;

  let corpo;
  try { corpo = await ctx.request.json(); }
  catch (e) { return json({ ok: false, erro: "formato" }, 400); }

  const conteudo = {
    portfolio: limpaPortfolio(corpo.portfolio),
    clientes: limpaClientes(corpo.clientes),
    atualizado: new Date().toISOString()
  };
  await ctx.env.CMS.put(CHAVE_CONTEUDO, JSON.stringify(conteudo));
  return json({ ok: true, conteudo: conteudo });
}
