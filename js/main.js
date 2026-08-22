/* ============================================================
   OLIVEON PERFORMANCE · SCRIPTS · v2
   Dados editáveis em js/dados.js · ícones em js/icons.js.
   GSAP (gsap + ScrollTrigger + Flip via CDN) é opcional: se não
   carregar, o site continua inteiro, só perde as entradas animadas.
   ============================================================ */
(function () {
  "use strict";

  var D = window.OLIVEON || {};
  var ICON = window.OLIVEON_ICON || function () { return ""; };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = false;     // vira true quando o GSAP (CDN) termina de carregar, ver o fim do arquivo
  var heroTl = null;       // timeline de entrada do hero
  var motionOff = false;   // pausa manual (botão "Pausar animações"): animações passam a ter duração zero
  var restarts = [];       // loops de canvas/vídeo que devem ser retomados
  var docEl = document.documentElement;

  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function tags(list, cls) {
    return (list || []).map(function (t) { return '<span class="tag' + (cls ? " " + cls : "") + '">' + esc(t) + "</span>"; }).join("");
  }
  function iniciais(nome) {
    return String(nome || "").split(" ").map(function (p) { return p.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }
  function onVisible(el, cb, threshold) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting, e); });
    }, { threshold: threshold || 0.05 });
    obs.observe(el);
    return obs;
  }

  /* ---------- Ícones: <i data-icon="nome"> vira o SVG ---------- */
  document.querySelectorAll("[data-icon]").forEach(function (i) {
    i.innerHTML = ICON(i.getAttribute("data-icon"));
  });

  /* ---------- Header: fundo ao rolar · CTA fixo no mobile ---------- */
  var header = $("header");
  var hero = $("hero");
  var stickyCta = $("stickyCta");
  var contatoVisivel = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    if (stickyCta) stickyCta.classList.toggle("on", y > hero.offsetHeight * 0.8 && !contatoVisivel);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if ($("contato")) onVisible($("contato"), function (vis) { contatoVisivel = vis; onScroll(); }, 0.2);

  /* ---------- Menu mobile ---------- */
  var toggle = $("menuToggle");
  var nav = $("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });
  nav.addEventListener("focusout", function (e) {
    if (nav.classList.contains("open") && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setMenu(false);
  });

  /* ---------- Links de WhatsApp (mensagem contextual em data-whats-msg) ---------- */
  function waLink(msg) {
    return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(msg || D.whatsappMensagem || "");
  }
  document.querySelectorAll("[data-whats]").forEach(function (el) {
    el.href = waLink(el.getAttribute("data-whats-msg"));
    el.target = "_blank";
    el.rel = "noopener";
  });
  ["footerEmail", "footerEmail2", "heroEmail", "contatoEmail"].forEach(function (id) {
    var a = $(id);
    if (a && D.email) a.href = "mailto:" + D.email + "?subject=" + encodeURIComponent("Quero um diagnóstico da minha operação");
  });
  if ($("contatoEmailTexto") && D.email) $("contatoEmailTexto").textContent = D.email;
  ["footerInstagram", "footerInstagram2"].forEach(function (id) { var a = $(id); if (a && D.instagram) a.href = D.instagram; });
  $("ano").textContent = new Date().getFullYear();

  /* ---------- Troca de tema ----------
     O tema já foi aplicado pelo script do <head>, antes da primeira pintura.
     Aqui fica só o botão, a gravação da escolha e o aviso para quem desenha em canvas. */
  var aoTrocarTema = [];
  (function tema() {
    var btn = $("temaToggle");
    function atual() { return docEl.getAttribute("data-tema") === "claro" ? "claro" : "escuro"; }
    function aplica(t) {
      docEl.setAttribute("data-tema", t);
      try { localStorage.setItem("oliveon-tema", t); } catch (e) {}
      aoTrocarTema.forEach(function (f) { f(t); });
    }
    if (btn) btn.addEventListener("click", function () { aplica(atual() === "claro" ? "escuro" : "claro"); });

    // o padrão do site é o tema claro, mesmo em aparelho no modo escuro: quem
    // quiser o escuro troca no botão, e a escolha fica salva neste navegador

    // a barra do navegador no celular acompanha o fundo do tema
    var meta = $("metaTemaCor");
    if (meta) {
      var pintaBarra = function () {
        meta.setAttribute("content", getComputedStyle(docEl).getPropertyValue("--bg").trim() || "#0a0b0d");
      };
      pintaBarra();
      aoTrocarTema.push(pintaBarra);
    }
  })();

  /* ---------- Hero: vídeo ----------
     Quem pediu menos movimento no sistema vê o pôster parado, não o loop. */
  (function heroVideo() {
    var caixa = $("heroMidia");
    if (!caixa) return;

    // um arquivo por tema (o do tema claro precisa ter fundo claro). Sem arquivo
    // nenhum, fica o marcador no lugar, para o espaço não ir vazio ao ar.
    function fonte() {
      var claro = docEl.getAttribute("data-tema") === "claro";
      var arquivo = String((claro ? D.heroVideoClaro : D.heroVideo) || "").trim();
      var poster = String((claro ? D.heroPosterClaro : D.heroPoster) || "").trim();
      if (!arquivo) {   // só um dos temas tem vídeo: o mesmo serve para os dois
        arquivo = String(D.heroVideo || D.heroVideoClaro || "").trim();
        poster = String(D.heroPoster || D.heroPosterClaro || "").trim();
      }
      return { video: arquivo, poster: poster };
    }
    if (!fonte().video) {
      caixa.classList.add("mockup-vazio");
      caixa.removeAttribute("aria-hidden");
      caixa.innerHTML =
        '<span class="ic-wrap" data-icon="play"></span>' +
        "<b>Vídeo do topo</b>" +
        "<small>Coloque o arquivo em <code>assets/</code> e escreva o caminho em " +
        "<code>heroVideo</code> (e <code>heroVideoClaro</code>, para o tema claro), " +
        "no arquivo <code>js/dados.js</code>.</small>";
      caixa.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = ICON(n.getAttribute("data-icon")); });
      return;
    }

    var v = document.createElement("video");
    v.id = "heroVideo";
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("loop", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("preload", "metadata");
    caixa.appendChild(v);
    var tenta = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };

    // a fonte só é definida aqui, então o navegador baixa apenas a do tema em uso
    function fonteDoTema() {
      var f = fonte();
      if (!f.video || v.getAttribute("src") === f.video) return;
      if (f.poster) v.setAttribute("poster", f.poster);
      v.setAttribute("src", f.video);
      v.load();
      if (!reduceMotion) tenta();
    }
    fonteDoTema();
    aoTrocarTema.push(fonteDoTema);

    if (reduceMotion) { v.removeAttribute("autoplay"); v.pause(); return; }
    // navegador que bloqueia o autoplay: tenta de novo no primeiro toque da página
    tenta();
    document.addEventListener("pointerdown", tenta, { once: true, passive: true });
    restarts.push(tenta);
  })();

  /* ---------- Hero: stats de autoridade ---------- */
  (function heroStats() {
    var itens = D.heroStats || [];
    var ul = $("heroStats");           // página completa: os números ficam dentro do hero
    if (ul) {
      if (!itens.length) { ul.remove(); return; }
      ul.innerHTML = itens.map(function (s) {
        return "<li><b>" + s.valor + "</b><small>" + s.label + "</small></li>";
      }).join("");
      return;
    }

    // página curta: viram a barra que rola entre a primeira e a segunda dobra.
    // A lista é repetida até encher a tela e depois duplicada, para o laço não ter emenda.
    var track = $("barraNumeros");
    if (!track) return;
    var barra = track.parentNode;
    if (!itens.length) { barra.remove(); return; }

    function itemHTML(s) {
      return '<span class="barra-num-item"><b>' + s.valor + "</b><small>" + s.label + "</small>" +
        '<i class="barra-num-sep" aria-hidden="true"></i></span>';
    }
    var voltas = Math.max(2, Math.ceil(6 / itens.length));
    var lista = "";
    for (var i = 0; i < voltas; i++) lista += itens.map(itemHTML).join("");
    track.innerHTML = lista + '<span class="barra-num-copia" aria-hidden="true">' + lista + "</span>";
    track.querySelector(".barra-num-copia").style.display = "contents";
    track.style.setProperty("--duration", Math.max(22, itens.length * voltas * 4) + "s");
  })();

  /* ---------- Hero: h1 palavra a palavra (só com GSAP) ---------- */
  function splitWords(h) {
    var nodes = Array.prototype.slice.call(h.childNodes);
    h.innerHTML = "";
    function wrap(texto, cls) {
      var w = document.createElement("span");
      w.className = "w";
      var inner = document.createElement("span");
      inner.textContent = texto;
      if (cls) inner.className = cls;
      w.appendChild(inner);
      return w;
    }
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) h.appendChild(document.createTextNode(" "));
          else h.appendChild(wrap(part));
        });
      } else if (n.nodeType === 1) {
        h.appendChild(wrap(n.textContent, n.className));
      }
    });
  }

  /* ---------- Alguns clientes: grade de segmentos (ou logos) ----------
     Enquanto nenhuma marca está liberada, a grade mostra os segmentos atendidos,
     cada um com ícone e a entrega típica. Quando D.clientes for preenchido, a
     mesma grade passa a exibir as logos, sem mexer no CSS. */
  (function paredeClientes() {
    var caixa = $("parede");
    var grade = $("paredeGrade");
    if (!caixa || !grade) return;
    var clientes = D.clientes || [];
    var cartoes;

    if (clientes.length) {
      caixa.classList.add("com-logo");
      cartoes = clientes.map(function (c, i) {
        var img = '<img src="' + esc(c.logo) + '" alt="' + esc(c.nome) + '" loading="lazy">';
        return '<article class="seg seg-marca" style="--i:' + i + '">' +
          (c.url ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener" aria-label="' + esc(c.nome) + '">' + img + "</a>" : img) +
          "</article>";
      });
    } else {
      var lead = $("clientesLead");
      if (lead) lead.textContent = "Segmentos em que já colocamos sistemas de aquisição em produção. As marcas entram aqui conforme cada cliente libera o uso.";
      cartoes = (D.segmentos || []).map(function (s, i) {
        var seg = typeof s === "string" ? { nome: s } : s;   // aceita a lista antiga, só com nomes
        return '<article class="seg" style="--i:' + i + '">' +
          '<span class="seg-icone" aria-hidden="true">' + ICON(seg.icone || "circle-dot") + "</span>" +
          '<span class="seg-corpo"><b>' + esc(seg.nome) + "</b>" +
          (seg.entrega ? "<small>" + esc(seg.entrega) + "</small>" : "") + "</span>" +
          "</article>";
      });
    }

    if (!cartoes.length) { var sec = caixa.closest("section"); if (sec) sec.remove(); return; }
    grade.innerHTML = cartoes.join("");

    // o traço de cada ícone começa apagado e é desenhado quando a grade entra na tela
    var partes = grade.querySelectorAll(".seg-icone path, .seg-icone circle, .seg-icone rect, .seg-icone line, .seg-icone polyline, .seg-icone polygon");
    Array.prototype.forEach.call(partes, function (el) {
      if (reduceMotion || !el.getTotalLength) return;
      var len = 0;
      try { len = el.getTotalLength(); } catch (e) { return; }
      if (!len) return;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    });
    onVisible(caixa, function (vis) { if (vis) caixa.classList.add("dentro"); }, 0.15);

    // luz que segue o cursor pela grade, só onde existe cursor de verdade
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      caixa.addEventListener("pointermove", function (e) {
        var r = caixa.getBoundingClientRect();
        caixa.style.setProperty("--mx", (e.clientX - r.left) + "px");
        caixa.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    }
  })();

  /* ---------- 01 Dores → resposta ---------- */
  (function dores() {
    var grid = $("doresGrid");
    var lista = D.dores || [];
    if (!grid) return;
    if (!lista.length) { grid.remove(); var l = document.querySelector(".dores-lead"); if (l) l.remove(); return; }
    grid.innerHTML = lista.map(function (d, i) {
      return '<article class="dor reveal' + (i ? " delay-" + Math.min(i, 3) : "") + '"><span class="card-index">' + pad(i + 1) + "</span>" +
        "<h3>" + d.titulo + "</h3><p>" + d.texto + "</p>" +
        '<a class="dor-link" href="' + d.resolveEm + '"><small>Resolve em</small>' + d.rotulo + ICON("arrow-right") + "</a></article>";
    }).join("");
  })();

  /* ---------- Ficha: frentes marcadas com "Preciso disto" (vão na mensagem do WhatsApp) ---------- */
  var ficha = (function () {
    var KEY = "oliveon-ficha";
    var itens = [];
    try { itens = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) { itens = []; }
    if (!Array.isArray(itens)) itens = [];
    function save() { try { sessionStorage.setItem(KEY, JSON.stringify(itens)); } catch (e) { /* sem storage: só memória */ } }
    function render() {
      var box = $("fichaBox"), chips = $("fichaChips");
      if (!box || !chips) return;
      box.hidden = !itens.length;
      chips.innerHTML = itens.map(function (t) {
        return '<span class="tag ficha-chip">' + esc(t) + '<button type="button" data-remove="' + esc(t) + '" aria-label="Remover ' + esc(t) + '">' + ICON("x") + "</button></span>";
      }).join("");
      document.querySelectorAll(".need").forEach(function (b) {
        var on = itens.indexOf(b.getAttribute("data-need")) >= 0;
        b.setAttribute("aria-pressed", String(on));
        b.innerHTML = ICON(on ? "check" : "plus") + (on ? "Marcado" : "Preciso disto");
      });
    }
    function toggle(t) {
      var i = itens.indexOf(t);
      if (i >= 0) itens.splice(i, 1); else itens.push(t);
      save(); render();
    }
    document.addEventListener("click", function (e) {
      var need = e.target.closest(".need");
      if (need) { toggle(need.getAttribute("data-need")); return; }
      var rm = e.target.closest("[data-remove]");
      if (rm) toggle(rm.getAttribute("data-remove"));
    });
    return { render: render, lista: function () { return itens.slice(); } };
  })();

  /* ---------- 02 Serviços ---------- */
  (function servicos() {
    var grid = $("servicosGrid");
    var lista = D.servicos || [];
    if (!grid || !lista.length) return;
    grid.innerHTML = lista.map(function (s, i) {
      return '<article class="card reveal' + (s.destaque ? " destaque" : "") + (i % 3 ? " delay-" + (i % 3) : "") + '">' +
        '<div class="card-top"><span class="card-icon">' + ICON(s.icone) + '</span><span class="card-index">' + pad(i + 1) + (s.destaque ? " · Destaque" : "") + "</span></div>" +
        "<h3>" + s.titulo + "</h3><p>" + s.texto + "</p>" +
        (s.link ? '<a class="card-link" href="' + s.link + '">Ver como construímos' + ICON("arrow-right") + "</a>" : "") +
        '<div class="card-foot"><div class="card-tags">' + tags(s.tags) + "</div>" +
        '<button class="need" type="button" aria-pressed="false" aria-label="Preciso disto: ' + esc(s.titulo) + '" data-need="' + esc(s.titulo) + '">' + ICON("plus") + "Preciso disto</button></div>" +
        "</article>";
    }).join("");
    ficha.render();
  })();

  /* ---------- 01 O que fazemos: mesma lista dos serviços, em faixas roláveis com desfoque ---------- */
  (function oQueFazemos() {
    var lista = $("fazLista");
    var itens = D.servicos || [];
    if (!lista || !itens.length) return;
    lista.innerHTML = itens.map(function (s) {
      return '<div class="banner">' +
        '<span class="banner-icone" aria-hidden="true">' + ICON(s.icone) + "</span>" +
        '<div class="banner-corpo"><h3>' + s.titulo + "</h3><p>" + s.texto + "</p></div>" +
        '<span class="banner-tag">' + esc((s.tags && s.tags[0]) || "Oliveon") + "</span>" +
        "</div>";
    }).join("");

    // Ícone desenhado com traço: cada linha do SVG começa "apagada" e é desenhada
    // quando a faixa entra na tela. É o traço do Lucide, então funciona em qualquer ícone.
    var faixas = Array.prototype.slice.call(lista.querySelectorAll(".banner"));
    faixas.forEach(function (faixa) {
      var partes = faixa.querySelectorAll(".banner-icone path, .banner-icone circle, .banner-icone rect, .banner-icone line, .banner-icone polyline, .banner-icone polygon");
      Array.prototype.forEach.call(partes, function (el) {
        if (reduceMotion || !el.getTotalLength) return;
        var len = 0;
        try { len = el.getTotalLength(); } catch (e) { return; }
        if (!len) return;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
      });
      onVisible(faixa, function (vis) { if (vis) faixa.classList.add("desenhado"); }, 0.35);
    });
  })();

  /* ---------- 03 Software sob medida ---------- */
  (function software() {
    var stack = $("softwareStack");
    var mods = D.modulosSoftware || [];
    if (stack && mods.length) {
      stack.innerHTML = mods.map(function (m, i) {
        return '<div class="mod"><span class="mod-icon">' + ICON(m.icone) + "</span><div><h3>" + m.titulo + "</h3><p>" + m.texto + "</p></div>" +
          '<span class="mod-idx">' + pad(i + 1) + "</span></div>";
      }).join("");
    }
    var lista = $("bancadaLista");
    if (lista) {
      lista.innerHTML = (D.bancada || []).map(function (b) { return "<li>" + ICON("check") + b + "</li>"; }).join("");
      if (!(D.bancada || []).length) lista.closest(".bancada").remove();
    }
  })();

  /* ---------- Esteira da automação: etapas ligadas por feixes ----------
     Cada etapa é uma placa de vidro com o ícone e o nome. Entre uma e outra corre
     uma luz, na ideia do feixe animado do MagicUI: a linha é desenhada medindo os
     próprios nós, então serve tanto na fila de quatro do computador quanto no
     dois por dois do celular, e é refeita quando a tela muda de tamanho. */
  var desenhaFeixes = function () {};
  (function feixes() {
    var caixa = $("fluxo");
    var svg = $("fluxoFeixes");
    if (!caixa || !svg) return;

    desenhaFeixes = function () {
      var nos = Array.prototype.slice.call(caixa.querySelectorAll(".fluxo-no"));
      var base = caixa.getBoundingClientRect();
      if (nos.length < 2 || !base.width) return;
      svg.setAttribute("viewBox", "0 0 " + Math.round(base.width) + " " + Math.round(base.height));
      var partes = "";
      for (var i = 0; i < nos.length - 1; i++) {
        var a = nos[i].getBoundingClientRect();
        var b = nos[i + 1].getBoundingClientRect();
        var ay = a.top + a.height / 2 - base.top;
        var by = b.top + b.height / 2 - base.top;
        var d;
        if (Math.abs(ay - by) < 4) {
          // mesma linha: reta de uma placa até a outra
          d = "M" + (a.right - base.left + 6) + " " + ay + " L" + (b.left - base.left - 6) + " " + by;
        } else if (b.left <= a.left) {
          // quebra de linha para trás (o dois por dois do celular): sem fio, senão
          // ele passaria por cima dos rótulos. Cada linha guarda o próprio feixe.
          continue;
        } else {
          // a etapa caiu para a linha de baixo, mais à direita: a curva desce e volta
          var ax = a.left - base.left + a.width / 2;
          var bx = b.left - base.left + b.width / 2;
          var y1 = a.bottom - base.top + 6;
          var y2 = b.top - base.top - 6;
          d = "M" + ax + " " + y1 + " C" + ax + " " + (y1 + (y2 - y1) * 0.6) + ", " + bx + " " + (y2 - (y2 - y1) * 0.6) + ", " + bx + " " + y2;
        }
        partes += '<path class="feixe-base" d="' + d + '"/>' +
          '<path class="feixe-luz" pathLength="100" d="' + d + '" style="animation-delay:' + (i * 0.6).toFixed(2) + 's"/>';
      }
      svg.innerHTML = partes;
    };

    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(desenhaFeixes, 160);
    }, { passive: true });
  })();

  function montaEtapas(el, itens, feitas) {
    if (!el) return;
    el.innerHTML = (itens || []).map(function (e) {
      var etapa = typeof e === "string" ? { nome: e } : e;      // aceita a lista antiga, só com nomes
      return '<li class="etapa' + (feitas ? " done" : "") + '">' +
        '<span class="fluxo-no"><span class="ic-wrap" data-icon="' + esc(etapa.icone || "circle-dot") + '"></span></span>' +
        '<span class="fluxo-rotulo">' + esc(etapa.nome) + "</span></li>";
    }).join("");
    el.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = ICON(n.getAttribute("data-icon")); });
    desenhaFeixes();
  }

  /* ---------- Automação: mockup em imagem ----------
     A seção mostra a imagem informada em `mockupAutomacao` (js/dados.js).
     Sem imagem, fica um marcador no lugar, para o espaço não ir vazio ao ar. */
  (function mockup() {
    var caixa = $("mockupAutomacao");
    if (!caixa) return;
    var arquivo = String(D.mockupAutomacao || "").trim();
    if (arquivo) {
      var img = document.createElement("img");
      img.src = arquivo;
      img.alt = D.mockupAutomacaoAlt || "";
      img.loading = "lazy";
      img.decoding = "async";
      caixa.appendChild(img);
    } else {
      caixa.classList.add("mockup-vazio");
      caixa.innerHTML =
        '<span class="ic-wrap" data-icon="smartphone"></span>' +
        "<b>Mockup da conversa</b>" +
        "<small>Coloque o PNG em <code>assets/</code> e escreva o caminho em " +
        "<code>mockupAutomacao</code>, no arquivo <code>js/dados.js</code>.</small>";
      caixa.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = ICON(n.getAttribute("data-icon")); });
    }
    // as etapas do fluxo continuam, todas concluídas, já que a imagem é parada
    montaEtapas($("etapasConversa"), D.etapasConversa, true);
  })();

  /* ---------- 04 Automação em ação: conversa simulada ---------- */
  var playChat = function () {};
  (function automacao() {
    var body = $("chatBody");
    var etapasEl = $("etapasConversa");
    var conversa = D.conversa || [];
    var etapas = D.etapasConversa || [];
    if (!body || !conversa.length) return;
    montaEtapas(etapasEl, etapas, false);
    var etapaItens = etapasEl ? Array.prototype.slice.call(etapasEl.children) : [];

    // relógio da simulação: começa 23h00 e anda um minuto a cada troca, para dar a sensação de atendimento imediato
    var minuto = 0;
    function hora() {
      var h = 23 + Math.floor(minuto / 60);
      return pad(h % 24) + ":" + pad(minuto % 60);
    }

    var passos = [];
    body.innerHTML = "";
    // espaçador que cresce enquanto sobra lugar: empurra a conversa para o rodapé do card,
    // então cada mensagem nova nasce embaixo e empurra as anteriores para cima
    var espaco = document.createElement("div");
    espaco.className = "phone-espaco";
    espaco.setAttribute("aria-hidden", "true");
    body.appendChild(espaco);
    // divisor de data: fica visível desde o começo, então o card nunca aparece vazio
    var divisor = document.createElement("div");
    divisor.className = "divisor-data";
    divisor.textContent = "hoje";
    body.appendChild(divisor);
    conversa.forEach(function (m, i) {
      var typing = null;
      if (m.de === "bot") {
        typing = document.createElement("div");
        typing.className = "msg bot typing";
        typing.setAttribute("aria-hidden", "true");
        typing.innerHTML = "<i></i><i></i><i></i>";
        typing.style.display = "none";
        body.appendChild(typing);
      }
      var el = document.createElement("div");
      if (m.de === "sistema") {
        el.className = "chip";
        el.innerHTML = ICON("check") + m.texto;
      } else {
        el.className = "msg " + (m.de === "lead" ? "lead" : "bot");
        var texto = document.createElement("span");
        texto.className = "msg-texto";
        texto.textContent = m.texto;
        var meta = document.createElement("span");
        meta.className = "msg-meta";
        meta.innerHTML = "<span>" + hora() + "</span>" + (m.de === "bot" ? '<span class="ic-wrap" data-icon="check-check"></span>' : "");
        el.appendChild(texto);
        el.appendChild(meta);
        if (i) minuto += 1;
      }
      // fora da conta do layout até a hora de aparecer: assim a rolagem sempre para na última mensagem revelada
      el.classList.add("oculta");
      body.appendChild(el);
      passos.push({ m: m, el: el, typing: typing });
    });
    // os ícones desta seção são criados depois da varredura inicial do arquivo
    body.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = ICON(n.getAttribute("data-icon")); });

    var status = $("chatStatus");
    var statusPadrao = status ? status.textContent : "";
    var progresso = $("chatProgresso");
    function setStatus(txt) { if (status) status.textContent = txt || statusPadrao; }
    function setProgresso(feitos) {
      if (progresso) progresso.style.width = Math.round((feitos / passos.length) * 100) + "%";
    }

    function setEtapa(idx) {
      etapaItens.forEach(function (li, i) {
        li.classList.toggle("done", i < idx);
        li.classList.toggle("on", i === idx);
      });
    }
    function scrollBottom() { body.scrollTop = body.scrollHeight; }

    var tl = null, played = false;
    playChat = function () {
      played = true;
      if (!hasGsap || motionOff) {
        passos.forEach(function (p) {
          p.el.classList.remove("oculta");
          p.el.style.opacity = 1;
          if (p.m.de === "bot") p.el.classList.add("entregue");
        });
        setEtapa(etapas.length);
        setProgresso(passos.length);
        scrollBottom();
        return;
      }
      if (tl) tl.kill();
      passos.forEach(function (p) { p.el.classList.add("oculta"); p.el.classList.remove("entregue", "chegando"); });
      setProgresso(0);
      setStatus();
      body.scrollTop = 0;
      // entram de baixo para cima, como numa conversa de verdade
      gsap.set(passos.map(function (p) { return p.el; }), { opacity: 0, y: 26 });
      passos.forEach(function (p) { if (p.typing) { p.typing.style.display = "none"; gsap.set(p.typing, { opacity: 0 }); } });
      setEtapa(-1);
      tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      passos.forEach(function (p, i) {
        if (p.typing) {
          tl.set(p.typing, { display: "flex" })
            .call(function () { setStatus("digitando…"); })
            .to(p.typing, { opacity: 1, duration: 0.25, onStart: scrollBottom })
            .to({}, { duration: 1.1 })
            .set(p.typing, { display: "none" })
            .call(function () { setStatus(); });
        } else {
          tl.to({}, { duration: p.m.de === "sistema" ? 0.45 : 0.8 });
        }
        tl.to(p.el, {
          opacity: 1, y: 0, duration: 0.5, ease: "power2.out",
          onStart: function () {
            p.el.classList.remove("oculta");
            setEtapa(p.m.etapa);
            setProgresso(i + 1);
            scrollBottom();
            p.el.classList.add("chegando");
          },
          onComplete: function () {
            p.el.classList.remove("chegando");
            if (p.m.de === "bot") p.el.classList.add("entregue");
          }
        });
      });
      tl.call(function () { setEtapa(etapas.length); setProgresso(passos.length); setStatus(); });
    };

    onVisible($("chatMock"), function (vis) { if (vis && !played) playChat(); }, 0.5);
    var replay = $("chatReplay");
    if (replay) replay.addEventListener("click", function () { playChat(); });
  })();

  /* ---------- 05 Processo ---------- */
  (function processo() {
    var ol = $("processoLista");
    var lista = D.processo || [];
    if (!ol || !lista.length) return;
    ol.innerHTML = lista.map(function (p, i) {
      return '<li class="step reveal' + (i ? " delay-" + Math.min(i, 4) : "") + '" style="--i:' + i + '"><span class="step-num">' + (i + 1) + "</span><h3>" + p.titulo + "</h3><p>" + p.texto + "</p></li>";
    }).join("");
    onVisible(ol, function (vis) { if (vis) ol.classList.add("drawn"); }, 0.3);
  })();

  /* ---------- 06 Entregáveis: banners empilhados ---------- */
  (function entregaveis() {
    var lista = $("entregaveisLista");
    var itens = D.entregaveis || [];
    if (!lista || !itens.length) return;
    lista.innerHTML = itens.map(function (it, i) {
      return '<div class="banner">' +
        '<span class="banner-num">' + pad(i + 1) + "</span>" +
        "<div><h3>" + it.titulo + "</h3><p>" + it.descricao + "</p></div>" +
        '<span class="banner-tag">' + it.tag + "</span></div>";
    }).join("");
  })();

  /* ---------- Faixa de foco: uma palavra nítida por vez, as outras desfocadas ----------
     Recriação em JS puro do efeito True Focus (react-bits): a moldura de cantos
     percorre as palavras e o desfoque sai de quem está em foco. */
  (function foco() {
    var caixa = $("focoFrase");
    var secao = $("foco");
    var cfg = D.foco || {};
    var palavras = String(cfg.frase || "").trim().split(/\s+/).filter(Boolean);
    if (!caixa || !palavras.length) { if (secao) secao.remove(); return; }

    if ($("focoApoio")) $("focoApoio").textContent = cfg.apoio || "";
    var cta = $("focoCta");
    if (cta) {
      if (!cfg.cta) cta.remove();
      else {
        cta.textContent = cfg.cta;
        if (cfg.ctaMensagem) cta.href = waLink(cfg.ctaMensagem);
      }
    }

    caixa.innerHTML = palavras.map(function (p) { return '<span class="foco-palavra">' + esc(p) + "</span>"; }).join("");
    var moldura = document.createElement("span");
    moldura.className = "foco-moldura";
    moldura.setAttribute("aria-hidden", "true");
    moldura.innerHTML = "<i></i><i></i><i></i><i></i>";
    caixa.appendChild(moldura);

    var spans = Array.prototype.slice.call(caixa.querySelectorAll(".foco-palavra"));
    var atual = 0;
    var timer = null;
    var preso = null;                       // palavra presa pelo ponteiro

    function posiciona(i) {
      var alvo = spans[i];
      if (!alvo) return;
      var r = alvo.getBoundingClientRect();
      var pai = caixa.getBoundingClientRect();
      moldura.style.transform = "translate(" + (r.left - pai.left) + "px, " + (r.top - pai.top) + "px)";
      moldura.style.width = r.width + "px";
      moldura.style.height = r.height + "px";
      moldura.style.opacity = 1;
      spans.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      atual = i;
    }
    function anda() { posiciona((atual + 1) % spans.length); }
    function liga() {
      if (timer || reduceMotion || motionOff) return;
      timer = setInterval(function () { if (preso === null) anda(); }, 1500);
    }
    function desliga() { if (timer) { clearInterval(timer); timer = null; } }

    spans.forEach(function (s, i) {
      s.addEventListener("mouseenter", function () { preso = i; posiciona(i); });
      s.addEventListener("mouseleave", function () { preso = null; });
    });

    if (reduceMotion) caixa.classList.add("sem-movimento");   // tudo nítido, moldura parada

    posiciona(0);
    onVisible(caixa, function (vis) { if (vis) liga(); else desliga(); }, 0.25);   // só roda na tela
    window.addEventListener("resize", function () { posiciona(preso === null ? atual : preso); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { posiciona(atual); });
  })();

  /* ---------- Portfólio: carrossel 3D com vídeo dos projetos ----------
     O card do meio fica de frente e os vizinhos giram e recuam, com o giro
     aplicado a cada troca. O vídeo do card roda mudo e em loop; ao clicar,
     abre em tela cheia, do início e com som. Sem vídeo, o card mostra a capa
     desenhada em CSS, então a seção funciona antes de os vídeos chegarem. */
  (function portfolio() {
    var track = $("pcarTrack");
    var itens = D.portfolio || [];
    if (!track || !itens.length) { var s = $("portfolio"); if (s) s.remove(); return; }
    var filtros = D.portfolioFiltros || [];
    var rotuloTipo = {};
    filtros.forEach(function (f) { rotuloTipo[f.id] = f.rotulo; });

    function capaHTML(p) {
      if (p.capa) return '<img src="' + esc(p.capa) + '" alt="" loading="lazy">';
      switch (p.tipo) {
        case "ecommerce":
          return '<div class="capa"><div class="capa-frame"><div class="capa-bar"><i></i><i></i><i></i><b></b></div><div class="capa-grid"><span></span><span class="hot"></span><span></span><span></span><span></span><span></span></div></div></div>';
        case "software":
          return '<div class="capa"><div class="capa-frame"><div class="capa-term"><div class="capa-side"><i></i><i class="hot"></i><i></i><i></i><i></i></div><div class="capa-main"><span>lead recebido</span><span>qualificado</span><span>crm atualizado</span><span>comercial avisado</span></div></div></div></div>';
        case "criativos":
          return '<div class="capa-phone"><i></i><b></b></div>';
        default:
          return '<div class="capa"><div class="capa-frame"><div class="capa-bar"><i></i><i></i><i></i><b></b></div><div class="capa-rows"><span style="--w:68%"></span><span style="--w:42%"></span><span class="hot"></span><span style="--w:86%"></span><span style="--w:58%"></span></div></div></div>';
      }
    }

    track.innerHTML = itens.map(function (p, i) {
      var temVideo = !!p.video;
      return '<article class="pslide" data-i="' + i + '" tabindex="0" aria-label="' + esc(p.titulo) + '">' +
        '<div class="pslide-tela">' +
          (temVideo
            ? '<video class="pslide-video" muted loop playsinline preload="none" poster="' + esc(p.poster || "") + '" data-src="' + esc(p.video) + '"></video>'
            : capaHTML(p)) +
          (temVideo ? '<span class="pslide-play" aria-hidden="true"><i data-icon="play"></i></span>' : "") +
        "</div>" +
        '<div class="pslide-info"><span class="pf-tipo">' + esc(rotuloTipo[p.tipo] || p.tipo) + "</span>" +
        "<b>" + p.titulo + "</b><p>" + p.descricao + "</p>" +
        '<ul class="pf-entregas">' + (p.entregas || []).slice(0, 3).map(function (e) { return '<li class="tag">' + esc(e) + "</li>"; }).join("") + "</ul></div>" +
        "</article>";
    }).join("");

    track.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = ICON(n.getAttribute("data-icon")); });

    var slides = Array.prototype.slice.call(track.children);
    var videos = slides.map(function (s) { return s.querySelector(".pslide-video"); });

    // pontos de navegação
    var dots = $("pcarDots");
    if (dots) {
      dots.innerHTML = slides.map(function (_, i) { return '<button class="pcar-dot" type="button" data-i="' + i + '" aria-label="Ir para o projeto ' + (i + 1) + '"></button>'; }).join("");
    }

    // o vídeo só é carregado quando o card está por perto: a página continua leve
    function ligaVideo(i, tocar) {
      var v = videos[i];
      if (!v) return;
      if (!v.getAttribute("src")) v.setAttribute("src", v.getAttribute("data-src"));
      if (tocar && !reduceMotion && !lboxAberto) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    }

    var car = null;
    function aplica3D(idx) {
      slides.forEach(function (s, i) {
        var d = i - idx;
        var ad = Math.abs(d);
        var giro = Math.max(-2, Math.min(2, d)) * -16;
        var recuo = Math.min(ad, 2) * 130;
        var escala = 1 - Math.min(ad, 2) * 0.07;
        var alvo = { rotationY: giro, z: -recuo, scale: escala, opacity: ad > 2 ? 0 : 1 };
        if (hasGsap && !motionOff) gsap.to(s, Object.assign({ duration: 0.65, ease: "power3.out", overwrite: true }, alvo));
        else {
          s.style.transform = "perspective(1400px) rotateY(" + giro + "deg) translateZ(" + -recuo + "px) scale(" + escala + ")";
          s.style.opacity = alvo.opacity;
        }
        // só o card em foco toca; os vizinhos ficam carregados e parados
        if (ad === 0) ligaVideo(i, true);
        else if (ad <= 1) ligaVideo(i, false);
        if (dots && dots.children[i]) dots.children[i].classList.toggle("on", i === idx);
      });
    }

    car = makeCarousel({
      viewport: $("pcarViewport"),
      track: track,
      prev: $("pcarPrev"),
      next: $("pcarNext"),
      onChange: function (idx) { aplica3D(idx); }
    });
    if (!car) return;
    if (dots) dots.addEventListener("click", function (e) {
      var b = e.target.closest(".pcar-dot");
      if (b) car.go(+b.getAttribute("data-i"));
    });

    /* ---------- Tela cheia com som ---------- */
    var lbox = $("lbox");
    var lvideo = $("lboxVideo");
    var lboxAberto = false;
    var focoAnterior = null;

    function abre(i) {
      var p = itens[i];
      if (!lbox || !lvideo || !p || !p.video) return;
      focoAnterior = document.activeElement;
      videos.forEach(function (v) { if (v) v.pause(); });
      lvideo.setAttribute("src", p.video);
      if (p.poster) lvideo.setAttribute("poster", p.poster);
      lvideo.currentTime = 0;
      lvideo.muted = false;
      lvideo.volume = 1;
      if ($("lboxLegenda")) $("lboxLegenda").textContent = p.titulo;
      lbox.hidden = false;
      docEl.classList.add("lbox-on");
      lboxAberto = true;
      var pr = lvideo.play();
      if (pr && pr.catch) pr.catch(function () { lvideo.muted = true; lvideo.play(); });  // navegador que exige silêncio
      var fechar = $("lboxFechar");
      if (fechar) fechar.focus();
    }
    function fecha() {
      if (!lboxAberto) return;
      lvideo.pause();
      lvideo.removeAttribute("src");
      lvideo.load();
      lbox.hidden = true;
      docEl.classList.remove("lbox-on");
      lboxAberto = false;
      if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
      aplica3D(car.index);   // volta a tocar a prévia do card em foco
    }
    if ($("lboxFechar")) $("lboxFechar").addEventListener("click", fecha);
    if (lbox) lbox.addEventListener("click", function (e) { if (e.target === lbox) fecha(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lboxAberto) fecha(); });

    slides.forEach(function (s, i) {
      s.addEventListener("click", function () { if (i === car.index) abre(i); });
      s.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i === car.index) abre(i); else car.go(i); }
      });
    });

    // fora da tela, tudo parado
    onVisible($("pcar"), function (vis) {
      if (vis) aplica3D(car.index);
      else videos.forEach(function (v) { if (v) v.pause(); });
    }, 0.15);

    aplica3D(car.index);
  })();


  /* ---------- Carrossel genérico: card central em foco ---------- */
  function makeCarousel(opts) {
    var viewport = opts.viewport, track = opts.track;
    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return null;
    var index = Math.min(opts.start || 0, slides.length - 1);
    var dragging = false, startX = 0, lastX = 0, startTx = 0, moved = false;
    var CSS_TRANSITION = "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
    // anúncio do item ativo para leitores de tela
    var live = document.createElement("p");
    live.className = "sr-only";
    live.setAttribute("aria-live", "polite");
    viewport.appendChild(live);

    function offsetFor(i) {
      var s = slides[i];
      return viewport.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
    }
    function setX(x, animate) {
      var anima = animate && !motionOff;
      if (hasGsap) {
        track.style.transition = "none"; // a transição CSS brigaria com o tween
        if (anima) gsap.to(track, { x: x, duration: 0.65, ease: "power3.out", overwrite: true });
        else gsap.set(track, { x: x });
      } else {
        track.style.transition = anima ? CSS_TRANSITION : "none";
        track.style.transform = "translateX(" + x + "px)";
      }
    }
    function render(animate) {
      setX(offsetFor(index), animate !== false);
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === index); });
      var rotulo = slides[index].querySelector("b");
      live.textContent = "Item " + (index + 1) + " de " + slides.length + (rotulo ? ": " + rotulo.textContent : "");
      if (opts.onChange) opts.onChange(index, slides);
    }
    function go(i, animate) {
      index = (i + slides.length) % slides.length;
      render(animate);
    }
    if (opts.prev) opts.prev.addEventListener("click", function () { go(index - 1); });
    if (opts.next) opts.next.addEventListener("click", function () { go(index + 1); });
    slides.forEach(function (s, i) {
      s.addEventListener("click", function () { if (!moved && i !== index) go(i); });
    });
    viewport.setAttribute("tabindex", "0");
    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    });
    // arrasto com o ponteiro: a captura só começa depois do limiar, para o clique simples chegar aos slides/botões
    viewport.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true; moved = false; startX = lastX = e.clientX; startTx = offsetFor(index);
      if (hasGsap) gsap.killTweensOf(track);
      track.style.transition = "none";
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      lastX = e.clientX;
      var dx = lastX - startX;
      if (!moved) {
        if (Math.abs(dx) <= 6) return;
        moved = true;
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* sem captura o arrasto segue enquanto o ponteiro estiver sobre o viewport */ }
      }
      var x = startTx + dx;
      if (hasGsap) gsap.set(track, { x: x }); else track.style.transform = "translateX(" + x + "px)";
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      // pointercancel chega com clientX 0 (rolagem vertical no toque): volta ao lugar sem trocar de item
      var dx = e.type === "pointercancel" ? 0 : lastX - startX;
      if (dx < -40) go(index + 1); else if (dx > 40) go(index - 1); else render();
      setTimeout(function () { moved = false; }, 50);
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    var rT;
    window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { render(false); }, 120); });
    render(false);
    return { go: go, get index() { return index; }, slides: slides, render: render };
  }

  /* ---------- 08 Carrossel de vídeos ---------- */
  var videosPause = function () {};
  (function videos() {
    var track = $("videoTrack");
    var lista = D.videos || [];
    var secao = $("videos");
    if (!track || !lista.length) { if (secao) secao.remove(); return; }
    track.innerHTML = lista.map(function (v) {
      return '<figure class="vslide"><div class="vframe">' +
        '<video muted playsinline loop preload="none" poster="' + esc(v.poster) + '"><source src="' + esc(v.src) + '" type="video/mp4"></video>' +
        '<button class="vplay" type="button" aria-label="Reproduzir: ' + esc(v.titulo) + '">' + ICON("play") + "</button></div>" +
        '<figcaption class="vmeta"><b>' + esc(v.titulo) + "</b><span>" + esc(v.tag) + "</span></figcaption></figure>";
    }).join("");
    var dots = $("vcarDots");
    var slides = Array.prototype.slice.call(track.children);
    if (dots) dots.innerHTML = slides.map(function () { return "<i></i>"; }).join("");
    var secaoVisivel = false;

    function setPlaying(slide, on) {
      var video = slide.querySelector("video");
      var btn = slide.querySelector(".vplay");
      var titulo = slide.querySelector(".vmeta b").textContent;
      if (on) {
        slide.classList.add("playing");
        btn.innerHTML = ICON("pause");
        btn.setAttribute("aria-label", "Pausar: " + titulo);
        var p = video.play();
        if (p && p.catch) p.catch(function () { setPlaying(slide, false); });
      } else {
        video.pause();
        slide.classList.remove("playing");
        btn.innerHTML = ICON("play");
        btn.setAttribute("aria-label", "Reproduzir: " + titulo);
      }
    }
    function pauseAll(except) {
      slides.forEach(function (s) { if (s !== except) setPlaying(s, false); });
    }
    videosPause = function () { pauseAll(null); };

    var car = makeCarousel({
      viewport: $("vcarViewport"), track: track, prev: $("vcarPrev"), next: $("vcarNext"), start: 1,
      onChange: function (i) {
        if (dots) Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle("on", j === i); });
        slides.forEach(function (s, j) { s.querySelector(".vplay").tabIndex = j === i ? 0 : -1; }); // só o botão do vídeo ativo entra no Tab
        pauseAll(slides[i]);
        if (secaoVisivel && !reduceMotion && !motionOff) setPlaying(slides[i], true);
      }
    });
    restarts.push(function () { if (secaoVisivel && !reduceMotion) setPlaying(slides[car.index], true); });
    slides.forEach(function (s) {
      s.querySelector(".vplay").addEventListener("click", function (e) {
        e.stopPropagation();
        if (!s.classList.contains("is-active")) { car.go(slides.indexOf(s)); return; }
        setPlaying(s, !s.classList.contains("playing"));
      });
    });
    onVisible($("vcar"), function (vis) {
      secaoVisivel = vis;
      if (vis && !reduceMotion && !motionOff) setPlaying(slides[car.index], true);
      else pauseAll(null);
    }, 0.4);
  })();

  /* ---------- 09 Equipe ---------- */
  (function equipe() {
    var grid = $("equipeGrid");
    var lista = D.equipe || [];
    if (!grid || !lista.length) return;
    grid.innerHTML = lista.map(function (m, i) {
      return '<article class="membro reveal' + (m.destaque ? " destaque" : "") + (i % 3 ? " delay-" + (i % 3) : "") + '">' +
        '<div class="membro-top"><span class="membro-icon">' + ICON(m.icone) + '</span><span class="card-index">' + (m.destaque ? "Sexta cadeira" : pad(i + 1)) + "</span></div>" +
        "<h3>" + m.papel + "</h3><p>" + m.texto + "</p>" +
        '<div class="membro-resp"><small>Responsável por</small><ul>' + (m.responsavel || []).map(function (r) { return '<li class="tag">' + r + "</li>"; }).join("") + "</ul></div>" +
        "</article>";
    }).join("");
    var fecho = $("equipeFecho");
    if (fecho) { if (D.equipeFecho) fecho.textContent = D.equipeFecho; else fecho.remove(); }
    var comp = $("comparativo");
    var c = D.comparativo;
    if (comp) {
      if (!c || !c.linhas || !c.linhas.length) { comp.remove(); return; }
      function celula(v) {
        var sim = /^sim/i.test(v), nao = /^n[ãa]o/i.test(v);
        return "<td><span" + (sim ? ' class="sim"' : nao ? ' class="nao"' : "") + ">" + (sim ? ICON("check") : nao ? ICON("x") : ICON("minus")) + v + "</span></td>";
      }
      comp.innerHTML = '<table class="comp"><thead><tr><th scope="col">Na prática</th>' + (c.colunas || []).map(function (h) { return '<th scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        c.linhas.map(function (l) { return '<tr><th scope="row">' + esc(l.pergunta) + "</th>" + (l.valores || []).map(celula).join("") + "</tr>"; }).join("") + "</tbody></table>";
    }
  })();

  /* ---------- 10 Números ---------- */
  (function numeros() {
    var grid = $("numerosGrid");
    if (!grid) return;
    (D.numeros || []).forEach(function (n, i) {
      var div = document.createElement("div");
      div.className = "numero reveal" + (i % 5 ? " delay-" + (i % 5) : "");
      div.innerHTML =
        '<div class="numero-valor">' +
        (n.prefixo ? '<span class="nv-aff">' + n.prefixo.trim() + "</span>" : "") +
        '<span data-count="' + n.valor + '">0</span>' +
        (n.sufixo ? '<span class="nv-aff">' + n.sufixo.trim() + "</span>" : "") + "</div>" +
        '<p class="numero-legenda">' + n.legenda + "</p>";
      grid.appendChild(div);
    });
  })();

  /* ---------- 11 Cases ---------- */
  (function cases() {
    var grid = $("casesGrid");
    if (!grid) return;
    (D.cases || []).forEach(function (c, i) {
      var det = document.createElement("details");
      det.className = "case reveal" + (i % 3 ? " delay-" + (i % 3) : "");
      var kpis = (c.resultados || []).map(function (r) {
        return '<span class="case-kpi"><b>' + r.destaque + "</b><small>" + r.texto + "</small></span>";
      }).join("");
      det.innerHTML =
        '<summary class="case-row">' +
          '<span class="case-idx">' + pad(i + 1) + "</span>" +
          '<span class="case-id"><span class="case-cliente">' + c.cliente + '</span><span class="case-segmento">' + c.segmento + "</span></span>" +
          '<span class="case-kpis">' + kpis + "</span>" +
          '<span class="case-chevron" aria-hidden="true"></span>' +
        "</summary>" +
        '<div class="case-body">' +
          "<p><strong>Objetivo</strong>" + c.objetivo + "</p>" +
          "<p><strong>Estratégia</strong>" + c.estrategia + "</p>" +
        "</div>";
      grid.appendChild(det);
    });
  })();

  /* ---------- 12 Depoimentos: carrossel com autoplay suave ---------- */
  var depoStop = function () {};
  (function depoimentos() {
    var track = $("depoTrack");
    var lista = D.depoimentos || [];
    var secao = $("depoimentos");
    if (!track || !lista.length) { if (secao) secao.remove(); return; }
    track.innerHTML = lista.map(function (d) {
      return '<article class="depo"><p class="depo-texto">' + d.texto + "</p>" +
        '<div class="depo-autor"><span class="avatar" aria-hidden="true">' + iniciais(d.nome) + "</span><div><b>" + d.nome + "</b><small>" + d.cargo + "</small></div></div></article>";
    }).join("");
    var car = makeCarousel({ viewport: $("depoCar"), track: track, prev: $("depoPrev"), next: $("depoNext"), start: Math.min(1, lista.length - 1) });
    var timer = null, hover = false, visivel = false;
    function tick() { if (!hover && visivel && !motionOff && !reduceMotion) car.go(car.index + 1); }
    function start() { if (!timer && !reduceMotion) timer = setInterval(tick, 6000); }
    function stop() { clearInterval(timer); timer = null; }
    depoStop = function (off) { if (off) stop(); else start(); };
    $("depoCar").addEventListener("pointerenter", function () { hover = true; });
    $("depoCar").addEventListener("pointerleave", function () { hover = false; });
    $("depoCar").addEventListener("focusin", function () { hover = true; });
    $("depoCar").addEventListener("focusout", function () { hover = false; });
    onVisible($("depoCar"), function (vis) { visivel = vis; if (vis) start(); else stop(); }, 0.3);
  })();

  /* ---------- 13 FAQ ---------- */
  (function faq() {
    var lista = $("faqLista");
    var itens = D.faq || [];
    if (!lista || !itens.length) return;
    lista.innerHTML = itens.map(function (f) {
      return '<details class="faq-item"><summary>' + f.p + '<span class="faq-plus" aria-hidden="true"></span></summary><div class="faq-body"><p>' + f.r + "</p></div></details>";
    }).join("");
    lista.addEventListener("toggle", function (e) {
      if (e.target.open) lista.querySelectorAll("details[open]").forEach(function (d) { if (d !== e.target) d.open = false; });
      if (hasGsap) ScrollTrigger.refresh();
    }, true);
  })();
  document.addEventListener("toggle", function () { if (hasGsap) ScrollTrigger.refresh(); }, true);

  /* ---------- Reveal ao rolar (depois de todas as renderizações) ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Menu do computador: a luz que corre entre os itens ----------
     Ela vai até o item sob o cursor e, quando o cursor sai, volta para o item
     da seção que está sendo lida. No celular o menu é a gaveta, e ela não existe. */
  var marcaNavAtual = function () {};
  (function navLuz() {
    var nav = $("nav");
    var luz = $("navLuz");
    if (!nav || !luz) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll("a:not(.nav-cta)"));
    if (!links.length) return;
    var atual = null;
    var mq = window.matchMedia("(min-width: 1041px)");

    function move(link) {
      if (!link || !mq.matches) { luz.style.opacity = 0; return; }
      var base = nav.getBoundingClientRect();
      var r = link.getBoundingClientRect();
      luz.style.width = r.width + "px";
      luz.style.transform = "translateX(" + (r.left - base.left) + "px)";
      luz.style.opacity = 1;
    }

    links.forEach(function (a) {
      a.addEventListener("pointerenter", function () { move(a); });
      a.addEventListener("focus", function () { move(a); });
    });
    nav.addEventListener("pointerleave", function () { move(atual); });
    window.addEventListener("resize", function () { move(atual); }, { passive: true });

    marcaNavAtual = function (id) {
      var alvo = null;
      links.forEach(function (a) {
        var on = !!id && a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-atual", on);
        if (on) alvo = a;
      });
      atual = alvo;
      if (!nav.matches(":hover")) move(atual);
    };
  })();

  /* ---------- Indicador de seção no header + trilho de produção ---------- */
  (function indicadores() {
    var headerIdx = $("headerIdx");
    var rail = $("rail");
    var railFill = $("railFill");
    var railItens = rail ? Array.prototype.slice.call(rail.querySelectorAll("li")) : [];
    // rótulos montados a partir das próprias seções: a mesma lógica serve para a página
    // curta e para a completa, sem lista fixa para manter em dia. Os mini títulos não
    // têm mais numeração, então o indicador mostra só o nome da seção.
    var rotulos = {};
    Array.prototype.slice.call(document.querySelectorAll("main > section[id] .eyebrow")).forEach(function (eyebrow) {
      var sec = eyebrow.closest("section[id]");
      if (!sec || rotulos[sec.id]) return;
      var idxEl = eyebrow.querySelector(".idx");          // a página completa ainda numera
      var nome = eyebrow.textContent;
      if (idxEl) nome = nome.replace(idxEl.textContent, "");
      nome = nome.trim();
      if (nome) rotulos[sec.id] = nome;
    });
    var atual = null;
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          // a seção mostrada saiu da faixa de leitura e nenhuma outra entrou (rodapé, topo): apaga o indicador
          if (headerIdx && entry.target.id === atual) { atual = null; headerIdx.classList.remove("on"); marcaNavAtual(null); }
          return;
        }
        atual = entry.target.id;
        marcaNavAtual(atual);
        var r = rotulos[entry.target.id];
        if (headerIdx) {
          headerIdx.textContent = r || "";
          headerIdx.classList.toggle("on", !!r);
        }
        var st = entry.target.getAttribute("data-station");
        if (rail && st) {
          var idx = -1;
          railItens.forEach(function (li, i) {
            var on = li.getAttribute("data-station") === st;
            li.classList.toggle("on", on);
            if (on) idx = i;
          });
          rail.classList.toggle("on", entry.target.id !== "hero");
          if (railFill && idx >= 0) railFill.style.height = (idx / Math.max(1, railItens.length - 1) * 100) + "%";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach(function (s) { secObserver.observe(s); });
  })();

  /* ---------- Contadores ---------- */
  function animateCount(el, target, duration) {
    if (reduceMotion) { el.textContent = target.toLocaleString("pt-BR"); return; }
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        animateCount(el, parseInt(el.getAttribute("data-count"), 10), 1600);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(function (el) { countObserver.observe(el); });

  /* ---------- Canvas helpers ---------- */
  function setupCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: rect.width, h: rect.height };
  }

  /* ---------- Hero: carrossel 3D (cards em dados.js -> heroCards) ---------- */
  (function heroMarquee() {
    var stage = $("marqueeStage");
    var cards = D.heroCards || [];
    if (!stage || !cards.length) return;
    var COLS = 4, REPEAT = 3, durations = [24, 30, 26, 32];
    function cardHTML(c) {
      if (c.tipo === "depoimento") {
        return '<div class="mcard">' +
          '<div class="mcard-head"><span class="mcard-avatar">' + iniciais(c.nome) + "</span>" +
          '<div><div class="mcard-nome">' + c.nome + '</div><div class="mcard-cargo">' + c.cargo + "</div></div></div>" +
          '<p class="mcard-texto">' + c.texto + "</p></div>";
      }
      return '<div class="mcard"><span class="mcard-tag">' + c.tag + "</span>" +
        '<span class="mcard-valor">' + c.valor + "</span>" +
        '<span class="mcard-label">' + c.label + "</span></div>";
    }
    for (var col = 0; col < COLS; col++) {
      var shift = (col * 3) % cards.length;
      var ordem = cards.slice(shift).concat(cards.slice(0, shift));
      var track = '<div class="marquee-track">' + ordem.map(cardHTML).join("") + "</div>";
      var colEl = document.createElement("div");
      colEl.className = "marquee-col" + (col % 2 ? " reverse" : "");
      colEl.style.setProperty("--duration", durations[col] + "s");
      colEl.innerHTML = track.repeat(REPEAT);
      stage.appendChild(colEl);
    }
  })();

  /* ---------- CTA: grade piscante (FlickerGrid) ---------- */
  (function ctaGrid() {
    var canvas = $("ctaGrid");
    if (!canvas) return;
    var state, cols, rows, cells, running = false, rafId = null;
    var SIZE = 3, GAP = 9;
    function build() {
      state = setupCanvas(canvas);
      cols = Math.ceil(state.w / GAP);
      rows = Math.ceil(state.h / GAP);
      cells = new Float32Array(cols * rows);
      for (var i = 0; i < cells.length; i++) cells[i] = Math.random() * 0.14;
    }
    function draw() {
      var ctx = state.ctx;
      ctx.clearRect(0, 0, state.w, state.h);
      var cy = state.h / 2;
      for (var r = 0; r < rows; r++) {
        var fade = Math.min(1, Math.abs(r * GAP - cy) / (state.h * 0.42) + 0.25); // esmaece rumo ao centro, onde fica o texto
        for (var c = 0; c < cols; c++) {
          var idx = r * cols + c;
          if (!reduceMotion && Math.random() < 0.012) cells[idx] = Math.random() * 0.42;
          cells[idx] *= 0.985;
          var a = cells[idx];
          if (a < 0.015) continue;
          var hot = ((idx * 2654435761) >>> 0) % 100 === 0; // ~1% das células são vermelhas
          ctx.fillStyle = (hot ? "rgba(230,0,18," : "rgba(201,204,210,") + (a * fade).toFixed(3) + ")";
          ctx.fillRect(c * GAP, r * GAP, SIZE, SIZE);
        }
      }
    }
    var last = 0;
    function loop(ts) {
      if (!running) return;
      if (ts - last >= 33) { last = ts; draw(); } // ~30 fps bastam para um brilho lento e poupam o celular
      if (reduceMotion || motionOff) return;
      rafId = requestAnimationFrame(loop);
    }
    build();
    draw();
    onVisible(canvas, function (vis) {
      running = vis;
      if (vis) rafId = requestAnimationFrame(loop);
      else if (rafId) cancelAnimationFrame(rafId);
    });
    restarts.push(function () { if (running) rafId = requestAnimationFrame(loop); });
    var rT;
    window.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        var r = canvas.getBoundingClientRect();
        if (state && Math.round(r.width) === Math.round(state.w) && Math.round(r.height) === Math.round(state.h)) return; // só a barra do navegador mudou
        build(); draw();
      }, 150);
    });
  })();

  /* ---------- Footer: texto em pontos piscantes ---------- */
  (function footerFlicker() {
    var canvas = $("footerFlicker");
    if (!canvas) return;
    var state, dots = [], running = false, rafId = null;
    function build() {
      state = setupCanvas(canvas);
      dots = [];
      var off = document.createElement("canvas");
      off.width = Math.round(state.w);
      off.height = Math.round(state.h);
      var octx = off.getContext("2d");
      var fontSize = Math.min(state.h * 0.72, state.w / 5.4);
      octx.font = "expanded 700 " + fontSize + "px Archivo, Arial, sans-serif";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText("OLIVEON", off.width / 2, off.height / 2 + fontSize * 0.05);
      var GAP = Math.max(4, Math.round(fontSize / 24));
      var data = octx.getImageData(0, 0, off.width, off.height).data;
      for (var y = 0; y < off.height; y += GAP) {
        for (var x = 0; x < off.width; x += GAP) {
          if (data[(y * off.width + x) * 4 + 3] > 128) {
            dots.push({ x: x, y: y, a: 0.1 + Math.random() * 0.5, s: Math.max(1.5, GAP * 0.42) });
          }
        }
      }
    }
    // a cor dos pontos vem do tema: prata no escuro, chumbo no claro
    var corPontos = "201,204,210";
    function lerCor() {
      corPontos = docEl.getAttribute("data-tema") === "claro" ? "74,80,90" : "201,204,210";
    }
    lerCor();
    aoTrocarTema.push(function () { lerCor(); draw(); });

    function draw() {
      if (!state) return; // build() roda depois de document.fonts.ready
      var ctx = state.ctx;
      ctx.clearRect(0, 0, state.w, state.h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        if (!reduceMotion && Math.random() < 0.03) d.a = 0.08 + Math.random() * 0.75;
        d.a += (0.3 - d.a) * 0.01;
        ctx.fillStyle = "rgba(" + corPontos + "," + d.a.toFixed(3) + ")";
        ctx.fillRect(d.x, d.y, d.s, d.s);
      }
    }
    function loop() {
      if (!running) return;
      draw();
      if (reduceMotion || motionOff) return;
      rafId = requestAnimationFrame(loop);
    }
    function start() { build(); draw(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();
    onVisible(canvas, function (vis) {
      running = vis;
      if (vis) rafId = requestAnimationFrame(loop);
      else if (rafId) cancelAnimationFrame(rafId);
    });
    restarts.push(function () { if (running) rafId = requestAnimationFrame(loop); });
    var rT;
    window.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(function () { build(); draw(); }, 150);
    });
  })();

  /* ---------- Pausar / retomar animações (WCAG 2.2.2) ----------
     Não pausa a timeline global do GSAP (esconderia conteúdo): as animações passam a ter duração zero. */
  var motionBtn = $("motionToggle");
  if (motionBtn) motionBtn.addEventListener("click", function () {
    motionOff = !motionOff;
    docEl.classList.toggle("motion-off", motionOff);
    motionBtn.textContent = motionOff ? "Retomar animações" : "Pausar animações";
    if (motionOff && heroTl) heroTl.progress(1);
    depoStop(motionOff);
    if (motionOff) videosPause();
    if (!motionOff) restarts.forEach(function (f) { f(); });
  });

  /* ---------- GSAP: carregado depois da renderização, sem bloquear; o site inteiro funciona sem ele ---------- */
  var GSAP_BASE = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/";
  // Hashes SRI dos arquivos 3.15.0 servidos pelo cdnjs (recalcular ao trocar a versão)
  var GSAP_SRI = {
    "gsap.min.js": "sha384-XmJ9SoHtVOHoQUcKvFAzVXwdkKo1Ie3bhmSoIAkcdsHGaIrVJIkmozyq0FJeb/Ly",
    "ScrollTrigger.min.js": "sha384-wl5TeDVvOWt30Pbf8aSo2ZrzsOjddu3avOBvHe+p+OhJt9gP6w9YXmDkN5DK2/dF",
    "Flip.min.js": "sha384-LY8cG/IUULu4u3V3AhwWBt01HIuO/hlekjkqgBx0DOJ/oquEL0Qk2L6qy+1QeRZM"
  };
  var introFeita = false;

  // Sem GSAP (falha, CDN lento ou reduced-motion): mostra o hero com um fade curto, sem a coreografia
  function liberaHero() {
    if (introFeita) return;
    introFeita = true;
    document.querySelectorAll("[data-hero]").forEach(function (el) { el.style.transition = "opacity 0.5s"; });
    docEl.classList.remove("intro-pending");
  }

  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);
    hasGsap = true;
    docEl.classList.add("gsap");

    // entrada do hero, só se ele ainda está esperando (intro-pending)
    if (!introFeita) {
      introFeita = true;
      var h1 = $("heroTitle");
      if (h1) splitWords(h1);
      heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1, onComplete: function () { docEl.classList.remove("intro-pending"); } });
      heroTl.set("#heroTitle", { opacity: 1 });
      // o selo existe só na página completa; sem guarda o GSAP avisa "target not found" no console
      if (document.querySelector('[data-hero="badge"]')) {
        heroTl.fromTo('[data-hero="badge"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0);
      }
      // Entrada do título palavra a palavra: cada uma chega desfocada e de cima,
      // passa por um meio-caminho ainda leitoso e assenta nítida no lugar.
      var palavras = document.querySelectorAll(".hero h1 .w > span");
      if (palavras.length) {
        gsap.set(palavras, { filter: "blur(10px)", opacity: 0, y: -50 });
        heroTl.to(palavras, {
          keyframes: [
            { filter: "blur(5px)", opacity: 0.5, y: 5, duration: 0.18 },
            { filter: "blur(0px)", opacity: 1, y: 0, duration: 0.18 }
          ],
          ease: "power2.out",
          stagger: 0.15
        }, 0.15);
      }
      heroTl
        .fromTo('[data-hero="sub"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .fromTo('[data-hero="actions"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.85);
      // os números só estão dentro do hero na página completa; na curta viraram a barra
      if (document.querySelector('[data-hero="stats"]')) {
        heroTl.fromTo('[data-hero="stats"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 1.0);
      }
      if (motionOff) heroTl.progress(1);
    }

    // o anel da lâmina gira discretamente conforme o hero sai de cena
    // o anel existe só na página completa; sem guarda o GSAP avisa "target not found"
    if ($("heroRing")) {
      gsap.to("#heroRing", { rotation: 9, transformOrigin: "50% 50%", ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    }

    // módulos de software sobem em sequência conforme entram na tela
    var mods = gsap.utils.toArray(".mod");
    if (mods.length) {
      gsap.set(mods, { opacity: 0, y: 28 }); // vertical: um deslocamento em x estenderia a largura da página
      ScrollTrigger.batch(mods, {
        start: "top 88%",
        once: true,
        onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: motionOff ? 0 : 0.7, stagger: motionOff ? 0 : 0.12, ease: "power3.out", overwrite: true }); }
      });
    }

    // faixas de "O que fazemos": entram escalonadas conforme cruzam a tela
    var faixas = gsap.utils.toArray("#fazLista .banner");
    if (faixas.length) {
      gsap.set(faixas, { opacity: 0, y: 18 });
      ScrollTrigger.batch(faixas, {
        start: "top 92%",
        once: true,
        onEnter: function (lote) {
          gsap.to(lote, { opacity: 1, y: 0, duration: motionOff ? 0 : 0.55, stagger: motionOff ? 0 : 0.07, ease: "power3.out", overwrite: true });
        }
      });
    }

    // o card da conversa flutua devagar enquanto a seção passa
    var fone = $("chatMock");
    if (fone) {
      gsap.to(fone, {
        yPercent: -5, ease: "none",
        scrollTrigger: { trigger: "#automacao", start: "top 55%", end: "bottom top", scrub: 0.5 }
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    ScrollTrigger.refresh();
  }

  function loadScript(file, cb) {
    var s = document.createElement("script");
    s.src = GSAP_BASE + file;
    s.async = true;
    s.crossOrigin = "anonymous";
    if (GSAP_SRI[file]) s.integrity = GSAP_SRI[file];
    s.onload = function () { cb(true); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  if (reduceMotion) {
    liberaHero();
  } else {
    var heroTimer = setTimeout(liberaHero, 1500); // CDN lento não segura o hero
    loadScript("gsap.min.js", function (ok) {
      if (!ok) { liberaHero(); return; }
      loadScript("ScrollTrigger.min.js", function (ok2) {
        if (!ok2) { liberaHero(); return; }
        loadScript("Flip.min.js", function () {
          clearTimeout(heroTimer);
          if (window.gsap && window.ScrollTrigger) initMotion(); else liberaHero();
        });
      });
    });
  }

  /* ---------- Formulário → WhatsApp ---------- */
  var form = $("formDiagnostico");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    // só entra na mensagem o campo que existe no formulário desta página
    var linhas = [
      ["Nome", "nome"], ["Empresa", "empresa"], ["WhatsApp", "whatsapp"], ["E-mail", "email"],
      ["Site/Instagram", "site"], ["Investimento atual em marketing", "investimento"],
      ["Precisa primeiro de", "frente"], ["O que busca melhorar", "objetivo"]
    ].filter(function (par) { return form.elements[par[1]]; })
      .map(function (par) { return "*" + par[0] + ":* " + (f.get(par[1]) || "não informado"); });
    if (ficha.lista().length) linhas.push("*Frentes marcadas no site:* " + ficha.lista().join(", "));
    window.open(waLink("*Solicitação de diagnóstico, site Oliveon*\n\n" + linhas.join("\n")), "_blank", "noopener");
  });

})();
