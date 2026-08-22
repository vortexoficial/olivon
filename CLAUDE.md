# Site OLIVEON Performance — instruções para o agente

- **Leia `DESIGN.md` antes de qualquer alteração de UI.** Ele é a fonte da verdade visual: tokens de cor, tipografia, espaçamento, anatomia e estados dos componentes, regras de movimento e a lista de Do/Don't.
- Construa toda UI nova com os tokens e classes de `css/styles.css`; não invente um estilo paralelo. Se um pedido conflitar com o `DESIGN.md`, explique o conflito e escolha a opção que mantém a interface mais consistente.
- Conteúdo variável (números, cases, cards do hero, bento, entregáveis, WhatsApp, e-mail, Instagram) vive em `js/dados.js`. Nunca escreva esses dados direto no HTML.
- Stack: HTML + CSS + JavaScript puros, sem frameworks nem build. Componentes de animação são recriações em vanilla (ver `js/main.js`). Não adicionar dependências sem necessidade clara.
- Publicação prevista: GitHub + Cloudflare Pages (site estático). O formulário abre o WhatsApp; não há backend.
- Validação rápida após mudanças: `node --check js/main.js js/dados.js` e abrir `index.html` no navegador.
