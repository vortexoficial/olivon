/* ============================================================
   PAINEL · OLIVEON PERFORMANCE
   ------------------------------------------------------------
   Duas listas: os layouts do portfólio (com vídeo) e as logos de clientes.

   Tudo que é conversão de arquivo acontece aqui, no navegador, antes de subir:
   a logo vira WebP branca com fundo transparente, recortada; o vídeo vira MP4
   720p sem áudio e o pôster sai do primeiro quadro. O servidor só guarda.
   ============================================================ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var ICON = window.OLIVEON_ICON || function () { return ""; };

  /* ícones que não existem no conjunto do site */
  var EXTRA = {
    "trash": '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    "cima": '<path d="m18 15-6-6-6 6"/>',
    "baixo": '<path d="m6 9 6 6 6-6"/>'
  };
  function ic(nome) {
    if (EXTRA[nome]) return '<svg viewBox="0 0 24 24" aria-hidden="true">' + EXTRA[nome] + "</svg>";
    return ICON(nome);
  }

  var TIPOS = [
    { v: "sites", n: "Sites e landing pages" },
    { v: "ecommerce", n: "E-commerce" },
    { v: "software", n: "Software e painéis" },
    { v: "criativos", n: "Criativos" }
  ];

  var estado = { portfolio: [], clientes: [] };
  var sujo = false;

  /* ---------------- conversa com o servidor ---------------- */

  function api(caminho, opcoes) {
    return fetch(caminho, opcoes).then(function (r) {
      if (r.status === 401) { mostraEntrada("A sessão expirou. Entre de novo."); throw new Error("sessao"); }
      return r.json().catch(function () { return { ok: false, erro: "resposta" }; });
    });
  }

  function envia(chave, blob) {
    return api("/api/painel/arquivo", {
      method: "PUT",
      headers: { "content-type": blob.type, "x-arquivo": chave },
      body: blob
    }).then(function (j) {
      if (!j.ok) throw new Error(j.erro === "grande" ? "arquivo grande demais" : (j.erro || "envio"));
      return j.caminho;
    });
  }

  function apaga(caminho) {
    if (!caminho || caminho.indexOf("/media/") !== 0) return Promise.resolve();
    return api("/api/painel/arquivo?arquivo=" + encodeURIComponent(caminho.slice(7)), { method: "DELETE" })
      .catch(function () {});
  }

  /* ---------------- conversão de imagem ---------------- */

  /* Deixa a logo branca com fundo transparente, seja qual for o PNG que entrar:
     1. se a imagem não tem transparência, o alfa é tirado do contraste com o fundo
     2. recorta a sobra em volta
     3. reduz para caber na caixa da vitrine
     4. pinta tudo de branco puro, mantendo o alfa */
  function logoBranca(arquivo) {
    return createImageBitmap(arquivo).then(function (bm) {
      var c = document.createElement("canvas");
      var larg = bm.width, alt = bm.height;
      var maior = Math.max(larg, alt);
      if (maior > 1400) { larg = Math.round(larg * 1400 / maior); alt = Math.round(alt * 1400 / maior); }
      c.width = larg; c.height = alt;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(bm, 0, 0, larg, alt);
      bm.close && bm.close();

      var img = ctx.getImageData(0, 0, larg, alt);
      var d = img.data;
      var transparentes = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] < 16) transparentes++;

      // sem transparência: o alfa sai do contraste com a cor das quatro pontas
      if (transparentes / (d.length / 4) < 0.02) {
        var pontas = [0, (larg - 1) * 4, (larg * (alt - 1)) * 4, (larg * alt - 1) * 4];
        var luzFundo = 0;
        pontas.forEach(function (p) { luzFundo += (d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114); });
        luzFundo /= pontas.length;
        var claro = luzFundo > 128;
        for (var k = 0; k < d.length; k += 4) {
          var luz = d[k] * 0.299 + d[k + 1] * 0.587 + d[k + 2] * 0.114;
          var a = claro ? 255 - luz : luz;
          d[k + 3] = a < 12 ? 0 : (a > 235 ? 255 : a);
        }
        ctx.putImageData(img, 0, 0);
        img = ctx.getImageData(0, 0, larg, alt);
        d = img.data;
      }

      // recorte: caixa que envolve tudo que não é transparente
      var x1 = larg, y1 = alt, x2 = -1, y2 = -1;
      for (var y = 0; y < alt; y++) {
        for (var x = 0; x < larg; x++) {
          if (d[(y * larg + x) * 4 + 3] > 12) {
            if (x < x1) x1 = x; if (x > x2) x2 = x;
            if (y < y1) y1 = y; if (y > y2) y2 = y;
          }
        }
      }
      if (x2 < 0) { x1 = 0; y1 = 0; x2 = larg - 1; y2 = alt - 1; }
      var cortL = x2 - x1 + 1, cortA = y2 - y1 + 1;

      // cabe em 400 x 160, que é o dobro do espaço que a vitrine usa
      var escala = Math.min(400 / cortL, 160 / cortA, 1);
      var fimL = Math.max(1, Math.round(cortL * escala));
      var fimA = Math.max(1, Math.round(cortA * escala));

      var saida = document.createElement("canvas");
      saida.width = fimL; saida.height = fimA;
      var sc = saida.getContext("2d");
      sc.imageSmoothingQuality = "high";
      sc.drawImage(c, x1, y1, cortL, cortA, 0, 0, fimL, fimA);
      sc.globalCompositeOperation = "source-in";
      sc.fillStyle = "#ffffff";
      sc.fillRect(0, 0, fimL, fimA);

      return new Promise(function (ok, falha) {
        saida.toBlob(function (b) { b ? ok(b) : falha(new Error("conversao")); }, "image/webp", 0.92);
      });
    });
  }

  /* ---------------- conversão de vídeo ---------------- */

  var ffmpeg = null, carregandoFfmpeg = null;

  function carregaScript(src) {
    return new Promise(function (ok, falha) {
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = function () { falha(new Error("script")); };
      document.head.appendChild(s);
    });
  }

  function pegaFfmpeg(aviso) {
    if (ffmpeg) return Promise.resolve(ffmpeg);
    if (carregandoFfmpeg) return carregandoFfmpeg;
    aviso("baixando o conversor (só na primeira vez)");
    var base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    carregandoFfmpeg = carregaScript("https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js")
      .then(function () { return carregaScript("https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js"); })
      .then(function () {
        var f = new window.FFmpegWASM.FFmpeg();
        return Promise.all([
          window.FFmpegUtil.toBlobURL(base + "/ffmpeg-core.js", "text/javascript"),
          window.FFmpegUtil.toBlobURL(base + "/ffmpeg-core.wasm", "application/wasm")
        ]).then(function (u) { return f.load({ coreURL: u[0], wasmURL: u[1] }); })
          .then(function () { ffmpeg = f; return f; });
      });
    return carregandoFfmpeg;
  }

  function converteVideo(arquivo, aviso, progresso) {
    return pegaFfmpeg(aviso).then(function (f) {
      aviso("convertendo, 0%");
      var ouve = function (e) {
        var p = Math.max(0, Math.min(1, e.progress || 0));
        progresso(p); aviso("convertendo, " + Math.round(p * 100) + "%");
      };
      f.on("progress", ouve);
      return window.FFmpegUtil.fetchFile(arquivo)
        .then(function (dados) { return f.writeFile("entrada", dados); })
        .then(function () {
          return f.exec([
            "-i", "entrada",
            "-vf", "scale=w=1280:h=1280:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:v", "libx264", "-crf", "28", "-preset", "veryfast", "-pix_fmt", "yuv420p",
            "-an", "-movflags", "+faststart", "saida.mp4"
          ]);
        })
        .then(function () { return f.readFile("saida.mp4"); })
        .then(function (dados) {
          f.off && f.off("progress", ouve);
          f.deleteFile("entrada").catch(function () {});
          f.deleteFile("saida.mp4").catch(function () {});
          return new Blob([dados.buffer], { type: "video/mp4" });
        });
    });
  }

  /* primeiro quadro do vídeo, para o pôster */
  function posterDoVideo(blob) {
    return new Promise(function (ok, falha) {
      var url = URL.createObjectURL(blob);
      var v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
      var pronto = false;
      v.addEventListener("loadeddata", function () {
        try { v.currentTime = Math.min(0.2, (v.duration || 1) / 10); } catch (e) { desenha(); }
      });
      v.addEventListener("seeked", desenha, { once: true });
      v.addEventListener("error", function () { URL.revokeObjectURL(url); falha(new Error("video")); });
      function desenha() {
        if (pronto) return;
        pronto = true;
        var lv = v.videoWidth || 800, av = v.videoHeight || 1000;
        var escala = Math.min(800 / lv, 800 / av, 1);
        var c = document.createElement("canvas");
        c.width = Math.round(lv * escala); c.height = Math.round(av * escala);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(function (b) {
          URL.revokeObjectURL(url);
          b ? ok(b) : falha(new Error("poster"));
        }, "image/webp", 0.82);
      }
    });
  }

  /* ---------------- desenho das listas ---------------- */

  function idNovo(prefixo) {
    return prefixo + "-" + Math.random().toString(36).slice(2, 8);
  }
  function sufixo() { return Math.random().toString(36).slice(2, 6); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function desenhaPortfolio() {
    var caixa = $("listaPortfolio");
    if (!estado.portfolio.length) {
      caixa.innerHTML = '<div class="vazio">Nenhum layout ainda. Clique em "Adicionar layout".</div>';
      return;
    }
    caixa.innerHTML = estado.portfolio.map(function (it, i) {
      var midia = it.video
        ? '<video src="' + esc(it.video) + '" muted loop playsinline preload="metadata"' +
          (it.poster ? ' poster="' + esc(it.poster) + '"' : "") + "></video>"
        : '<span class="midia-vazia">' + ic("clapperboard") + "</span>";
      return '<article class="item" data-i="' + i + '">' +
        '<div class="midia" data-midia>' + midia +
          '<button class="midia-acao" data-acao="video">' + ic("cloud-upload") +
            (it.video ? "Trocar vídeo" : "Enviar vídeo") + "</button>" +
          '<span class="barra" hidden data-barra><i></i></span>' +
          '<span class="conversao" hidden data-conversao></span>' +
        "</div>" +
        "<div>" +
          '<div class="campo"><label class="rotulo">Título</label>' +
            '<input data-campo="titulo" value="' + esc(it.titulo) + '" placeholder="Ex.: Delivery com painel próprio"></div>' +
          '<div class="linha2">' +
            '<div class="campo"><label class="rotulo">Tipo</label><select data-campo="tipo">' +
              TIPOS.map(function (t) {
                return '<option value="' + t.v + '"' + (it.tipo === t.v ? " selected" : "") + ">" + t.n + "</option>";
              }).join("") + "</select></div>" +
            '<div class="campo"><label class="rotulo">Entregas, separadas por vírgula</label>' +
              '<input data-campo="entregas" value="' + esc((it.entregas || []).join(", ")) + '" placeholder="Site, Painel, API"></div>' +
          "</div>" +
          '<div class="campo" style="margin-bottom:0"><label class="rotulo">Descrição</label>' +
            '<textarea data-campo="descricao" rows="2" placeholder="Uma linha sobre o que foi entregue">' + esc(it.descricao) + "</textarea></div>" +
        "</div>" +
        '<div class="acoes">' +
          '<button class="btn btn-ic" data-acao="cima" title="Subir"' + (i === 0 ? " disabled" : "") + ">" + ic("cima") + "</button>" +
          '<button class="btn btn-ic" data-acao="baixo" title="Descer"' + (i === estado.portfolio.length - 1 ? " disabled" : "") + ">" + ic("baixo") + "</button>" +
          '<button class="btn btn-ic" data-acao="apagar" title="Excluir">' + ic("trash") + "</button>" +
        "</div>" +
      "</article>";
    }).join("");
  }

  function desenhaClientes() {
    var caixa = $("listaClientes");
    if (!estado.clientes.length) {
      caixa.innerHTML = '<div class="vazio" style="grid-column:1/-1">Nenhum cliente ainda. Clique em "Adicionar cliente".</div>';
      return;
    }
    caixa.innerHTML = estado.clientes.map(function (c, i) {
      return '<article class="marca-cartao" data-i="' + i + '">' +
        '<div class="marca-caixa" data-midia>' +
          (c.logo ? '<img src="' + esc(c.logo) + '" alt="">' : '<span class="midia-vazia">' + ic("layout-template") + "</span>") +
          '<button class="midia-acao" data-acao="logo">' + ic("cloud-upload") + (c.logo ? "Trocar" : "Enviar PNG") + "</button>" +
          '<span class="conversao" hidden data-conversao></span>' +
        "</div>" +
        '<div class="campo"><label class="rotulo">Nome</label>' +
          '<input data-campo="nome" value="' + esc(c.nome) + '" placeholder="Nome do cliente"></div>' +
        '<div class="marca-pe">' +
          '<button class="btn btn-ic btn-min" data-acao="cima" title="Antes"' + (i === 0 ? " disabled" : "") + ">" + ic("cima") + "</button>" +
          '<button class="btn btn-ic btn-min" data-acao="baixo" title="Depois"' + (i === estado.clientes.length - 1 ? " disabled" : "") + ">" + ic("baixo") + "</button>" +
          '<button class="btn btn-ic btn-min" data-acao="apagar" title="Excluir" style="margin-left:auto">' + ic("trash") + "</button>" +
        "</div>" +
      "</article>";
    }).join("");
  }

  function desenha() { desenhaPortfolio(); desenhaClientes(); }

  /* ---------------- ações ---------------- */

  function marcaSujo() {
    sujo = true;
    recado("Há mudanças não publicadas.", "");
  }

  function recado(texto, classe) {
    var el = $("recado");
    el.textContent = texto || "";
    el.className = "recado" + (classe ? " " + classe : "");
  }

  /* O campo precisa estar dentro da página: campo solto não abre a janela de
     arquivo em parte dos navegadores. Fica escondido e sai depois da escolha. */
  function pedeArquivo(aceita) {
    return new Promise(function (ok) {
      var inp = document.createElement("input");
      inp.type = "file";
      inp.accept = aceita;
      inp.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;opacity:0";
      document.body.appendChild(inp);
      var fim = function (arquivo) { inp.remove(); ok(arquivo); };
      inp.addEventListener("change", function () { fim(inp.files && inp.files[0]); }, { once: true });
      inp.addEventListener("cancel", function () { fim(null); }, { once: true });
      inp.click();
    });
  }

  function trocaVideo(i, cartao) {
    var conv = cartao.querySelector("[data-conversao]");
    var barra = cartao.querySelector("[data-barra]");
    var aviso = function (t) { conv.hidden = false; conv.textContent = t; };
    var progresso = function (p) { barra.hidden = false; barra.firstChild.style.width = (p * 100) + "%"; };

    pedeArquivo("video/*").then(function (arquivo) {
      if (!arquivo) return;
      if (arquivo.size > 900 * 1024 * 1024) { alert("Esse vídeo é grande demais para converter no navegador."); return; }
      var it = estado.portfolio[i];
      var videoAntigo = it.video, posterAntigo = it.poster;
      var blobVideo;

      return converteVideo(arquivo, aviso, progresso)
        .catch(function (e) {
          // sem conversor: aceita o MP4 original, se couber
          if (arquivo.type === "video/mp4" && arquivo.size <= 26 * 1024 * 1024) {
            aviso("conversor indisponível, enviando o original");
            return arquivo;
          }
          throw e;
        })
        .then(function (blob) {
          blobVideo = blob;
          aviso("gerando o pôster");
          return posterDoVideo(blob).catch(function () { return null; });
        })
        .then(function (poster) {
          aviso("enviando");
          progresso(0);
          var s = sufixo();
          var envios = [envia("portfolio/" + it.id + "-" + s + ".mp4", blobVideo)];
          if (poster) envios.push(envia("portfolio/" + it.id + "-" + s + "-poster.webp", poster));
          return Promise.all(envios);
        })
        .then(function (caminhos) {
          it.video = caminhos[0];
          it.poster = caminhos[1] || "";
          apaga(videoAntigo); apaga(posterAntigo);
          var kb = Math.round(blobVideo.size / 1024);
          desenha();
          marcaSujo();
          recado("Vídeo pronto: " + (kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB") + ". Falta publicar.", "");
        });
    }).catch(function (e) {
      if (e && e.message === "sessao") return;
      conv.hidden = true; barra.hidden = true;
      recado("Não deu para converter esse vídeo: " + (e && e.message ? e.message : "erro"), "erro");
    }).then(function () {
      if (conv) conv.hidden = true;
      if (barra) barra.hidden = true;
    });
  }

  function trocaLogo(i, cartao) {
    var conv = cartao.querySelector("[data-conversao]");
    var aviso = function (t) { conv.hidden = false; conv.textContent = t; };

    pedeArquivo("image/png,image/jpeg,image/webp").then(function (arquivo) {
      if (!arquivo) return;
      var c = estado.clientes[i];
      var antiga = c.logo;
      aviso("deixando branca");
      return logoBranca(arquivo)
        .then(function (blob) {
          aviso("enviando");
          return envia("clientes/" + c.id + "-" + sufixo() + ".webp", blob);
        })
        .then(function (caminho) {
          c.logo = caminho;
          apaga(antiga);
          desenha();
          marcaSujo();
          recado("Logo pronta. Falta publicar.", "");
        });
    }).catch(function (e) {
      if (e && e.message === "sessao") return;
      recado("Não deu para preparar essa logo: " + (e && e.message ? e.message : "erro"), "erro");
    }).then(function () { if (conv) conv.hidden = true; });
  }

  function move(lista, i, passo) {
    var j = i + passo;
    if (j < 0 || j >= lista.length) return;
    var t = lista[i]; lista[i] = lista[j]; lista[j] = t;
    desenha(); marcaSujo();
  }

  /* ---------------- eventos ---------------- */

  document.addEventListener("click", function (e) {
    var botao = e.target.closest("[data-acao]");
    if (!botao) return;
    var cartaoP = botao.closest("#listaPortfolio .item");
    var cartaoC = botao.closest("#listaClientes .marca-cartao");
    var acao = botao.getAttribute("data-acao");

    if (cartaoP) {
      var i = Number(cartaoP.getAttribute("data-i"));
      if (acao === "video") trocaVideo(i, cartaoP);
      if (acao === "cima") move(estado.portfolio, i, -1);
      if (acao === "baixo") move(estado.portfolio, i, 1);
      if (acao === "apagar" && confirm("Excluir este layout do portfólio?")) {
        apaga(estado.portfolio[i].video); apaga(estado.portfolio[i].poster);
        estado.portfolio.splice(i, 1); desenha(); marcaSujo();
      }
      return;
    }
    if (cartaoC) {
      var k = Number(cartaoC.getAttribute("data-i"));
      if (acao === "logo") trocaLogo(k, cartaoC);
      if (acao === "cima") move(estado.clientes, k, -1);
      if (acao === "baixo") move(estado.clientes, k, 1);
      if (acao === "apagar" && confirm("Excluir este cliente?")) {
        apaga(estado.clientes[k].logo);
        estado.clientes.splice(k, 1); desenha(); marcaSujo();
      }
    }
  });

  document.addEventListener("input", function (e) {
    var campo = e.target.closest("[data-campo]");
    if (!campo) return;
    var nome = campo.getAttribute("data-campo");
    var cartaoP = campo.closest("#listaPortfolio .item");
    var cartaoC = campo.closest("#listaClientes .marca-cartao");
    if (cartaoP) {
      var it = estado.portfolio[Number(cartaoP.getAttribute("data-i"))];
      if (nome === "entregas") it.entregas = campo.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 4);
      else it[nome] = campo.value;
    } else if (cartaoC) {
      estado.clientes[Number(cartaoC.getAttribute("data-i"))][nome] = campo.value;
    } else return;
    marcaSujo();
  });

  document.addEventListener("change", function (e) {
    if (e.target.matches('select[data-campo="tipo"]')) {
      var cartao = e.target.closest(".item");
      estado.portfolio[Number(cartao.getAttribute("data-i"))].tipo = e.target.value;
      marcaSujo();
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll(".aba"), function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".aba"), function (o) { o.classList.toggle("on", o === b); });
      var qual = b.getAttribute("data-aba");
      $("secPortfolio").hidden = qual !== "portfolio";
      $("secClientes").hidden = qual !== "clientes";
    });
  });

  $("btnNovoItem").addEventListener("click", function () {
    estado.portfolio.unshift({ id: idNovo("p"), tipo: "sites", titulo: "", descricao: "", entregas: [], video: "", poster: "" });
    desenha(); marcaSujo();
    var campo = document.querySelector('#listaPortfolio [data-campo="titulo"]');
    if (campo) campo.focus();
  });

  $("btnNovoCliente").addEventListener("click", function () {
    estado.clientes.push({ id: idNovo("c"), nome: "", logo: "" });
    desenha(); marcaSujo();
    var campos = document.querySelectorAll('#listaClientes [data-campo="nome"]');
    if (campos.length) campos[campos.length - 1].focus();
  });

  $("btnSalvar").addEventListener("click", function () {
    var btn = $("btnSalvar");
    btn.disabled = true;
    recado("Publicando...", "");
    api("/api/painel/conteudo", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ portfolio: estado.portfolio, clientes: estado.clientes })
    }).then(function (j) {
      if (!j.ok) throw new Error(j.erro || "erro");
      estado.portfolio = j.conteudo.portfolio;
      estado.clientes = j.conteudo.clientes;
      sujo = false;
      desenha();
      recado("Publicado. O site mostra em até um minuto.", "ok");
    }).catch(function (e) {
      if (e && e.message === "sessao") return;
      recado("Não deu para publicar: " + (e && e.message ? e.message : "erro"), "erro");
    }).then(function () { btn.disabled = false; });
  });

  $("btnSair").addEventListener("click", function () {
    if (sujo && !confirm("Há mudanças não publicadas. Sair mesmo assim?")) return;
    api("/api/painel/sair", { method: "POST" }).then(function () { location.reload(); });
  });

  window.addEventListener("beforeunload", function (e) {
    if (!sujo) return;
    e.preventDefault();
    e.returnValue = "";
  });

  /* ---------------- entrada e carga ---------------- */

  function mostraEntrada(msg) {
    $("telaPainel").hidden = true;
    $("telaEntrada").hidden = false;
    if (msg) {
      var r = $("recadoEntrada");
      r.textContent = msg;
      r.className = "recado erro";
    }
  }

  /* Painel vazio na primeira vez: começa com o que está escrito em js/dados.js,
     para não obrigar a redigitar os nove layouts e os dez clientes. */
  function semente() {
    var D = window.OLIVEON || {};
    estado.portfolio = (D.portfolio || []).map(function (p) {
      return {
        id: idNovo("p"), tipo: p.tipo || "sites", titulo: p.titulo || "", descricao: p.descricao || "",
        entregas: (p.entregas || []).slice(0, 4), video: p.video || "", poster: p.poster || ""
      };
    });
    estado.clientes = (D.clientes || []).map(function (c) {
      return { id: idNovo("c"), nome: c.nome || "", logo: c.logo || "" };
    });
  }

  function abre(conteudo) {
    estado.portfolio = conteudo.portfolio || [];
    estado.clientes = conteudo.clientes || [];
    if (!estado.portfolio.length && !estado.clientes.length) {
      semente();
      recado("Primeira vez por aqui: a lista veio do arquivo do site. Publique para passar a valer.", "");
    }
    $("telaEntrada").hidden = true;
    $("telaPainel").hidden = false;
    desenha();
  }

  $("formEntrada").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("btnEntrar");
    var r = $("recadoEntrada");
    btn.disabled = true;
    r.textContent = "Conferindo...";
    r.className = "recado";
    fetch("/api/painel/entrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ senha: $("senha").value })
    }).then(function (resp) { return resp.json(); }).then(function (j) {
      if (!j.ok) {
        r.textContent = j.erro === "configuracao" ? "O painel ainda não tem senha definida." : "Senha incorreta.";
        r.className = "recado erro";
        return;
      }
      return api("/api/painel/conteudo").then(function (c) { abre(c.conteudo || {}); });
    }).catch(function () {
      r.textContent = "Não deu para conectar.";
      r.className = "recado erro";
    }).then(function () { btn.disabled = false; });
  });

  // já entrou antes? o crachá vale por 12 horas
  fetch("/api/painel/conteudo").then(function (r) {
    if (r.status !== 200) throw new Error("fora");
    return r.json();
  }).then(function (j) {
    if (j && j.ok) abre(j.conteudo || {});
  }).catch(function () {});

})();
