# Site OLIVEON Performance, instruções para o agente

- **Leia `DESIGN.md` antes de qualquer alteração de UI.** Ele é a fonte da verdade visual: tokens de cor, tipografia, espaçamento, anatomia e estados dos componentes, regras de movimento e a lista de Do/Don't.
- Construa toda UI nova com os tokens e classes de `css/styles.css`; não invente um estilo paralelo. Se um pedido conflitar com o `DESIGN.md`, explique o conflito e escolha a opção que mantém a interface mais consistente.
- Conteúdo variável (textos das seções dinâmicas, números, cases, portfólio, vídeos, equipe, depoimentos, FAQ, WhatsApp, e-mail, Instagram) vive em `js/dados.js`. Nunca escreva esses dados direto no HTML. Itens marcados **EXEMPLO** são provisórios e devem ser trocados por dados reais antes de ir ao ar.
- Ícones: Lucide via `js/icons.js` (gerado a partir do lucide-static). No HTML use `<i data-icon="nome"></i>`; no JS, `OLIVEON_ICON("nome")`. Sempre monocromáticos.
- Stack: HTML + CSS + JavaScript puros, sem build. **GSAP 3.15 (gsap, ScrollTrigger, Flip) entra via CDN** como única dependência, por decisão explícita do cliente, e o site precisa continuar inteiro se o CDN falhar (o reveal por IntersectionObserver é o fallback). Não adicionar outras dependências sem necessidade clara.
- Movimento: tudo respeita `prefers-reduced-motion` e o botão "Pausar animações" (`motionOff` em `js/main.js`). Nunca animar `x` em elementos que encostam na borda do container (estende a largura da página); preferir `y`/`opacity`.
- Publicação: GitHub (`vortexoficial/olivon`, branch `main`) + Cloudflare Pages (build vazio, output `/`). O formulário abre o WhatsApp; não há backend.
- Validação após mudanças: `node --check js/main.js js/dados.js js/icons.js`, abrir `index.html` no navegador e, se houver Playwright disponível, rodar os scripts de captura (screenshots em 1440/1024/390 + detector de overflow horizontal).
