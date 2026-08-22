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

  /* ---------- Hero: stats de autoridade ---------- */
  (function heroStats() {
    var ul = $("heroStats");
    var itens = D.heroStats || [];
    if (!ul || !itens.length) { if (ul) ul.remove(); return; }
    ul.innerHTML = itens.map(function (s) {
      return "<li><b>" + s.valor + "</b><small>" + s.label + "</small></li>";
    }).join("");
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

  /* ---------- Faixa de confiança: logos de clientes ou segmentos ---------- */
  (function faixa() {
    var wrap = $("faixaMarquee");
    var rotulo = $("faixaRotulo");
    if (!wrap) return;
    var clientes = D.clientes || [];
    var itens;
    if (clientes.length) {
      itens = clientes.map(function (c) {
        var img = '<img src="' + esc(c.logo) + '" alt="' + esc(c.nome) + '" loading="lazy" height="34">';
        return '<span class="faixa-item">' + (c.url ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener" aria-label="' + esc(c.nome) + '">' + img + "</a>" : img) + "</span>";
      });
    } else {
      // sem logo de cliente ainda: a faixa mostra os segmentos atendidos
      if (rotulo) rotulo.textContent = "Segmentos atendidos";
      var lead = $("clientesLead");
      if (lead) lead.textContent = "Segmentos em que já colocamos sistemas de aquisição em produção. As marcas entram aqui conforme cada cliente libera o uso.";
      itens = (D.segmentos || []).map(function (s) { return '<span class="faixa-item">' + esc(s) + "</span>"; });
    }
    if (!itens.length) {
      var caixa = wrap.closest(".faixa") || wrap.closest("section");
      if (caixa) caixa.remove();
      return;
    }
    var track = document.createElement("div");
    track.className = "faixa-track";
    track.style.setProperty("--duration", Math.max(24, itens.length * 4.5) + "s");
    track.innerHTML = itens.join("") + '<span class="faixa-copia" aria-hidden="true">' + itens.join("") + "</span>";
    track.querySelector(".faixa-copia").style.display = "contents";
    wrap.appendChild(track);
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
    lista.innerHTML = itens.map(function (s, i) {
      return '<div class="banner">' +
        '<span class="banner-num">' + pad(i + 1) + "</span>" +
        "<div><h3>" + s.titulo + "</h3><p>" + s.texto + "</p></div>" +
        '<span class="banner-tag">' + esc((s.tags && s.tags[0]) || "Oliveon") + "</span></div>";
    }).join("");

    // a dica de rolagem some quando a lista chega ao fim
    var wrap = lista.closest(".scroll-wrap");
    if (!wrap) return;
    function verFim() {
      var fim = lista.scrollTop + lista.clientHeight >= lista.scrollHeight - 24;
      wrap.classList.toggle("no-fim", fim);
    }
    lista.addEventListener("scroll", verFim, { passive: true });
    window.addEventListener("resize", verFim);
    verFim();
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

  /* ---------- 04 Automação em ação: conversa simulada ---------- */
  var playChat = function () {};
  (function automacao() {
    var body = $("chatBody");
    var etapasEl = $("etapasConversa");
    var conversa = D.conversa || [];
    var etapas = D.etapasConversa || [];
    if (!body || !conversa.length) return;
    if (etapasEl) etapasEl.innerHTML = etapas.map(function (e) { return "<li>" + e + "</li>"; }).join("");
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
        meta.innerHTML = "<span>" + hora() + "</span>" + (m.de === "bot" ? '<span class="ic-wrap" data-icon="check"></span>' : "");
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

  /* ---------- 07 Portfólio: filtros + fichas com capa técnica ---------- */
  (function portfolio() {
    var grid = $("portfolioGrid");
    var filtrosEl = $("portfolioFiltros");
    var itens = D.portfolio || [];
    var filtros = D.portfolioFiltros || [];
    if (!grid || !itens.length) return;
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

    grid.innerHTML = itens.map(function (p, i) {
      return '<article class="pf reveal' + (i % 3 ? " delay-" + (i % 3) : "") + '" data-tipo="' + esc(p.tipo) + '">' +
        '<div class="pf-capa" aria-hidden="true">' + capaHTML(p) + "</div>" +
        '<div class="pf-body"><span class="pf-tipo">' + esc(rotuloTipo[p.tipo] || p.tipo) + "</span><h3>" + p.titulo + "</h3><p>" + p.descricao + "</p>" +
        '<ul class="pf-entregas">' + (p.entregas || []).map(function (e) { return '<li class="tag">' + esc(e) + "</li>"; }).join("") + "</ul></div></article>";
    }).join("");
    var cards = Array.prototype.slice.call(grid.children);

    /* Página curta: mostra os primeiros projetos e guarda o resto atrás de um botão.
       Nada some, a página é que não nasce com 9 fichas abertas. */
    var LIMITE = 6;
    var botaoMais = $("pfMais");
    var caixaMais = botaoMais ? botaoMais.parentNode : null;
    var expandido = false;
    function aplicarLimite() {
      if (!caixaMais) return;
      var visiveis = cards.filter(function (c) { return !c.hidden; });
      var excede = visiveis.length > LIMITE;
      cards.forEach(function (c) { c.classList.remove("pf-oculto"); });
      if (excede && !expandido) visiveis.slice(LIMITE).forEach(function (c) { c.classList.add("pf-oculto"); });
      caixaMais.hidden = !excede;
      botaoMais.textContent = expandido ? "Ver menos" : "Ver mais projetos (" + (visiveis.length - LIMITE) + ")";
    }
    if (botaoMais) {
      botaoMais.addEventListener("click", function () {
        expandido = !expandido;
        aplicarLimite();
        if (hasGsap) ScrollTrigger.refresh();
        if (!expandido) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      aplicarLimite();
    }

    if (filtrosEl && filtros.length) {
      filtrosEl.innerHTML = filtros.map(function (f, i) {
        return '<button class="filtro" type="button" aria-pressed="' + (i === 0) + '" data-filtro="' + esc(f.id) + '">' + esc(f.rotulo) + "</button>";
      }).join("");
      filtrosEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".filtro");
        if (!btn) return;
        filtrosEl.querySelectorAll(".filtro").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var f = btn.getAttribute("data-filtro");
        var state = (hasGsap && window.Flip && !motionOff) ? Flip.getState(cards) : null;
        cards.forEach(function (c) {
          c.hidden = f !== "todos" && c.getAttribute("data-tipo") !== f;
          c.classList.add("visible"); // quem já foi revelado não volta a esconder
        });
        if (state) {
          Flip.from(state, {
            duration: 0.55,
            ease: "power2.inOut",
            absolute: true,
            onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45 }); },
            onLeave: function (els) { return gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.3 }); },
            onComplete: function () { ScrollTrigger.refresh(); }
          });
        }
        expandido = false;
        aplicarLimite();
      });
    }
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

  /* ---------- Indicador de seção no header + trilho de produção ---------- */
  (function indicadores() {
    var headerIdx = $("headerIdx");
    var rail = $("rail");
    var railFill = $("railFill");
    var railItens = rail ? Array.prototype.slice.call(rail.querySelectorAll("li")) : [];
    // rótulos montados a partir das próprias seções: a mesma lógica serve para a página
    // curta (5 blocos) e para a completa, sem lista fixa para manter em dia
    var rotulos = {};
    var comIdx = Array.prototype.slice.call(document.querySelectorAll("main > section[id] .eyebrow .idx"));
    comIdx.forEach(function (idxEl) {
      var eyebrow = idxEl.parentNode;
      var sec = eyebrow.closest("section[id]");
      if (!sec) return;
      var num = idxEl.textContent.trim();
      var nome = eyebrow.textContent.replace(num, "").trim();
      rotulos[sec.id] = num + " / " + pad(comIdx.length) + " · " + nome;
    });
    var atual = null;
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          // a seção mostrada saiu da faixa de leitura e nenhuma outra entrou (rodapé, topo): apaga o indicador
          if (headerIdx && entry.target.id === atual) { atual = null; headerIdx.classList.remove("on"); }
          return;
        }
        atual = entry.target.id;
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
    function draw() {
      if (!state) return; // build() roda depois de document.fonts.ready
      var ctx = state.ctx;
      ctx.clearRect(0, 0, state.w, state.h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        if (!reduceMotion && Math.random() < 0.03) d.a = 0.08 + Math.random() * 0.75;
        d.a += (0.3 - d.a) * 0.01;
        ctx.fillStyle = "rgba(201,204,210," + d.a.toFixed(3) + ")";
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
      heroTl.set("#heroTitle", { opacity: 1 })
        .fromTo('[data-hero="badge"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0)
        // y: 0 explícito, o GSAP lê o translateY(110%) do CSS como px e, sem isso, o px ficaria preso ao fim do tween
        .fromTo(".hero h1 .w > span", { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.9, stagger: 0.06, ease: "power4.out" }, 0.15)
        .fromTo('[data-hero="sub"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .fromTo('[data-hero="actions"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.85)
        .fromTo('[data-hero="stats"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 1.0);
      if (motionOff) heroTl.progress(1);
    }

    // o anel da lâmina gira discretamente conforme o hero sai de cena
    gsap.to("#heroRing", { rotation: 9, transformOrigin: "50% 50%", ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

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

    // faixas de "O que fazemos": entram escalonadas quando a lista aparece
    var faixas = gsap.utils.toArray("#fazLista .banner");
    var fazWrap = document.querySelector("#fazemos .scroll-wrap");
    var listaEl = $("fazLista");
    if (fazWrap && listaEl && faixas.length) {
      gsap.set(faixas, { opacity: 0, y: 16 });
      ScrollTrigger.create({
        trigger: fazWrap,
        start: "top 82%",
        once: true,
        onEnter: function () {
          gsap.to(faixas, { opacity: 1, y: 0, duration: motionOff ? 0 : 0.5, stagger: motionOff ? 0 : 0.06, ease: "power3.out", overwrite: true });
        }
      });

      // a lista corre junto com a página, revelando os itens por baixo do desfoque.
      // Ao primeiro toque, roda ou tecla do visitante, o automático desliga e o controle é dele.
      var manual = false;
      ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (ev) {
        listaEl.addEventListener(ev, function () { manual = true; }, { passive: true });
      });
      if (window.matchMedia("(min-width: 961px)").matches) {
        ScrollTrigger.create({
          trigger: "#fazemos",
          start: "top 70%",
          end: "bottom 30%",
          scrub: 0.6,
          onUpdate: function (self) {
            if (manual || motionOff) return;
            var max = listaEl.scrollHeight - listaEl.clientHeight;
            // para em 82%: os últimos itens continuam sob o desfoque e o respiro do fim da lista nunca aparece
            if (max > 0) listaEl.scrollTop = max * 0.82 * Math.min(1, Math.max(0, self.progress));
          }
        });
      }
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
