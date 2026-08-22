/* ============================================================
   OLIVEON PERFORMANCE · DADOS EDITÁVEIS
   ------------------------------------------------------------
   Este é o ÚNICO arquivo que o administrador precisa editar
   para atualizar textos variáveis, números, portfólio, vídeos,
   equipe, depoimentos, FAQ e contatos do site.
   Salve o arquivo e publique, o site atualiza sozinho.

   Itens marcados como EXEMPLO são conteúdo provisório e devem
   ser substituídos por dados reais antes de ir ao ar.
   ============================================================ */

window.OLIVEON = {

  /* WhatsApp com código do país + DDD, só números.
     Ex.: 5511999999999  (55 = Brasil, 11 = DDD) */
  whatsapp: "5500000000000",

  /* Mensagem inicial ao abrir o WhatsApp pelos botões do site */
  whatsappMensagem: "Olá! Vim pelo site da Oliveon e quero um diagnóstico da minha operação.",

  /* Redes e contato */
  instagram: "https://instagram.com/oliveonperformance",
  email: "contato@oliveonperformance.com.br",

  /* ---------------- MOCKUP DA SEÇÃO AUTOMAÇÃO ----------------
     Coloque a imagem (PNG com fundo transparente funciona melhor)
     dentro da pasta assets/ e escreva o caminho aqui.
     Ex.: mockupAutomacao: "assets/mockup-conversa.png"

     Enquanto ficar vazio (""), a seção continua mostrando a
     simulação de conversa animada. Assim que você preencher,
     a imagem entra no lugar dela.

     Tamanho sugerido: 900px de largura ou mais, altura livre. */
  mockupAutomacao: "",

  /* Texto alternativo da imagem acima (acessibilidade e SEO) */
  mockupAutomacaoAlt: "Conversa automática da Oliveon atendendo um lead no WhatsApp",

  /* ---------------- FAIXA DE FOCO (efeito de lente) ----------------
     A frase é quebrada por espaço: cada palavra entra em foco por vez,
     as outras ficam desfocadas. Funciona melhor com 3 a 5 palavras
     curtas e fortes. Passar o mouse numa palavra prende o foco nela. */
  foco: {
    frase: "Atrair Converter Automatizar Escalar",
    apoio: "As quatro etapas da sua aquisição, operadas pela mesma equipe. Um único responsável pelo resultado, do primeiro anúncio ao pedido fechado.",
    cta: "Quero um diagnóstico gratuito",
    ctaMensagem: "Olá! Vim pelo site da Oliveon e quero entender como vocês montam o sistema de aquisição."
  },

  /* ---------------- STATS DO HERO (3 itens) ----------------
     EXEMPLO · troque pelos números reais da agência.
     valor: texto livre (ex.: "+8", "120", "24/7") */
  /* ---------------- VÍDEO DO TOPO (hero) ----------------
     Um arquivo por tema: o do tema claro precisa ter fundo claro, senão a borda
     desfocada não disfarça os cantos. Coloque em assets/ e escreva o caminho.
     Só o vídeo do tema em uso é baixado. Vazio nos dois = fica o marcador.
     poster: imagem parada que aparece antes de o vídeo carregar (opcional). */
  heroVideo: "",
  heroPoster: "",
  heroVideoClaro: "",
  heroPosterClaro: "",

  heroStats: [
    { valor: "+8",   label: "anos entregando sistemas de aquisição" },
    { valor: "+120", label: "projetos no ar" },
    { valor: "+40",  label: "automações em produção" }
  ],

  /* ---------------- LOGOS DE CLIENTES (seção "Alguns clientes") ----------------
     Coloque os arquivos em assets/clientes/ (PNG ou SVG com fundo transparente,
     de preferência em branco). Ex.:
       { nome: "Empresa X", logo: "assets/clientes/empresa-x.png", url: "https://..." }
     Enquanto a lista estiver vazia, o site mostra os SEGMENTOS abaixo. */
  clientes: [],

  /* Segmentos atendidos (aparecem na grade enquanto não há logos)
     icone: nome do ícone Lucide em js/icons.js · entrega: o que foi montado ali */
  segmentos: [
    { nome: "Delivery",        icone: "truck",           entrega: "Cardápio, pedido e painel do dono" },
    { nome: "E-commerce",      icone: "shopping-cart",   entrega: "Tráfego, checkout e recuperação" },
    { nome: "Clínicas",        icone: "stethoscope",     entrega: "Agenda cheia e confirmação automática" },
    { nome: "Imobiliárias",    icone: "building-2",      entrega: "Lead qualificado antes do corretor" },
    { nome: "Infoprodutos",    icone: "clapperboard",    entrega: "Criativo, página e esteira de venda" },
    { nome: "Indústria",       icone: "factory",         entrega: "Orçamento e follow-up sem planilha" },
    { nome: "Serviços B2B",    icone: "briefcase",       entrega: "Prospecção com registro no CRM" },
    { nome: "Negócios locais", icone: "store",           entrega: "Mapa, anúncio e atendimento no zap" },
    { nome: "Lançamentos",     icone: "rocket",          entrega: "Captação, aquecimento e carrinho" },
    { nome: "Educação",        icone: "graduation-cap",  entrega: "Matrícula com jornada acompanhada" }
  ],

  /* ---------------- DORES → RESPOSTA (abertura do posicionamento) ----------------
     resolveEm: âncora da seção que responde · rotulo: nome exibido no link */
  dores: [
    { titulo: "Verba rodando, lead caro",               texto: "O anúncio até converte, mas o custo sobe todo mês porque ninguém mexe na página, na oferta e no atendimento, só no lance.", resolveEm: "#servicos",  rotulo: "Tráfego + página" },
    { titulo: "Página que recebe clique e não conduz",  texto: "Bonita no print, lenta no celular, sem medição. O clique chega, o formulário não.",                                        resolveEm: "#servicos",  rotulo: "Sites e landing pages" },
    { titulo: "Venda travada em processo manual",       texto: "Lead cai na planilha, o pedido é digitado no braço e a resposta chega quando o cliente já comprou de outro.",                resolveEm: "#automacao", rotulo: "Automação" },
    { titulo: "Três fornecedores, nenhum responsável",  texto: "Quem faz o anúncio culpa a página; quem faz a página culpa o anúncio. A meta não é de ninguém.",                             resolveEm: "#equipe",    rotulo: "Equipe completa" }
  ],

  /* ---------------- COMPARATIVO (fecho da equipe) ----------------
     Valores que começam com "Sim" ganham o ícone de check; com "Não", o ícone de x. */
  comparativo: {
    colunas: ["Freelancer", "Agência fragmentada", "Oliveon"],
    linhas: [
      { pergunta: "Quem escreve o anúncio conhece a página?",          valores: ["Não", "Às vezes", "Sim, é a mesma mesa"] },
      { pergunta: "Quem faz o site conhece o funil?",                  valores: ["Não", "Raramente", "Sim, webdesigner e estrategista juntos"] },
      { pergunta: "Automação de WhatsApp e e-mail inclusa?",           valores: ["Não", "Terceirizada", "Sim, construída aqui"] },
      { pergunta: "Software quando a planilha não aguenta?",           valores: ["Não", "Não", "Sim, desenvolvedor fullstack no time"] },
      { pergunta: "Um responsável pela meta inteira?",                 valores: ["Não", "Não", "Sim"] },
      { pergunta: "Código, painel e contas ficam com você?",           valores: ["Às vezes", "Raramente", "Sim, sempre, com documentação"] },
      { pergunta: "Acompanhamento depois do lançamento?",              valores: ["Não", "Por hora", "Sim, semanal, com relatório"] }
    ]
  },
  equipeFecho: "Quando o criativo não converte, não é culpa da página. Quando a página não converte, não é culpa do anúncio. É o sistema que se ajusta, e tem alguém responsável por cada parte dele.",

  /* ---------------- SERVIÇOS (8) ----------------
     icone: nome de ícone Lucide (ver js/icons.js) · destaque: ocupa 2 células */
  servicos: [
    { icone: "megaphone",       titulo: "Tráfego pago",           texto: "Google e Meta Ads operados por quem responde pelo custo por venda, não pelo clique.", tags: ["Google Ads", "Meta Ads", "Remarketing"] },
    { icone: "workflow",        titulo: "Funis e automações",     texto: "Fluxos de WhatsApp, e-mail e CRM que atendem, qualificam e agendam sem depender de alguém online.", tags: ["WhatsApp", "E-mail", "CRM"] },
    { icone: "funnel",          titulo: "Captação de leads",      texto: "Oferta, formulário e página calibrados para transformar atenção em contato qualificado.", tags: ["Landing page", "Formulários", "Qualificação"] },
    { icone: "rocket",          titulo: "Lançamentos",            texto: "Estrutura completa: páginas, sequência de aquecimento, tráfego e automação de carrinho.", tags: ["Pré-lançamento", "Carrinho", "Recuperação"] },
    { icone: "layout-template", titulo: "Sites e landing pages",  texto: "Rápidos, acessíveis e medidos. Cada página nasce com tracking, SEO técnico e um único objetivo.", tags: ["Performance", "SEO", "Tracking"] },
    { icone: "shopping-cart",   titulo: "E-commerce e delivery",  texto: "Lojas, cardápios e checkouts com painel próprio, para vender sem depender de marketplace.", tags: ["Loja virtual", "Delivery", "Checkout"] },
    { icone: "clapperboard",    titulo: "Criativos",              texto: "Estáticos e vídeos para anúncio e redes, produzidos em volume e testados contra o dado.", tags: ["Estáticos", "Vídeo", "Testes A/B"] },
    { icone: "code-xml",        titulo: "Software sob medida",    texto: "Quando a ferramenta não existe, nós construímos: painéis administrativos, integrações, APIs e automações com IA, seus, documentados, em produção.", tags: ["Painéis", "APIs", "Integrações", "IA"], destaque: true, link: "#software" }
  ],

  /* ---------------- SOFTWARE SOB MEDIDA: módulos que se empilham ---------------- */
  modulosSoftware: [
    { icone: "sliders-horizontal", titulo: "Painel administrativo",       texto: "Edite produtos, páginas e conteúdo sem chamar ninguém." },
    { icone: "bot",                titulo: "Automação de WhatsApp com IA", texto: "Atendimento, qualificação e agendamento 24/7." },
    { icone: "git-branch",         titulo: "Integrações e APIs",           texto: "Checkout, CRM, ERP, logística e rastreio falando a mesma língua." },
    { icone: "chart-column",       titulo: "Dashboards",                   texto: "Leads, custo, receita e ROAS em um painel só." },
    { icone: "shield-check",       titulo: "Captação com LGPD",            texto: "Formulários, listas de espera, validação e anti-spam." },
    { icone: "server",             titulo: "Infraestrutura",               texto: "Deploy em nuvem, CI/CD, backups e monitoramento." }
  ],

  /* O que já saiu da bancada (lista de capacidades comprovadas, sem nome de cliente) */
  bancada: [
    "Automação de WhatsApp com IA em produção",
    "Delivery com painel e cardápio próprios",
    "Loja virtual com catálogo administrável e checkout integrado",
    "Painéis de upload e controle de demandas",
    "Aplicativo homologado para plataforma de e-commerce",
    "Sistema de rastreio com API, painel e site",
    "Sites multipágina com SEO e formulários conectados ao WhatsApp"
  ],

  /* ---------------- AUTOMAÇÃO EM AÇÃO: conversa simulada ----------------
     de: "lead" | "bot" | "sistema"   ·   etapa: 0 Atração · 1 Qualificação · 2 Registro · 3 Handoff */
  /* ---------------- MAPA DO FLUXO (seção Automação) ----------------
     As portas de entrada convergem no atendimento automático e saem para o CRM
     e para o comercial. icone: nome do ícone Lucide em js/icons.js.
     titulo: o que aparece ao parar o cursor sobre o nó. */
  fluxoAutomacao: {
    entrada: {
      rotulo: "Atração",
      nos: [
        { icone: "megaphone",       titulo: "Anúncio no Google e no Meta" },
        { icone: "whatsapp",        titulo: "Mensagem no WhatsApp" },
        { icone: "layout-template", titulo: "Formulário da landing page" }
      ]
    },
    centro: { rotulo: "Qualificação", icone: "bot", titulo: "Atendimento automático, 24 horas" },
    saidas: [
      { rotulo: "Registro", icone: "database",   titulo: "Lead registrado no CRM" },
      { rotulo: "Handoff",  icone: "user-round", titulo: "Resumo na mão do comercial" }
    ]
  },

  /* Selo que gira sobre o mockup da automação. Use um separador entre as palavras
     (o "·" fica bom) e termine com ele, para o texto fechar a volta sem emenda.
     Vazio = o selo não aparece. */
  seloGirando: "Atende · Qualifica · Registra · Avisa · ",

  /* Etapas em texto (usadas pela simulação de conversa da página completa) */
  etapasConversa: ["Atração", "Qualificação", "Registro", "Handoff"],
  conversa: [
    { de: "lead",    etapa: 0, texto: "Oi, vi o anúncio. Vocês atendem empresa?" },
    { de: "bot",     etapa: 1, texto: "Atendemos, sim. Para eu te direcionar certo: quantas pessoas usariam?" },
    { de: "lead",    etapa: 1, texto: "Umas 12." },
    { de: "bot",     etapa: 1, texto: "Perfeito. Vou te enviar a proposta do plano Empresa e já deixo uma conversa marcada com o consultor. Prefere amanhã de manhã ou à tarde?" },
    { de: "lead",    etapa: 1, texto: "De manhã." },
    { de: "bot",     etapa: 2, texto: "Fechado: 9h30, com o Rafael. Proposta chegando em seguida." },
    { de: "sistema", etapa: 2, texto: "Lead qualificado → CRM" },
    { de: "sistema", etapa: 3, texto: "Reunião agendada" },
    { de: "sistema", etapa: 3, texto: "Resumo enviado ao comercial" }
  ],

  /* ---------------- PROCESSO (5 etapas) ---------------- */
  processo: [
    { titulo: "Diagnóstico", texto: "Auditoria de contas, páginas, tracking e funil. Você recebe um mapa do que está vazando e do que dá para ganhar em 90 dias." },
    { titulo: "Arquitetura", texto: "Desenhamos o sistema: canais, oferta, páginas, automações e o software que falta. Com metas por etapa." },
    { titulo: "Construção",  texto: "Páginas, criativos, campanhas, fluxos e integrações entram em produção, por um time que senta na mesma mesa." },
    { titulo: "Operação",    texto: "Testes semanais, leitura de dados e relatório do que mudou. Verba vai para onde o retorno é maior." },
    { titulo: "Escala",      texto: "O que funciona recebe mais orçamento, mais criativos e mais automação. O que não funciona é desligado, rápido." }
  ],

  /* ---------------- ENTREGÁVEIS (lista rolável) ---------------- */
  entregaveis: [
    { titulo: "Auditoria de contas e tracking",   descricao: "Google Ads, Meta Ads, GA4 e Tag Manager revisados do zero.",              tag: "Estratégia" },
    { titulo: "Planejamento de aquisição",        descricao: "Canais, público, oferta e metas definidos por etapa do funil.",            tag: "Estratégia" },
    { titulo: "Desenho da oferta",                descricao: "O que vender, para quem, por quanto e com qual promessa.",                 tag: "Estratégia" },
    { titulo: "Estrutura de campanhas",           descricao: "Contas organizadas para escala, controle e leitura clara.",                tag: "Mídia" },
    { titulo: "Remarketing e funil completo",     descricao: "Recuperação de quem visitou, engajou ou abandonou o carrinho.",            tag: "Mídia" },
    { titulo: "Gestão de orçamento e escala",     descricao: "Verba realocada toda semana para onde o retorno é maior.",                 tag: "Mídia" },
    { titulo: "Criativos estáticos",              descricao: "Peças para anúncio e redes com mensagem, oferta e formato testados.",      tag: "Criação" },
    { titulo: "Vídeos para anúncio",              descricao: "Criativos 9:16 e 1:1 produzidos em volume para teste.",                    tag: "Criação" },
    { titulo: "Copy de anúncios e páginas",       descricao: "Texto que sustenta a oferta do título ao botão.",                          tag: "Criação" },
    { titulo: "Landing pages de conversão",       descricao: "Páginas rápidas, acessíveis, desenhadas para transformar clique em lead.", tag: "Web" },
    { titulo: "Site institucional",               descricao: "Estrutura, SEO técnico e formulários conectados ao WhatsApp.",             tag: "Web" },
    { titulo: "CRO, otimização de conversão",    descricao: "Melhoria contínua de páginas, formulários e ofertas.",                     tag: "Web" },
    { titulo: "Painel administrativo",            descricao: "Você edita produtos, conteúdo e páginas sem depender de ninguém.",         tag: "Software" },
    { titulo: "Automação de WhatsApp",            descricao: "Atendimento, qualificação e agendamento 24/7, com ou sem IA.",            tag: "Software" },
    { titulo: "Integrações e APIs",               descricao: "Checkout, CRM, ERP e logística conversando entre si.",                     tag: "Software" },
    { titulo: "Pixel, conversões e eventos",      descricao: "Mensuração confiável antes de investir o primeiro real.",                  tag: "Dados" },
    { titulo: "Dashboards em tempo real",         descricao: "Leads, custo, receita e ROAS em um painel só.",                            tag: "Dados" },
    { titulo: "Relatórios e reuniões",            descricao: "Resumo semanal do que aconteceu, por que e o que vem a seguir.",           tag: "Dados" }
  ],

  /* ---------------- PORTFÓLIO ----------------
     EXEMPLO · fichas por tipo de projeto, sem nome de cliente. Substitua pelos
     projetos da agência. tipo: "sites" | "ecommerce" | "software" | "criativos"
     capa (opcional): caminho de imagem em assets/portfolio/ (ex.: "assets/portfolio/projeto-1.webp").
     Sem capa, o site desenha uma capa técnica automaticamente. */
  portfolioFiltros: [
    { id: "todos",     rotulo: "Todos" },
    { id: "sites",     rotulo: "Sites & LPs" },
    { id: "ecommerce", rotulo: "E-commerce & delivery" },
    { id: "software",  rotulo: "Software & automação" },
    { id: "criativos", rotulo: "Criativos" }
  ],
  /* video: caminho do vídeo do projeto (mp4 em assets/). O card mostra o vídeo mudo
     em loop e, ao clicar, abre em tela cheia do início e com som.
     poster: imagem do primeiro quadro, opcional, deixa o card pintar antes de carregar.
     Enquanto video ficar vazio, o card mostra a capa desenhada em CSS. */
  portfolio: [
    { tipo: "ecommerce", video: "", poster: "", titulo: "Delivery com painel próprio",          descricao: "Cardápio, pedidos e galeria administráveis; publicação sem desenvolvedor.",        entregas: ["Site", "Painel admin", "API"] },
    { tipo: "software", video: "", poster: "",  titulo: "Automação de WhatsApp com IA",         descricao: "Atendimento e qualificação 24/7 com base de conhecimento e avaliação contínua.",  entregas: ["IA", "Base de conhecimento", "Docker"] },
    { tipo: "ecommerce", video: "", poster: "", titulo: "Loja virtual com checkout",            descricao: "Catálogo administrável, checkout integrado e publicação em dois domínios.",        entregas: ["Loja", "Checkout", "Painel"] },
    { tipo: "sites", video: "", poster: "",     titulo: "Landing page de lançamento",           descricao: "Página longa com comparativo, FAQ estruturado e lista de espera com LGPD.",        entregas: ["LP", "Lista de espera", "SEO"] },
    { tipo: "sites", video: "", poster: "",     titulo: "Site institucional multipágina",       descricao: "18 páginas de produto, SEO técnico e formulários conectados ao WhatsApp.",         entregas: ["18 páginas", "SEO", "WhatsApp"] },
    { tipo: "software", video: "", poster: "",  titulo: "Painel de controle de demandas",       descricao: "Upload de mídia, fila de tarefas e deploy automatizado.",                          entregas: ["Painel", "Upload", "CI/CD"] },
    { tipo: "criativos", video: "", poster: "", titulo: "Criativos em vídeo para anúncios",     descricao: "Peças 9:16 geradas e editadas em volume para teste contra o dado.",               entregas: ["Vídeo", "9:16", "Testes A/B"] },
    { tipo: "software", video: "", poster: "",  titulo: "Sistema de rastreio",                  descricao: "API, painel web e site público em monorepo com integração contínua.",             entregas: ["API", "Painel", "Monorepo"] },
    { tipo: "criativos", video: "", poster: "", titulo: "Identidade e criativos de campanha",   descricao: "Sistema visual, peças estáticas e variações para teste em Meta Ads.",             entregas: ["Identidade", "Estáticos", "Variações"] }
  ],

  /* ---------------- CARROSSEL DE VÍDEOS (formato 9:16) ----------------
     EXEMPLO · amostras provisórias em assets/videos/. Substitua pelos criativos da agência.
     src: mp4 leve (H.264, ~1 MB, sem áudio ou com áudio) · poster: imagem JPG do primeiro quadro */
  videos: [
    { src: "assets/videos/criativo-01.mp4", poster: "assets/videos/criativo-01.jpg", titulo: "Lançamento automotivo", tag: "Meta Ads · 9:16" },
    { src: "assets/videos/criativo-02.mp4", poster: "assets/videos/criativo-02.jpg", titulo: "Variação de cena",      tag: "Teste A/B" },
    { src: "assets/videos/criativo-03.mp4", poster: "assets/videos/criativo-03.jpg", titulo: "Academia, captação",   tag: "Reels · 9:16" },
    { src: "assets/videos/criativo-04.mp4", poster: "assets/videos/criativo-04.jpg", titulo: "Academia, prova",      tag: "Remarketing" }
  ],

  /* ---------------- EQUIPE (papéis, sem nomes) ---------------- */
  equipe: [
    { icone: "target",        papel: "Estrategista",            texto: "Desenha o sistema antes de gastar o primeiro real.",              responsavel: ["Diagnóstico", "Oferta", "Funil", "Metas"] },
    { icone: "gauge",         papel: "Gestor de tráfego",       texto: "Opera Google e Meta com a mão no orçamento e o olho no custo por venda.", responsavel: ["Google Ads", "Meta Ads", "Orçamento", "Testes"] },
    { icone: "pen-tool",      papel: "Designer",                texto: "Transforma oferta em peça que para o dedo.",                      responsavel: ["Identidade", "Criativos", "Vídeo"] },
    { icone: "monitor",       papel: "Webdesigner",             texto: "Constrói páginas que carregam rápido e convertem.",               responsavel: ["Landing pages", "Sites", "CRO"] },
    { icone: "braces",        papel: "Desenvolvedor fullstack", texto: "Faz a ferramenta que falta existir, e ficar de pé.",             responsavel: ["Painéis", "APIs", "Automações", "Integrações"] },
    { icone: "brain-circuit", papel: "IA aplicada",             texto: "Modelos de última geração em pesquisa, análise, criação e automação, com revisão humana em tudo que vai ao ar.", responsavel: ["Pesquisa", "Análise de dados", "Criativos", "Automações"], destaque: true }
  ],

  /* ---------------- NÚMEROS / RESULTADOS ----------------
     EXEMPLO · valor: apenas o número (sem pontos). prefixo/sufixo são texto livre. */
  numeros: [
    { valor: 5,   prefixo: "+R$ ", sufixo: " mi", legenda: "em investimento gerenciado" },
    { valor: 40,  prefixo: "+",    sufixo: " mil", legenda: "leads gerados" },
    { valor: 60,  prefixo: "+",    sufixo: "",     legenda: "operações atendidas" },
    { valor: 300, prefixo: "+",    sufixo: "",     legenda: "campanhas realizadas" },
    { valor: 6,   prefixo: "",     sufixo: "x",    legenda: "ROAS médio das operações" }
  ],

  /* ---------------- CASES ----------------
     EXEMPLO · duplique um bloco { ... } para adicionar um novo case. */
  cases: [
    {
      cliente: "Operação de e-commerce",
      segmento: "E-commerce · Moda",
      objetivo: "Escalar vendas com mídia paga sem depender de marketplace",
      estrategia: "Google Ads + Meta Ads com funil completo, remarketing dinâmico e loja com checkout próprio",
      resultados: [
        { destaque: "+180%", texto: "em vendas online" },
        { destaque: "-35%",  texto: "no custo por aquisição" },
        { destaque: "7.2x",  texto: "de ROAS na operação" }
      ]
    },
    {
      cliente: "Empresa de serviços B2B",
      segmento: "Serviços · B2B",
      objetivo: "Gerar leads qualificados e reduzir o tempo de resposta",
      estrategia: "Captação de demanda no Google Ads + landing page + automação de WhatsApp qualificando antes do comercial",
      resultados: [
        { destaque: "+240%", texto: "em leads qualificados" },
        { destaque: "-42%",  texto: "no custo por lead" },
        { destaque: "3x",    texto: "mais reuniões comerciais" }
      ]
    },
    {
      cliente: "Clínica",
      segmento: "Saúde · Clínica",
      objetivo: "Aumentar agendamentos fora do horário comercial",
      estrategia: "Meta Ads local + página de agendamento + automação de WhatsApp 24/7 integrada à agenda",
      resultados: [
        { destaque: "+120%", texto: "em agendamentos" },
        { destaque: "-28%",  texto: "no custo por agendamento" },
        { destaque: "R$ 480 mil", texto: "em receita atribuída" }
      ]
    }
  ],

  /* ---------------- DEPOIMENTOS ----------------
     EXEMPLO · substitua por depoimentos reais (nome, cargo/empresa, texto). */
  depoimentos: [
    { nome: "Carlos Mendes",  cargo: "CEO · E-commerce de moda",        texto: "Em três meses a loja passou a vender mais pelo site do que pelo marketplace. E o painel é nosso." },
    { nome: "Ana Ribeiro",    cargo: "Diretora · Clínica",              texto: "A automação atende de madrugada e a agenda chega cheia de manhã. Custo por agendamento caindo mês a mês." },
    { nome: "Rafael Souza",   cargo: "Sócio · Serviços B2B",            texto: "Finalmente uma operação que fala de custo por venda, não de alcance. O comercial recebe lead qualificado, não curioso." },
    { nome: "Juliana Prado",  cargo: "Fundadora · Infoproduto",         texto: "Lançamento inteiro, páginas, tráfego e carrinho, com uma equipe só. Sem empurrar responsabilidade entre fornecedores." },
    { nome: "Marcos Lima",    cargo: "Gerente · Delivery",              texto: "Cardápio, pedidos e anúncios no mesmo sistema. Mudança de preço entra no ar em um minuto, sem chamar ninguém." }
  ],

  /* ---------------- FAQ ---------------- */
  faq: [
    { p: "Vocês garantem resultado?",                 r: "Garantimos método, transparência e velocidade de correção. Volume de vendas depende de oferta, mercado e orçamento, e é exatamente isso que o diagnóstico mede antes de qualquer promessa." },
    { p: "Preciso contratar tudo?",                   r: "Não. Muitos clientes começam por tráfego ou por uma página. Mas é o sistema completo que faz o custo por venda cair de forma consistente." },
    { p: "Em quanto tempo vejo resultado?",           r: "Páginas e campanhas entram no ar em 2 a 4 semanas. As primeiras leituras confiáveis vêm com 30 dias de dado." },
    { p: "Já tenho site e agência. Dá para aproveitar?", r: "Sim. Auditamos o que existe, mantemos o que funciona e substituímos só o que está travando o resultado." },
    { p: "O software fica meu?",                      r: "Sim. Código, contas, domínios e dados são seus, com documentação e acesso, sem aluguel de ferramenta." },
    { p: "Qual o investimento mínimo?",               r: "Depende do sistema. O diagnóstico é gratuito e devolve uma proposta com faixas claras de investimento em mídia e em construção." }
  ],

  /* ---------------- CARDS DO CARROSSEL 3D DO HERO ----------------
     EXEMPLO · tipo "metrica": tag, valor, label · tipo "depoimento": nome, cargo, texto
     Ideal: 8 a 12 cards. */
  heroCards: [
    { tipo: "metrica",    tag: "Google Ads",     valor: "+180%",      label: "em leads qualificados" },
    { tipo: "depoimento", nome: "Carlos Mendes",  cargo: "CEO · E-commerce", texto: "Em 3 meses a loja passou a vender mais pelo site do que pelo marketplace." },
    { tipo: "metrica",    tag: "Automação",      valor: "24/7",       label: "atendimento sem fila" },
    { tipo: "metrica",    tag: "E-commerce",     valor: "7.2x",       label: "de ROAS na operação" },
    { tipo: "depoimento", nome: "Ana Ribeiro",    cargo: "Diretora · Clínica", texto: "Agenda cheia de manhã e custo por agendamento caindo mês a mês." },
    { tipo: "metrica",    tag: "Landing page",   valor: "3x",         label: "mais reuniões comerciais" },
    { tipo: "metrica",    tag: "Software",       valor: "100%",       label: "do código é seu" },
    { tipo: "depoimento", nome: "Rafael Souza",   cargo: "Sócio · B2B", texto: "Lead qualificado chega no comercial, não curioso." },
    { tipo: "metrica",    tag: "Lançamento",     valor: "+240%",      label: "em oportunidades geradas" },
    { tipo: "metrica",    tag: "Meta Ads",       valor: "-42%",       label: "no custo por lead" }
  ]
};
