/* ============================================================
   OLIVEON PERFORMANCE — SCRIPTS
   Sem dependências externas. Dados editáveis em js/dados.js.
   ============================================================ */
(function () {
  "use strict";

  var D = window.OLIVEON || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOff = false;   // pausa manual (botão "Pausar animações")
  var restarts = [];       // loops de canvas que devem ser retomados

  /* ---------- Header: fundo ao rolar ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Links de WhatsApp ---------- */
  function waLink(msg) {
    return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(msg || D.whatsappMensagem || "");
  }
  document.querySelectorAll("[data-whats]").forEach(function (el) {
    el.href = waLink();
    el.target = "_blank";
    el.rel = "noopener";
  });
  var fEmail = document.getElementById("footerEmail");
  if (fEmail && D.email) fEmail.href = "mailto:" + D.email;
  var fInsta = document.getElementById("footerInstagram");
  if (fInsta && D.instagram) fInsta.href = D.instagram;
  document.getElementById("ano").textContent = new Date().getFullYear();

  /* ---------- Números (renderizados de dados.js) ---------- */
  var numerosGrid = document.getElementById("numerosGrid");
  (D.numeros || []).forEach(function (n, i) {
    var div = document.createElement("div");
    div.className = "numero reveal" + (i % 5 ? " delay-" + (i % 5) : "");
    div.innerHTML =
      '<div class="numero-valor">' +
      (n.prefixo ? '<span class="nv-aff">' + n.prefixo.trim() + "</span>" : "") +
      '<span data-count="' + n.valor + '">0</span>' +
      (n.sufixo ? '<span class="nv-aff">' + n.sufixo.trim() + "</span>" : "") + "</div>" +
      '<p class="numero-legenda">' + n.legenda + "</p>";
    numerosGrid.appendChild(div);
  });

  /* ---------- Cases (renderizados de dados.js) ---------- */
  var casesGrid = document.getElementById("casesGrid");
  (D.cases || []).forEach(function (c, i) {
    var det = document.createElement("details");
    det.className = "case reveal" + (i % 3 ? " delay-" + (i % 3) : "");
    var kpis = c.resultados.map(function (r) {
      return '<span class="case-kpi"><b>' + r.destaque + "</b><small>" + r.texto + "</small></span>";
    }).join("");
    det.innerHTML =
      '<summary class="case-row">' +
        '<span class="case-idx">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="case-id"><span class="case-cliente">' + c.cliente + '</span><span class="case-segmento">' + c.segmento + "</span></span>" +
        '<span class="case-kpis">' + kpis + "</span>" +
        '<span class="case-chevron" aria-hidden="true"></span>' +
      "</summary>" +
      '<div class="case-body">' +
        "<p><strong>Objetivo</strong>" + c.objetivo + "</p>" +
        "<p><strong>Estratégia</strong>" + c.estrategia + "</p>" +
      "</div>";
    casesGrid.appendChild(det);
  });

  /* ---------- Bento grid (PROVISÓRIO — cards em dados.js -> bentoCards) ---------- */
  (function bento() {
    var grid = document.getElementById("bentoGrid");
    var cards = D.bentoCards || [];
    if (!grid || !cards.length) return;
    var svgOpen = '<svg class="bento-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var icons = {
      chart:  svgOpen + '<path d="M3 3v18h18"/><path d="M7 15l4-4 4 3 5-6"/></svg>',
      bell:   svgOpen + '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
      layers: svgOpen + '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
      target: svgOpen + '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
      zap:    svgOpen + '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/></svg>'
    };
    var arrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';

    function visualHTML(tipo) {
      switch (tipo) {
        case "barras":
          return '<div class="bv bv-barras">' + [28, 40, 36, 55, 50, 70, 64, 88].map(function (h) {
            return '<span style="--h:' + h + '%"></span>';
          }).join("") + "</div>";
        case "lista":
          return '<div class="bv bv-lista">' +
            "<div><i></i>Novo lead recebido<small>agora</small></div>" +
            "<div><i></i>Venda confirmada<small>2 min</small></div>" +
            "<div><i></i>Reunião agendada<small>9 min</small></div></div>";
        case "pills":
          return '<div class="bv bv-pills">' + ["Google Ads", "Meta Ads", "GA4", "Tag Manager", "Shopify", "RD Station", "Looker Studio", "Hotjar", "WhatsApp", "HubSpot"].map(function (p) {
            return "<span>" + p + "</span>";
          }).join("") + "</div>";
        case "numero":
          return '<div class="bv bv-numero">+240%</div>';
        default:
          return "";
      }
    }

    cards.forEach(function (c, i) {
      var a = document.createElement("a");
      a.href = c.link || "#contato";
      a.className = "bento-card reveal " + (c.tamanho === "g" ? "g" : "p") + (i % 3 ? " delay-" + (i % 3) : "");
      a.innerHTML =
        '<div class="bento-visual" aria-hidden="true">' + visualHTML(c.visual) + "</div>" +
        '<div class="bento-body">' + (icons[c.icone] || "") + "<h3>" + c.titulo + "</h3><p>" + c.texto + "</p></div>" +
        '<span class="bento-cta">' + (c.cta || "Saiba mais") + arrow + "</span>";
      grid.appendChild(a);
    });
  })();

  /* ---------- Entregáveis: banners empilhados (dados.js -> entregaveis) ---------- */
  (function entregaveis() {
    var lista = document.getElementById("entregaveisLista");
    var itens = D.entregaveis || [];
    if (!lista || !itens.length) return;
    lista.innerHTML = itens.map(function (it, i) {
      return '<div class="banner">' +
        '<span class="banner-num">' + String(i + 1).padStart(2, "0") + "</span>" +
        "<div><h4>" + it.titulo + "</h4><p>" + it.descricao + "</p></div>" +
        '<span class="banner-tag">' + it.tag + "</span></div>";
    }).join("");
  })();

  /* ---------- Reveal ao rolar ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Indicador de seção no header ---------- */
  var headerIdx = document.getElementById("headerIdx");
  if (headerIdx) {
    var rotulos = { servicos: "01 / 09 · Serviços", metodo: "02 / 09 · Como trabalhamos", entregaveis: "03 / 09 · Entregáveis", diferencial: "04 / 09 · Diferencial", bento: "05 / 09 · Plataforma", numeros: "06 / 09 · Resultados", cases: "07 / 09 · Cases", sobre: "08 / 09 · Sobre", contato: "09 / 09 · Contato" };
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var r = rotulos[entry.target.id];
        headerIdx.textContent = r || "";
        headerIdx.classList.toggle("on", !!r);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach(function (s) { secObserver.observe(s); });
  }

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
  function onVisible(el, cb) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting); });
    }, { threshold: 0.05 });
    obs.observe(el);
  }

  /* ---------- Hero: carrossel 3D (cards em dados.js -> heroCards) ---------- */
  (function heroMarquee() {
    var stage = document.getElementById("marqueeStage");
    var cards = D.heroCards || [];
    if (!stage || !cards.length) return;
    var COLS = 4, REPEAT = 3, durations = [24, 30, 26, 32];

    function iniciais(nome) {
      return nome.split(" ").map(function (p) { return p.charAt(0); }).join("").slice(0, 2).toUpperCase();
    }
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
    var canvas = document.getElementById("ctaGrid");
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
        for (var c = 0; c < cols; c++) {
          var idx = r * cols + c;
          if (!reduceMotion && Math.random() < 0.012) cells[idx] = Math.random() * 0.42;
          cells[idx] *= 0.985;
          var a = cells[idx];
          if (a < 0.015) continue;
          // esmaece em direção ao centro para dar lugar ao texto
          var fade = Math.min(1, Math.abs(r * GAP - cy) / (state.h * 0.42) + 0.25);
          var hot = ((idx * 2654435761) >>> 0) % 100 === 0; // ~1% das células são vermelhas
          ctx.fillStyle = (hot ? "rgba(230,0,18," : "rgba(201,204,210,") + (a * fade).toFixed(3) + ")";
          ctx.fillRect(c * GAP, r * GAP, SIZE, SIZE);
        }
      }
    }

    function loop() {
      if (!running) return;
      draw();
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
    window.addEventListener("resize", function () { build(); draw(); });
  })();

  /* ---------- Footer: texto em pontos piscantes ---------- */
  (function footerFlicker() {
    var canvas = document.getElementById("footerFlicker");
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

    // aguarda a fonte carregar para amostrar o texto corretamente
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

  /* ---------- Pausar / retomar animações (WCAG 2.2.2) ---------- */
  var motionBtn = document.getElementById("motionToggle");
  if (motionBtn) motionBtn.addEventListener("click", function () {
    motionOff = !motionOff;
    document.documentElement.classList.toggle("motion-off", motionOff);
    motionBtn.textContent = motionOff ? "Retomar animações" : "Pausar animações";
    if (!motionOff) restarts.forEach(function (f) { f(); });
  });

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById("formDiagnostico");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var msg =
      "*Solicitação de diagnóstico — site Oliveon*\n\n" +
      "*Nome:* " + f.get("nome") + "\n" +
      "*Empresa:* " + f.get("empresa") + "\n" +
      "*WhatsApp:* " + f.get("whatsapp") + "\n" +
      "*E-mail:* " + f.get("email") + "\n" +
      "*Site/Instagram:* " + (f.get("site") || "não informado") + "\n" +
      "*Investimento atual em marketing:* " + f.get("investimento") + "\n" +
      "*O que busca melhorar:* " + f.get("objetivo");
    window.open(waLink(msg), "_blank", "noopener");
  });

})();
