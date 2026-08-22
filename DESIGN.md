# DESIGN.md — OLIVEON Performance · tema "Lâmina"

> Fonte da verdade visual do site. Leia este arquivo antes de criar ou alterar qualquer interface.
> Formato inspirado no padrão DESIGN.md (Google Stitch / Uiverse Design): um manual que humanos leem rápido e agentes de código consultam antes de escrever UI.

## 1. Produto e tom

OLIVEON Performance é uma agência de performance digital (tráfego pago, Google/Meta Ads, e-commerce, landing pages, estratégia). O site é institucional/comercial e tem um único trabalho: **gerar leads e reuniões**.

**Conceito — engenharia de precisão.** O logo já é uma peça usinada: letras largas e quadradas em cromo escovado, um "E" de três barras e um "O" cortado por uma lâmina vermelha ascendente. O site é o painel de instrumentos dessa máquina: tipografia expandida com a largura do wordmark, superfícies de grafite frio com hairlines de 1px como desenho técnico, leituras em monoespaçada larga como telemetria, e um único gesto vermelho — o corte diagonal — onde há ação ou resultado. O premium vem da precisão das linhas, do silêncio do espaço negativo e de um vermelho que aparece pouco e, por isso, pesa.

**Evitar:** neon, hexágonos, itálicos/oblíquos em display, gradientes visíveis, ícones coloridos, estética "infoproduto", retrô/lúdico, glows em cards, sombras difusas, pílulas e raios ≥ 8px, indicadores cenográficos ("LIVE", relógios, timestamps falsos).

## 2. Fundamentos

### Cor (tokens em `css/styles.css` → `:root`)

| Token | Valor | Papel |
|---|---|---|
| `--bg` | `#0a0b0d` | Canvas da página. Preto-carbono com viés frio de aço (a temperatura do cromo) |
| `--bg-alt` | `#0d0e11` | Seções alternadas |
| `--card` | `#121316` | Cards, painéis, formulário (camada 2); hover das células de serviço |
| `--elevated` | `#191b1f` | Hover de cards/banners/bento, menu mobile (camada 3) |
| `--edge` | `rgba(255,255,255,.06)` | Brilho de 1px no topo de superfícies elevadas (`box-shadow: inset 0 1px 0`) — luz batendo numa chapa |
| `--border` | `#24262b` | Hairline padrão: divisores, grids colapsados, contorno de cards |
| `--border-strong` | `#34373e` | Molduras externas, botão ghost, trilho do processo, hairline dos eyebrows |
| `--text` | `#f4f5f7` | Títulos, números, texto principal (18:1) |
| `--text-2` | `#b9bcc3` | Leads e prosa principal (~10:1) |
| `--muted` | `#9da1a8` | Descrições de card, rótulos, nav inativa (7.6:1) |
| `--steel` | `#c9ccd2` | Prata do cromo: traços, ticks ativos, afixos dos contadores, foco de teclado, anel da lâmina |
| `--steel-dim` | `#7e838c` | Sombra do cromo: linha de base dos campos, índices, ticks inativos, placeholders |
| `--red` | `#e60012` | **Único acento.** Botão primário, barra de 2px do card ativo, lâmina, uma palavra no h1, hairline dos contadores. 4.1:1 sobre `--bg` — display/UI sim, texto pequeno não |
| `--red-hover` / `--red-pressed` | `#cc0010` / `#b8000e` | Estados do botão primário: hover e pressed escurecem em degraus — nunca clarear (texto branco exige ≥ 4.5:1 em todos os estados; `#e60012` já está em 4.8:1) |
| `--red-text` | `#ff3b4a` | Acento legível em texto pequeno (≥ 4.5:1): iniciais de avatar (o índice do eyebrow fica em `--text`). Nunca como fundo |
| `--red-soft` / `--red-glow` | `rgba(230,0,18,.12 / .28)` | Fundo de avatar; único halo permitido (BorderBeam) |
| `--ok` | `#2fd27a` | Cor de sinal (variação positiva). Não é acento |
| `--cut-angle` | `37deg` | Ângulo da lâmina, medido no símbolo. Usado em todo traço inclinado |

**Orçamento de vermelho:** no máximo três ocorrências visíveis por viewport, nunca duas a menos de 200px. Na dúvida, remova a mais próxima do botão primário. Hover só acende um vermelho por vez (barra do card, tick do passo).

### Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Archivo** variável (eixo de largura `wdth` 100–125, pesos 500–700) | h1/h2 em `font-stretch: 125%` (a largura do wordmark), h3/botões/nav em 112%/100%, números grandes em 125%/700, números-fantasma do processo |
| Texto | **Barlow** (400/500/600) | Parágrafos, leads, descrições, legendas, links do rodapé. Sinalização rodoviária, superelipse quadrada: ecoa o logo em tamanho pequeno e cria o contraste de livery (nome largo, dados compactos) |
| Dados | **Martian Mono** variável (`wdth` 87.5–112.5, pesos 400–600) | Eyebrows e índices (01 / 09), tags, rótulos de formulário, afixos dos contadores, indicador do header, linha legal. Caixa alta sempre que ≤ 12px, tracking 0.12–0.14em; `wdth` 87.5 em tags de 11px, 112.5 nos afixos |

Escala (desktop): h1 `clamp(2.5rem, 5.5vw − 0.5rem, 3.6rem)` em > 960px (≤ 960px: `clamp(2.5rem, 5.6vw, 4.2rem)`) 600 · lh 0.98 · tracking −0.015em · caixa de frase (caps em 125% viraria wordmark) · coluna do hero ≈ 570px (grid 1.2fr/1fr) · 4 linhas no desktop, nunca palavra órfã · **uma palavra em `--red`** · h2 `clamp(1.9rem, 3.8vw, 2.9rem)` 600 · máx. 18ch · h3 `1.25rem` 600 em 112% · corpo Barlow `1.0625rem`/1.6 (`--text-2` em prosa principal, `--muted` em descrições) · lead do hero `1.2rem` · pequeno `0.8–0.92rem` · mono `0.66–0.75rem` caixa alta. Contadores Archivo 125%/700 `clamp(2.3rem, 4.4vw, 3.5rem)` com `tabular-nums`; afixos (R$, %, x, mi) em Martian Mono a 0.42em em `--steel`.

- Títulos com `text-wrap: balance`; prosa ≤ 52–56ch.
- Em ≤ 720px o h1 cai para `font-stretch: 112%` e o h2 para 118%.
- Fallbacks reais em todas as pilhas (`--display`, `--font`, `--mono`).

### Forma e linha

- Raios: `2px` em botões, campos, tags e menu; `4px` em cards, bento, formulário, grids. Zero pílulas (só o avatar é círculo).
- Hairline `1px --border` para estrutura; `--border-strong` para molduras; `2px --red` só para indicadores (barra do card ativo, linha de foco); `1.5px --steel` no anel da lâmina.
- Sem sombras difusas. Profundidade = `--edge` (1px de brilho no topo) + troca de camada no hover. Única exceção: o logo cromado em "Sobre".
- Grids colapsados: serviços é um painel de células com `gap: 1px` sobre `--border`; a moldura é `--border-strong`.
- Container `1140px`, padding lateral 24px. Seções com `128px` de respiro (88px no mobile).

### O motivo — a lâmina

O traço diagonal do símbolo, sempre no ângulo `--cut-angle`, só nestes lugares: (1) o anel gigante atrás do carrossel do hero (SVG inline: círculo `--steel` a 9% + traço `--red` a 50%); (2) o glifo `.slash` antes do eyebrow do hero; (3) os ticks do trilho do processo (`--steel-dim`, vermelho no hover); (4) os traços dos pilares do diferencial (`--steel`). O botão primário carrega a lâmina em miniatura: canto superior direito chanfrado em 9px (gradiente com canto transparente — não usar `clip-path`, que corta foco e sombra).

## 3. Layout

Página única, ordem fixa: header fixo (64px) → hero (texto à esquerda, carrossel 3D à direita; empilha no mobile) → 01 Serviços → 02 Como trabalhamos → 03 Entregáveis → 04 Diferencial → 05 Plataforma (bento) → 06 Resultados → 07 Cases → 08 Sobre → CTA final → 09 Contato → rodapé.

- O header mostra o indicador de instrumento da seção atual ("03 / 09 · Entregáveis") via IntersectionObserver; some em ≤ 1140px (logo 140 + indicador + nav só cabem a partir de 1141px).
- Grids: serviços 3 → 2 → 1 colunas; passos 5 → 2 → 1; bento 3 (cards "g" ocupam 2) → 1; números `auto-fit` ≥ 180px → 2 colunas no mobile; cases são linhas, não grid.
- Breakpoints: `1140px` (esconde o indicador de seção do header), `960px` (empilha colunas e ativa o menu hambúrguer — o nav desktop precisa de ~840px) e `720px` (grids de 1 coluna, banners em grade, h1 mais estreito).
- O hero fica sempre sobre `--bg` puro: a palavra vermelha do h1 só tem folga de contraste sobre o canvas base.
- Conteúdo variável (números, cases, cards do hero, bento, entregáveis, WhatsApp) vem de `js/dados.js`; nunca escrever esses dados no HTML. Só números reais do cliente — nada cenográfico.

## 4. Componentes

| Componente | Anatomia | Estados |
|---|---|---|
| `.btn-red` | fundo `--red` com canto superior direito chanfrado, texto branco, Archivo 112%/600 13px caixa alta, 48px de altura, raio 2px | hover `--red-hover`; active `--red-pressed`; focus-visible outline `--steel`. Sem lift, sem sombra |
| `.btn-ghost` | transparente, borda `--border-strong` | hover: borda `--steel` |
| `.card` (serviço) | célula do painel (fundo `--bg`), índice mono, h3, texto `--muted` | hover: fundo `--card` + barra de 2px `--red` que se desenha no topo |
| `.step` | trilho `--border-strong` com tick inclinado `--steel-dim`, número-fantasma Archivo 125%/700 a 40% (3.6:1), h3, texto | hover: tick vermelho, número a 100% |
| `.numero` | hairline vertical `--border-strong`, valor Archivo 125%/700 com afixos mono prata, legenda; hairline vermelha na base que preenche junto com o contador (1.6s) | — |
| `.case` | `<details>`: linha-ficha com índice mono, cliente Archivo 112%/600 + segmento mono, 3 KPIs Archivo 125%/700 tabulares, chevron; corpo com Objetivo/Estratégia | hover/aberto: fundo `--card`; chevron gira |
| `.mcard` (carrossel) | card `--card` com `--edge`, tag mono, valor Archivo 125%/700; depoimento com avatar de iniciais | carrossel pausa no hover; botão "Pausar animações" |
| `.bento-card` | visual decorativo (aria-hidden), ícone Lucide `--steel-dim`, h3, texto, CTA Archivo caps que surge no hover | hover: `--elevated`, barra vermelha no topo, ícone prata |
| `.banner` (entregáveis) | índice mono, título Archivo 112%, descrição, tag mono raio 2px | hover: `--elevated` |
| `.form` | card `--card` com `--edge`; campos-instrumento sem caixa: rótulo mono caixa alta, texto Barlow 16px, linha de base `--steel-dim` | focus: linha vermelha + outline `--steel` em `:focus-visible`; submit abre WhatsApp; BorderBeam vermelho + prata |
| `.header` | transparente; após rolar: `rgba(10,11,13,.78)` + blur 12px + hairline; logo 140px; indicador de seção mono; nav Archivo 100%/500 | fallback sólido sem `backdrop-filter` |
| `.border-beam` | feixe em `offset-path` pela borda | desliga em `prefers-reduced-motion` e no botão de pausa |

Ícones: **Lucide** (traço 1.5–2px, `currentColor`), sempre monocromáticos — prata, nunca coloridos.

## 5. Movimento

Movimento de instrumento — curto, decidido, sem mola. Uma única curva: `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`. Durações: `--dur-1` 180ms (hover/foco), `--dur-2` 320ms (estados), 0.7s para entradas (`@keyframes reveal-in`, 14px + fade; nunca declarar transform/transition em `.reveal`, senão os hovers morrem), 0.9s para hairlines que se desenham (`draw-line`), 1.6s para contadores e sua hairline, 24–32s por coluna do carrossel, 7–9s do BorderBeam. Grade piscante em prata com ~1% de células vermelhas. Tudo respeita `prefers-reduced-motion` e o botão "Pausar animações".

## 6. Conteúdo e voz

Frases curtas e afirmativas, caixa alta só em eyebrows, tags e botões. Botões dizem a ação ("Quero crescer", "Falar com a Oliveon", "Solicitar diagnóstico"). Números falam antes dos adjetivos. Nada de jargão de infoproduto.

## 7. Do / Don't

**Faça:** hairlines, três camadas de cinza frio, Archivo larga nos títulos, mono nos dados, prata como segundo neutro, um vermelho por bloco, muito ar, `tabular-nums`, traços no ângulo `--cut-angle`.
**Não faça:** Inter/Space Grotesk, gradientes visíveis, ícones coloridos, vermelho em texto pequeno, borda vermelha em tudo, glows, pílulas, raios > 4px, itálico em display, emojis como marcadores, indicadores falsos.

## 8. Atribuição e licenças

- Fontes: Archivo, Barlow e Martian Mono via Google Fonts (SIL Open Font License).
- Ícones: Lucide (ISC).
- Componentes de animação recriados em CSS/JS puro a partir das ideias open-source da MagicUI (MIT): Marquee 3D, Bento Grid, Progressive Blur, Border Beam, Flickering Grid.
- Direção "Lâmina" definida em painel interno (3 propostas, 2 juízes) a partir do estudo do Uiverse Design; sistema original da OLIVEON, nenhum pacote de terceiros incorporado.
