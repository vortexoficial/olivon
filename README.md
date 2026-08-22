# Site OLIVEON Performance

Site estático — HTML + CSS + JavaScript puros, sem dependências nem build. É só abrir o `index.html` ou publicar a pasta inteira.

## Como editar o conteúdo (administrador)

**Tudo que muda com frequência está em um único arquivo: [`js/dados.js`](js/dados.js)**

- **WhatsApp:** campo `whatsapp` (código do país + DDD + número, só dígitos). ⚠️ Está com placeholder `5500000000000` — trocar antes de publicar!
- **Números/resultados:** lista `numeros` — valor, prefixo, sufixo e legenda.
- **Cases:** lista `cases` — duplique um bloco `{ ... }` para adicionar um novo case.
- **E-mail e Instagram:** campos `email` e `instagram`.
- **Cards do carrossel 3D do hero:** lista `heroCards` (tipo `metrica` ou `depoimento`).
- **Bento grid (provisório):** lista `bentoCards` — tamanho `p`/`g`, ícone e visual de fundo.
- **Lista de entregáveis (provisório):** lista `entregaveis` — banners empilhados com desfoque progressivo.

Textos das seções (hero, serviços, sobre etc.) ficam direto no `index.html`.

**Sistema de design:** as regras visuais (cores, tipografia, componentes, o que fazer e o que evitar) estão em [`DESIGN.md`](DESIGN.md). O `CLAUDE.md` manda o agente ler esse arquivo antes de mexer em qualquer UI — assim toda tela nova nasce consistente.
Cores e fontes ficam nas variáveis no topo do `css/styles.css`. Tema atual: **"Lâmina"** — Archivo (títulos, expandida), Barlow (texto) e Martian Mono (dados), todas do Google Fonts.

## Estrutura

```
site-oliveon/
├── index.html        ← página única com todas as seções
├── css/styles.css    ← estilos (paleta nas variáveis :root)
├── js/dados.js       ← DADOS EDITÁVEIS (números, cases, WhatsApp)
├── js/main.js        ← animações e interações
└── assets/           ← logos otimizados para web
```

## Como publicar (GitHub + Cloudflare Pages)

1. Criar repositório no GitHub e subir esta pasta.
2. No painel do Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecionar o repositório; build command em branco; output directory `/`.
4. Cada `git push` republica o site automaticamente.
5. (Opcional) Conectar domínio próprio em **Custom domains**.

## Observações

- O formulário de contato monta a mensagem e abre no WhatsApp (não precisa de servidor). Se quiser receber por e-mail também, dá para integrar Web3Forms/Formspree depois.
- Animações respeitam `prefers-reduced-motion` (acessibilidade).
