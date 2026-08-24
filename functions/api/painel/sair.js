/* Saída do painel: apaga o crachá */

import { cookieSessao } from "../../_lib/painel.js";

export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": cookieSessao("", true)
    }
  });
}
