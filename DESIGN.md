# DESIGN.md, OLIVEON Performance · tema "Lâmina" · v2

> Fonte da verdade visual do site. Leia este arquivo antes de criar ou alterar qualquer interface.
> Formato inspirado no padrão DESIGN.md (Google Stitch / Uiverse Design): um manual que humanos leem rápido e agentes de código consultam antes de escrever UI.

## 1. Produto e tom

OLIVEON Performance é uma operação completa de aquisição digital, estratégia, tráfego pago, design, web e desenvolvimento na mesma mesa, que entrega tráfego, funis e automações (WhatsApp, e-mail, CRM), captação de leads, lançamentos, sites e landing pages, e-commerce e delivery, criativos e **software sob medida** (destaque). O site é institucional/comercial e tem um único trabalho: **gerar diagnósticos e conversas no WhatsApp**.

**Conceito, a bancada de produção.** O logo já é uma peça usinada: letras largas e quadradas em cromo escovado, um "E" de três barras e um "O" cortado por uma lâmina vermelha ascendente. O site é a planta dessa bancada: cada seção é uma estação numerada (01 a 14), cada entrega tem ficha técnica, cada número tem unidade. Tipografia expandida com a largura do wordmark, superfícies de grafite frio com hairlines de 1px como desenho técnico, leituras em monoespaçada larga como telemetria, e um único gesto vermelho, o corte diagonal, onde há ação ou resultado. O premium vem da precisão das linhas, do silêncio do espaço negativo e de um vermelho que aparece pouco e, por isso, pesa.

**Evitar:** neon, hexágonos, itálicos/oblíquos em display, gradientes visíveis, ícones coloridos, estética "infoproduto", retrô/lúdico, glows em cards, sombras difusas, pílulas e raios ≥ 8px, indicadores cenográficos ("LIVE", relógios, timestamps falsos), jargão técnico sem tradução para o dono do negócio, números inventados.

## 2. Fundamentos

### Cor (tokens em `css/styles.css` → `:root`)

| Token | Valor | Papel |
|---|---|---|
| `--bg` | `#0a0b0d` | Canvas da página. Preto-carbono com viés frio de aço (a temperatura do cromo) |
| `--bg-alt` | `#0d0e11` | Seções alternadas, faixa de confiança, rodapé |
| `--card` | `#121316` | Cards, painéis, formulário, mock do telefone, coluna Oliveon do comparativo (camada 2); hover das células |
| `--elevated` | `#191b1f` | Hover de cards/banners/módulos, menu mobile, bolha do lead, botão "Marcado" (camada 3) |
| `--edge` | `rgba(255,255,255,.06)` | Brilho de 1px no topo de superfícies elevadas (`box-shadow: inset 0 1px 0`): luz batendo numa chapa |
| `--border` | `#24262b` | Hairline padrão: divisores, grids colapsados, contorno de cards |
| `--border-strong` | `#34373e` | Molduras externas, botão ghost, trilhos, hairline dos eyebrows, borda do mock |
| `--text` | `#f4f5f7` | Títulos, números, texto principal (18:1) |
| `--text-2` | `#b9bcc3` | Leads e prosa principal (~10:1) |
| `--muted` | `#9da1a8` | Descrições de card, rótulos, nav inativa (7.6:1) |
| `--steel` | `#c9ccd2` | Prata do cromo: traços, ticks ativos, afixos dos contadores, foco de teclado, anel da lâmina, "quente" das capas do portfólio |
| `--steel-dim` | `#7e838c` | Sombra do cromo: linha de base dos campos, índices, ticks inativos, placeholders, estações inativas do trilho |
| `--red` | `#e60012` | **Único acento.** Botão primário, barra de 2px do card ativo/destaque, lâmina, uma palavra no h1, hairline dos contadores, tick da estação/etapa ativa. 4.1:1 sobre `--bg`: display/UI sim, texto pequeno não |
| `--red-hover` / `--red-pressed` | `#cc0010` / `#b8000e` | Estados do botão primário: hover e pressed escurecem em degraus, nunca clarear (texto branco exige ≥ 4.5:1 em todos os estados) |
| `--red-text` | `#ff3b4a` | Acento legível em texto pequeno (≥ 4.5:1): iniciais de avatar. Nunca como fundo |
| `--red-soft` / `--red-glow` | `rgba(230,0,18,.12 / .28)` | Fundo de avatar; único halo permitido (BorderBeam) |
| `--ok` | `#2fd27a` | Cor de sinal: confirmações do sistema (chips da conversa, checks do comparativo). Não é acento |
| `--cut-angle` | `37deg` | Ângulo da lâmina, medido no símbolo. Usado em todo traço inclinado |

**Orçamento de vermelho:** no máximo três ocorrências visíveis por viewport, nunca duas a menos de 200px. Na dúvida, remova a mais próxima do botão primário. Hover só acende um vermelho por vez (barra do card, tick do passo). As capas técnicas do portfólio e os ícones nunca usam vermelho; a célula de destaque dos serviços é a única com barra vermelha fixa. **Exceções declaradas** (não contam no orçamento porque são o motivo da marca ou leitura de instrumento, sempre em baixa intensidade): o traço do anel da lâmina no hero (50% de opacidade), as iniciais/borda dos avatares (`--red-text` / `--red-soft`) e as hairlines dos contadores, que acendem juntas como uma única leitura. O glifo `.slash` do badge do hero fica em prata para não disputar com a palavra vermelha do h1 a 44px.

### Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Archivo** variável (eixo de largura `wdth` 100 a 125, pesos 500 a 700) | h1/h2 em `font-stretch: 125%` (a largura do wordmark), h3/botões/nav em 112%/100%, números grandes em 125%/700, números-fantasma do processo, frase de fecho da equipe em 112%/500 |
| Texto | **Barlow** (400/500/600) | Parágrafos, leads, descrições, legendas, bolhas da conversa, tabela comparativa, links do rodapé |
| Dados | **Martian Mono** variável (`wdth` 87.5 a 112.5, pesos 400 a 600) | Eyebrows e índices (01 / 14), tags, rótulos de formulário, afixos dos contadores, indicador do header, estações do trilho, etapas da conversa, chips do sistema, filtros, botões "Preciso disto", linha legal. Caixa alta sempre que ≤ 12px, tracking 0.10 a 0.16em; `wdth` 87.5 em tags de 10 a 11px, 112.5 nos afixos |

Escala (desktop): h1 `clamp(2.5rem, 5.5vw − 0.5rem, 3.6rem)` em > 960px (≤ 960px: `clamp(2.5rem, 5.6vw, 4.2rem)`) 600 · lh 0.98 · tracking −0.015em · caixa de frase · coluna do hero ≈ 570px (grid 1.2fr/1fr) · 4 linhas no desktop · **uma palavra em `--red`** · h2 `clamp(1.9rem, 3.8vw, 2.9rem)` 600 · máx. 18ch (16ch nas seções de duas colunas) · h3 `1.25rem` 600 em 112% · corpo Barlow `1.0625rem`/1.6 · `.lead` `1.1rem` em `--text-2` · pequeno `0.8 a 0.94rem` · mono `0.6 a 0.75rem` caixa alta. Contadores Archivo 125%/700 `clamp(2.3rem, 4.4vw, 3.5rem)` com `tabular-nums`; stats do hero 1.7rem; afixos em Martian Mono a 0.42em em `--steel`.

- Títulos com `text-wrap: balance`; prosa ≤ 52 a 56ch; lead de seção larga ≤ 44ch.
- Em ≤ 720px o h1 cai para `font-stretch: 112%` e o h2 para 118%.
- Fallbacks reais em todas as pilhas (`--display`, `--font`, `--mono`).

### Forma e linha

- Raios: `2px` em botões, campos, tags, filtros, chips e menu; `4px` em cards, módulos, mock do telefone, formulário, grids, capas. Zero pílulas (só avatares são círculos).
- Hairline `1px --border` para estrutura; `--border-strong` para molduras; `2px --red` só para indicadores (barra do card ativo, linha de foco); `1.5px --steel` no anel da lâmina.
- Sem sombras difusas. Profundidade = `--edge` (1px de brilho no topo) + troca de camada no hover. Única exceção: o logo cromado (quando usado).
- Grids colapsados (`gap: 1px` sobre `--border`, moldura `--border-strong`): dores (4 col), serviços (3 col; destaque ocupa 2), equipe (3 col).
- Container `1140px`, padding lateral 24px; o header usa `1320px` para caber logo + indicador + 6 links + CTA. Seções com `128px` de respiro (88px no mobile).

### O motivo, a lâmina

O traço diagonal do símbolo, sempre no ângulo `--cut-angle`, só nestes lugares: (1) o anel gigante atrás do carrossel do hero (SVG inline: círculo `--steel` a 9% + traço `--red` a 50%; gira 9° com o scroll); (2) o glifo `.slash` antes do eyebrow do hero (em `--steel` ali; `--red` nos demais usos); (3) os ticks dos trilhos de instrumento, processo, etapas da conversa e trilho de produção (`--steel-dim`; `--steel` quando concluído; `--red` só no ativo); (4) os traços dos pilares do posicionamento e os separadores da faixa de confiança (`--steel` / `--border-strong`). O botão primário e o CTA fixo do mobile carregam a lâmina em miniatura: canto superior direito chanfrado em 9px (gradiente com canto transparente, não usar `clip-path`, que corta foco e sombra).

## 3. Layout

Página única, ordem fixa: header fixo (64px) → hero (texto + stats à esquerda, carrossel 3D à direita; empilha no mobile) → faixa de confiança (logos ou segmentos) → 01 Posicionamento (dores → manifesto → pilares) → 02 Serviços → 03 Software sob medida → 04 Automação em ação → 05 Processo → 06 Entregáveis → 07 Portfólio → 08 Criativos em movimento (vídeos) → 09 Equipe (+ fecho + comparativo) → 10 Resultados → 11 Cases → 12 Depoimentos → 13 FAQ → CTA final → 14 Contato → rodapé (4 colunas + OLIVEON em pontos).

- **Trilho de produção** (`.rail`, ≥ 1280px): cinco estações na borda esquerda, *Atrair · Construir · Provar · Escalar · Começar*, cada seção declara a sua em `data-station`; o tick da estação ativa fica vermelho e a linha preenche em prata. Decorativo (`aria-hidden`), some abaixo de 1280px e enquanto o hero está em cena.
- O header mostra o indicador de instrumento da seção atual ("07 / 14 · Portfólio") via IntersectionObserver; some em ≤ 1299px e quando nenhuma seção está na faixa de leitura (rodapé).
- Grids: dores 4 → 2 → 1; serviços 3 → 2 → 1 (destaque: 2 → 2 → 1 colunas); passos 5 → 2 → 1; portfólio 3 → 2 → 1; equipe 3 → 2 → 1; números `auto-fit` ≥ 180px → 2 no mobile; cases e FAQ são linhas.
- Duas colunas (software, automação, entregáveis, FAQ, contato) empilham em ≤ 960px. Nada de `position: sticky` em colunas mais altas que a viewport.
- Breakpoints: `1300px` (esconde o indicador do header), `1280px` (liga o trilho), `1040px` (menu hambúrguer, o nav com 6 links + CTA precisa de ~720px), `960px` (empilha colunas), `720px` (grids de 1 coluna, CTA fixo de WhatsApp no rodapé da tela, h1 mais estreito).
- O hero fica sempre sobre `--bg` puro: a palavra vermelha do h1 só tem folga de contraste sobre o canvas base.
- Conteúdo variável vem de `js/dados.js`; nunca escrever esses dados no HTML. Só números reais do cliente, nada cenográfico; o que é EXEMPLO está marcado no arquivo.

## 4. Componentes

| Componente | Anatomia | Estados |
|---|---|---|
| `.btn-red` | fundo `--red` com canto superior direito chanfrado, texto branco, Archivo 112%/600 13px caixa alta, 48px de altura, raio 2px | hover `--red-hover`; active `--red-pressed`; focus-visible outline `--steel`. Sem lift, sem sombra |
| `.btn-ghost` | transparente, borda `--border-strong` | hover: borda `--steel` |
| `.ctrl` / `.vcar-btn` | quadrado 44px com hairline, ícone Lucide | hover: borda `--steel` + fundo `--card`; disabled a 35% |
| `.hero-stats` | três leituras com hairline vertical: valor Archivo 125%/700 1.7rem + legenda | - |
| `.faixa` | faixa `--bg-alt` com rótulo mono à esquerda e marquee horizontal (logos em silhueta branca a 55% ou segmentos Archivo 112% caps) com máscara nas bordas | hover: pausa; logo a 100% |
| `.dor` | célula de grid colapsado: índice mono, h3, texto, link mono "Resolve em → …" | hover: fundo `--card` |
| `.card` (serviço) | célula do painel: ícone Lucide `--steel-dim` + índice, h3, texto, tags, botão `.need` "Preciso disto" | hover: fundo `--card` + barra de 2px `--red` + ícone prata. `.destaque`: 2 colunas, fundo `--card`, barra fixa, link "Ver como construímos" |
| `.need` | botão mono caps com ícone plus | `aria-pressed=true`: fundo `--elevated`, borda `--steel`, ícone check, texto "Marcado"; a frente vai para a ficha do formulário e para a mensagem do WhatsApp (sessionStorage) |
| `.mod` (módulo de software) | card `--card` com `--edge`: ícone, h3, texto, índice | hover: `--elevated`; entra em sequência (GSAP batch, y 28 → 0) |
| `.bancada-lista` | lista com check prata e hairlines | - |
| `.phone` | mock-instrumento: topo com avatar `--red-soft` + nome + "simulação", corpo rolável 430px com `.msg.lead` (`--elevated`, esquerda), `.msg.bot` (`--card` + `--border-strong`, direita), `.msg.typing` (3 pontos) e `.chip` do sistema (mono caps com check `--ok`), barra "Mensagem" | timeline GSAP ao entrar na tela; botão "Ver de novo"; sem GSAP, tudo visível |
| `.etapas` | trilho de 4 etapas com ticks | `.done`: texto `--text-2`, tick `--steel`; `.on`: texto `--text`, tick `--red` |
| `.step` | trilho `--border-strong` com tick inclinado, número-fantasma Archivo 125%/700 a 40%, h3, texto | a hairline se desenha em sequência (`.steps.drawn`, 0.16s por passo); hover: tick vermelho, número a 100% |
| `.banner` (entregáveis) | índice mono, título Archivo 112%, descrição, tag mono raio 2px, em lista rolável com Progressive Blur | hover: `--elevated` |
| `.filtro` | botão mono caps com hairline (`role=tab`) | `aria-selected=true`: fundo `--text`, texto `--bg` |
| `.pf` (ficha do portfólio) | capa 16:10 desenhada em CSS por tipo (browser, grade de produtos, terminal, telefone) ou imagem; tipo mono, h3, descrição, tags de entregas | hover: `--elevated` + barra `--red`; filtro com GSAP Flip |
| `.vslide` (vídeo) | card 9:16 com `--border-strong`, `<video muted playsinline loop preload=none poster>`, botão de play chanfrado 56px, legenda (título + tag mono) | central `.is-active` (escala 1, opacidade 1; laterais 0.9/0.45); toca mudo ao entrar em foco; botão alterna play/pausa; setas, arrasto e teclado |
| `.membro` (equipe) | célula do grid: ícone, índice (ou "Sexta cadeira"), h3, texto, "Responsável por" + tags | hover: `--card` + barra `--red`; `.destaque` (IA) em `--card` |
| `.comp` (comparativo) | tabela-instrumento em moldura rolável: cabeçalho mono, perguntas em `--text`, células com ícone (check `--ok` para "Sim", x/minus `--steel-dim`), coluna Oliveon em `--card` | - |
| `.numero` | hairline vertical, valor Archivo 125%/700 com afixos mono prata, legenda; hairline vermelha na base que preenche junto com o contador (1.6s) | - |
| `.case` | `<details>`: linha-ficha com índice, cliente + segmento, 3 KPIs, chevron; corpo com Objetivo/Estratégia | hover/aberto: `--card` |
| `.depo` | card `--card` 440px: citação Barlow 1.08rem com aspas em `--steel-dim`, avatar de iniciais, nome + cargo mono | central `.is-active` (opacidade 1, borda `--border-strong`); laterais 0.45; autoplay 6s, pausa no hover/foco |
| `.faq-item` | `<details>` com summary Archivo 112%/600 + glifo "+" que vira "−" | um aberto por vez |
| `.ficha` | caixa com hairline no formulário: rótulo mono + chips removíveis das frentes marcadas | some quando vazia |
| `.form` | card `--card` com `--edge`; campos-instrumento sem caixa: rótulo mono caixa alta, texto Barlow 16px, linha de base `--steel-dim` | focus: linha vermelha + outline `--steel`; submit abre WhatsApp com todos os campos + frentes marcadas; BorderBeam vermelho + prata |
| `.header` | transparente; após rolar: `rgba(10,11,13,.78)` + blur 12px + hairline; logo 140px; indicador mono; nav Archivo 100%/500 | fallback sólido sem `backdrop-filter` |
| `.rail` | cinco estações em mono vertical com ticks e linha de preenchimento | `.on` na estação ativa (tick `--red`, texto `--text`) |
| `.sticky-cta` | barra chanfrada `--red` fixa no rodapé da tela (≤ 720px) | aparece depois do hero; some quando o contato está visível |
| `.border-beam` | feixe em `offset-path` pela borda | desliga em `prefers-reduced-motion` e no botão de pausa |

Ícones: **Lucide** via `js/icons.js` (traço 1.6px, `currentColor`), sempre monocromáticos, prata, nunca coloridos. Marca do WhatsApp e Instagram desenhadas no mesmo traço.

## 5. Movimento

Movimento de instrumento, curto, decidido, sem mola. Uma única curva em CSS (`--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`) e seu equivalente no GSAP (`power3.out`; `power4.out` só nas palavras do h1). Durações: `--dur-1` 180ms (hover/foco), `--dur-2` 320ms (estados), 0.7s para entradas (`@keyframes reveal-in`, 14px + fade; nunca declarar transform/transition em `.reveal`, senão os hovers morrem), 0.9s para hairlines que se desenham, 1.6s para contadores, 24 a 32s por coluna do carrossel 3D, 40s+ na faixa, 7 a 9s do BorderBeam.

**GSAP (3.15, CDN) faz só o que o CSS não faz bem:** a entrada do hero (badge → palavras do h1 sobem de 110% com stagger 0.06s → lead → CTAs → stats; o carrossel nunca fica oculto, por ser o maior elemento pintado), o giro de 9° do anel com o scroll (ScrollTrigger scrub), a entrada em sequência dos módulos de software (batch, y), a timeline da conversa simulada (typing 1.1s antes de cada resposta), o Flip ao filtrar o portfólio e os tweens de deslocamento dos carrosséis.

Regras de carga e fallback: o GSAP é carregado por `js/main.js` **depois** da renderização, sem bloquear (três `<script>` criados em cadeia, com SRI); a página inteira é renderizada antes dele. Um script inline no `<head>` marca `intro-pending` antes da primeira pintura (o hero começa oculto, exceto o carrossel); a timeline GSAP remove a classe ao terminar e, se o CDN falhar ou demorar mais de 1,5s, o JS remove a classe com um fade curto. A classe `gsap` no `<html>` só liga os estados iniciais da conversa (`.msg`, `.chip`). Animar `x` em elementos que tocam a borda do container estende a largura da página (usar `y`); quando o CSS já aplica um `transform` em `%`, o tween precisa zerar `y` explicitamente (o GSAP lê o valor computado em px); `ScrollTrigger.refresh()` após fontes, `load` e ao abrir/fechar `<details>`; nos carrosséis, `touch-action: pan-y` e captura de ponteiro só depois do limiar de arrasto (o clique simples precisa chegar aos slides).

Tudo respeita `prefers-reduced-motion` (sem GSAP, sem autoplay de vídeo/depoimentos, tudo visível) e o botão "Pausar animações", que **não pausa a timeline global** (esconderia conteúdo): completa a intro do hero, zera as durações dos tweens seguintes, pausa canvases, marquees, vídeos e o autoplay dos depoimentos.

## 6. Conteúdo e voz

Frases curtas e afirmativas, números antes dos adjetivos, caixa alta só em eyebrows, tags e botões. Botões dizem a ação na língua do cliente ("Quero um diagnóstico", "Quero um software assim", "Preciso disto", "Solicitar diagnóstico"). Jargão técnico sempre traduzido em consequência para o dono do negócio. Demonstrações são rotuladas como simulação. Nada de jargão de infoproduto, nada de promessa de número antes do diagnóstico.

## 7. Do / Don't

**Faça:** hairlines, três camadas de cinza frio, Archivo larga nos títulos, mono nos dados, prata como segundo neutro, um vermelho por bloco, muito ar, `tabular-nums`, traços no ângulo `--cut-angle`, `y`/`opacity` nas entradas.
**Não faça:** Inter/Space Grotesk, gradientes visíveis, ícones coloridos, vermelho em texto pequeno ou nas capas, borda vermelha em tudo, glows, pílulas, raios > 4px, itálico em display, emojis como marcadores, indicadores falsos, dependências além do GSAP.

## 8. Atribuição e licenças

- Fontes: Archivo, Barlow e Martian Mono via Google Fonts (SIL Open Font License).
- Ícones: Lucide (ISC), via `js/icons.js` gerado a partir de `lucide-static`.
- GSAP 3.15 (gsap, ScrollTrigger, Flip) via cdnjs, licença padrão "no charge" da GreenSock/Webflow.
- Componentes de animação recriados em CSS/JS puro a partir das ideias open-source da MagicUI (MIT): Marquee 3D, Bento (retirado na v2), Progressive Blur, Border Beam, Flickering Grid.
- Direção "Lâmina" definida em painel interno a partir do estudo do Uiverse Design; estrutura e copy da v2 definidas em painel (3 propostas, 2 juízes) após estudo do template Designa e dos projetos anteriores da equipe. Sistema original da OLIVEON, nenhum pacote de terceiros incorporado.
