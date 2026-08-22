# Site OLIVEON Performance

Página única, estática (HTML + CSS + JS puros, sem build), com animações GSAP via CDN. Tema "Lâmina" documentado em `DESIGN.md`.

## Estrutura

```
index.html          página (hero, faixa de confiança, 14 seções indexadas, CTA, rodapé)
css/styles.css      estilos (tokens em :root; regras em DESIGN.md)
js/dados.js         TODO o conteúdo editável pelo administrador
js/icons.js         ícones Lucide (gerado; não editar à mão)
js/main.js          comportamento (renderização a partir de dados.js, carrosséis, GSAP)
assets/             logos, favicon, vídeos de amostra (assets/videos/)
DESIGN.md           design system, fonte da verdade visual
CLAUDE.md           instruções para agentes de código
```

## Como editar o conteúdo

Abra `js/dados.js`. Cada bloco tem um comentário explicando os campos:

| Bloco | O que controla |
|---|---|
| `whatsapp`, `whatsappMensagem`, `email`, `instagram` | contatos (WhatsApp só números, com 55 + DDD) |
| `heroStats` | os 3 números do hero |
| `clientes` | logos da faixa de confiança (`assets/clientes/…`); vazio → mostra `segmentos` |
| `dores` | os 4 cards "dor → resposta" do posicionamento |
| `servicos` | 8 células de serviço (`destaque: true` ocupa 2 colunas) |
| `modulosSoftware`, `bancada` | seção Software sob medida |
| `conversa`, `etapasConversa` | a conversa simulada da seção Automação |
| `processo`, `entregaveis` | método em 5 etapas e lista rolável |
| `portfolioFiltros`, `portfolio` | fichas do portfólio (tipo: sites / ecommerce / software / criativos; `capa` opcional) |
| `videos` | carrossel de vídeos 9:16 (`src` mp4 leve + `poster` jpg) |
| `equipe`, `equipeFecho`, `comparativo` | papéis da equipe, frase de fecho e tabela comparativa |
| `numeros`, `cases`, `depoimentos`, `faq`, `heroCards` | resultados, cases, depoimentos, FAQ e cards do carrossel 3D |

Itens marcados **EXEMPLO** são provisórios: troque por dados reais antes de publicar.

### Vídeos
Converta para H.264 leve antes de colocar em `assets/videos/` (ex.: `ffmpeg -i origem.mp4 -t 8 -an -vf "scale=540:-2,fps=24" -c:v libx264 -crf 30 -movflags +faststart criativo-05.mp4`) e gere o poster (`ffmpeg -ss 1 -i criativo-05.mp4 -frames:v 1 criativo-05.jpg`).

### Logos de clientes
PNG ou SVG com fundo transparente em `assets/clientes/`. O site aplica silhueta branca automaticamente; prefira versões monocromáticas.

## Publicação

1. Commit e push para `main` em `github.com/vortexoficial/olivon`.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → escolher o repositório; build command em branco; output directory `/`.
3. Cada push publica automaticamente.

## Validação rápida

```
node --check js/main.js js/dados.js js/icons.js
```
Abra `index.html` no navegador e confira o console (sem erros) e a largura (sem rolagem horizontal) em 1440 / 1024 / 390 px.
