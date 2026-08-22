/* ============================================================
   OLIVEON PERFORMANCE — DADOS EDITÁVEIS
   ------------------------------------------------------------
   Este é o ÚNICO arquivo que o administrador precisa editar
   para atualizar números, cases e contatos do site.
   Salve o arquivo e publique — o site atualiza sozinho.
   ============================================================ */

window.OLIVEON = {

  /* WhatsApp com código do país + DDD, só números.
     Ex.: 5511999999999  (55 = Brasil, 11 = DDD) */
  whatsapp: "5500000000000",

  /* Mensagem inicial ao abrir o WhatsApp pelos botões do site */
  whatsappMensagem: "Olá! Vim pelo site da Oliveon e quero saber mais sobre como crescer com performance digital.",

  /* Redes e contato */
  instagram: "https://instagram.com/oliveonperformance",
  email: "contato@oliveonperformance.com.br",

  /* ---------------- CARDS DO CARROSSEL 3D DO HERO ----------------
     tipo "metrica":    tag, valor, label
     tipo "depoimento": nome, cargo, texto
     Adicione, remova ou edite à vontade (ideal: 8 a 12 cards). */
  heroCards: [
    { tipo: "metrica",    tag: "Google Ads",    valor: "+180%",      label: "em leads qualificados" },
    { tipo: "depoimento", nome: "Carlos Mendes", cargo: "CEO · Loja Exemplo", texto: "Em 3 meses dobramos o faturamento do e-commerce com a Oliveon." },
    { tipo: "metrica",    tag: "Meta Ads",      valor: "-42%",       label: "no custo por lead" },
    { tipo: "metrica",    tag: "E-commerce",    valor: "7.2x",       label: "de ROAS na operação" },
    { tipo: "depoimento", nome: "Ana Ribeiro",   cargo: "Diretora · Clínica Exemplo", texto: "Agenda cheia e custo por agendamento caindo mês a mês." },
    { tipo: "metrica",    tag: "Landing page",  valor: "3x",         label: "mais reuniões comerciais" },
    { tipo: "metrica",    tag: "Tráfego pago",  valor: "R$ 480 mil", label: "em receita atribuída" },
    { tipo: "depoimento", nome: "Rafael Souza",  cargo: "Sócio · Empresa Exemplo", texto: "Finalmente uma operação de mídia que fala a língua de resultado." },
    { tipo: "metrica",    tag: "Estratégia",    valor: "+240%",      label: "em oportunidades geradas" },
    { tipo: "metrica",    tag: "Otimização",    valor: "-28%",       label: "no custo por venda" }
  ],

  /* ---------------- BENTO GRID (PROVISÓRIO — conteúdo a definir) ----------------
     tamanho: "p" (1 coluna) ou "g" (2 colunas)
     icone:   chart | bell | layers | target | zap
     visual:  barras | lista | pills | numero   (fundo decorativo do card) */
  bentoCards: [
    { tamanho: "p", icone: "chart",  visual: "barras", titulo: "Dados que guiam decisões",    texto: "Dashboards e métricas em tempo real para cada campanha.",              link: "#contato", cta: "Saiba mais" },
    { tamanho: "g", icone: "bell",   visual: "lista",  titulo: "Leads chegando todos os dias", texto: "Operação de aquisição monitorada e otimizada continuamente.",         link: "#contato", cta: "Saiba mais" },
    { tamanho: "g", icone: "layers", visual: "pills",  titulo: "Integrado ao seu ecossistema", texto: "Google, Meta, CRM, e-commerce e analytics conectados em um só fluxo.", link: "#contato", cta: "Saiba mais" },
    { tamanho: "p", icone: "target", visual: "numero", titulo: "Foco em resultado",            texto: "Cada real investido com meta, métrica e responsável.",                link: "#contato", cta: "Saiba mais" }
  ],

  /* ---------------- ENTREGÁVEIS (PROVISÓRIO — lista de banners empilhados) ---------------- */
  entregaveis: [
    { titulo: "Auditoria de contas e tracking",     descricao: "Google Ads, Meta Ads, GA4 e Tag Manager revisados do zero.", tag: "Diagnóstico" },
    { titulo: "Planejamento de aquisição",          descricao: "Canais, público, oferta e metas definidos por etapa do funil.", tag: "Estratégia" },
    { titulo: "Estrutura de campanhas",             descricao: "Contas organizadas para escala, controle e leitura clara.",   tag: "Estratégia" },
    { titulo: "Pixel, conversões e eventos",        descricao: "Mensuração confiável antes de investir o primeiro real.",     tag: "Tecnologia" },
    { titulo: "Landing pages de conversão",         descricao: "Páginas rápidas, desenhadas para transformar clique em lead.", tag: "Conversão" },
    { titulo: "Criativos e copy para anúncios",     descricao: "Anúncios com mensagem, oferta e formato testados.",          tag: "Mídia" },
    { titulo: "Remarketing e funil completo",       descricao: "Recuperação de quem visitou, engajou ou abandonou o carrinho.", tag: "Mídia" },
    { titulo: "Testes A/B contínuos",               descricao: "Hipóteses, testes e aprendizados documentados toda semana.",  tag: "Otimização" },
    { titulo: "Dashboards em tempo real",           descricao: "Leads, custo, receita e ROAS em um painel só.",               tag: "Dados" },
    { titulo: "Relatórios semanais",                descricao: "Resumo do que aconteceu, por que e o que vem a seguir.",      tag: "Dados" },
    { titulo: "CRO — otimização de conversão",      descricao: "Melhoria contínua de páginas, formulários e ofertas.",       tag: "Conversão" },
    { titulo: "Integração com CRM e WhatsApp",      descricao: "Lead entra, é qualificado e chega quente no comercial.",      tag: "Tecnologia" },
    { titulo: "Gestão de orçamento e escala",       descricao: "Verba realocada para onde o retorno é maior.",                tag: "Otimização" },
    { titulo: "Reuniões de performance",            descricao: "Alinhamento mensal de resultados, metas e próximos passos.",  tag: "Gestão" }
  ],

  /* ---------------- NÚMEROS / RESULTADOS ----------------
     valor: apenas o número (sem pontos). prefixo/sufixo são texto livre. */
  numeros: [
    { valor: 5,   prefixo: "+R$ ", sufixo: " mi", legenda: "em investimento gerenciado" },
    { valor: 40,  prefixo: "+",    sufixo: " mil", legenda: "leads gerados" },
    { valor: 60,  prefixo: "+",    sufixo: "",     legenda: "clientes atendidos" },
    { valor: 300, prefixo: "+",    sufixo: "",     legenda: "campanhas realizadas" },
    { valor: 6,   prefixo: "",     sufixo: "x",    legenda: "ROAS médio das operações" }
  ],

  /* ---------------- CASES ----------------
     Duplique um bloco { ... } para adicionar um novo case. */
  cases: [
    {
      cliente: "Cliente Exemplo",
      segmento: "E-commerce · Moda",
      objetivo: "Escalar vendas com mídia paga",
      estrategia: "Google Ads + Meta Ads com funil completo e remarketing dinâmico",
      resultados: [
        { destaque: "+180%", texto: "em vendas online" },
        { destaque: "-35%",  texto: "no custo por aquisição" },
        { destaque: "7.2x",  texto: "de ROAS na operação" }
      ]
    },
    {
      cliente: "Cliente Exemplo 2",
      segmento: "Serviços · B2B",
      objetivo: "Gerar leads qualificados",
      estrategia: "Captação de demanda no Google Ads + landing page de conversão",
      resultados: [
        { destaque: "+240%", texto: "em leads qualificados" },
        { destaque: "-42%",  texto: "no custo por lead" },
        { destaque: "3x",    texto: "mais reuniões comerciais" }
      ]
    },
    {
      cliente: "Cliente Exemplo 3",
      segmento: "Saúde · Clínica",
      objetivo: "Aumentar agendamentos",
      estrategia: "Meta Ads local + página de agendamento otimizada",
      resultados: [
        { destaque: "+120%", texto: "em agendamentos" },
        { destaque: "-28%",  texto: "no custo por agendamento" },
        { destaque: "R$ 480 mil", texto: "em receita atribuída" }
      ]
    }
  ]
};
