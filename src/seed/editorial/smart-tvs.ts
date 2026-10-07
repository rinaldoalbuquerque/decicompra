import { block, heading, lexicalDoc, paragraph } from '../lexical'
import type { EditorialPack, Source } from './types'

// Smart TVs (Fase 4). Pesquisa estruturada feita em 10/2026: fichas técnicas, comparadores e testes
// publicados. Revisão humana obrigatória antes de publicar (spec §9.1).

const SRC = {
  c5Oficial: { title: 'LG Brasil: Smart TV LG OLED evo AI C5 55" (página oficial)', url: 'https://www.lg.com/br/tvs-e-soundbars/oled-evo/oled55c5psa/' },
  qn85fOficial: {
    title: 'Samsung Brasil: Vision AI TV 55" Neo QLED 4K QN85F (página oficial)',
    url: 'https://www.samsung.com/br/tvs/qled-tv/q85f-55-inch-neo-qled-4k-mini-led-smart-tv-qn55qn85fagxzd/',
  },
  c6kOficial: { title: 'TCL Brasil: TV C6K QD-Mini LED (página oficial)', url: 'https://www.tcl.com/br/pt/tvs/c6k' },
  c5Ficha: { title: 'Oficina da Net: ficha técnica da LG OLED C5 55"', url: 'https://www.oficinadanet.com.br/smarttvs/comparacao-lg-oled-c5-55' },
  qn85fFicha: { title: 'Buscapé: ficha e preços da Samsung Neo QLED 55" QN85F', url: 'https://www.buscape.com.br/tv/smart-tv-neo-qled-55-samsung-4k-55qn85fagxzd' },
  c6kOferta: {
    title: 'Tecnoblog: TCL C6K de 55" com Mini LED (especificações e preço)',
    url: 'https://tecnoblog.net/achados/tv-tcl-c6k-com-mini-led-de-55-tem-melhor-preco-em-meses-em-oferta-na-amazon/',
  },
  c6kGuia: { title: 'Game Over Drive: TCL C8K, C7L ou C6K? A melhor TV para cada bolso em 2026', url: 'https://gameoverdrive.com.br/melhor-tv-tcl-2026/' },
  u8100fFicha: {
    title: 'Samsung Brasil: Smart TV 55" Crystal UHD 4K U8100F (ficha oficial)',
    url: 'https://www.samsung.com/br/tvs/uhd-4k-tv/u8000f-55-inch-crystal-uhd-4k-smart-tv-un55u8100fgxzd/',
  },
  garantia: {
    title: 'Promotop: garantia de fábrica de TVs no Brasil (Samsung, LG e TCL: 12 meses)',
    url: 'https://promotop.net/blog/garantia-estendida-para-tv-vale-a-pena-entenda-quando-contratar-e-quando-evitar/',
  },
  techtudo: {
    title: 'TechTudo: melhor TV 55 polegadas em 2026',
    url: 'https://www.techtudo.com.br/listas/2026/07/melhor-tv-55-polegadas-em-2026-modelos-com-otimo-custo-beneficio-edqualcomprarie.ghtml',
  },
  buscapeRanking: { title: 'Buscapé: qual é a melhor TV 55 polegadas (ranking 2026)', url: 'https://www.buscape.com.br/tv/conteudo/qual-a-melhor-tv-55-polegadas' },
} satisfies Record<string, Source>

const C5 = 'lg-oled-evo-c5'
const QN85F = 'samsung-neo-qled-qn85f'
const C6K = 'tcl-qd-mini-led-c6k'
const U8100F = 'samsung-crystal-uhd-u8100f'

export const smartTvs: EditorialPack = {
  subcategorySlug: 'smart-tvs',
  criteriaKeys: ['imagem', 'recursos_smart', 'som', 'confiabilidade_suporte', 'custo_beneficio'],
  specTemplate: [
    { key: 'painel', label: 'Painel', type: 'option', options: ['OLED', 'QLED', 'LED'], required: true, comparable: true, highlight: true, group: 'Imagem' },
    {
      key: 'retroiluminacao',
      label: 'Iluminação',
      type: 'option',
      options: ['Autoemissiva (OLED)', 'Mini LED', 'LED direto'],
      direction: 'neutral',
      comparable: true,
      group: 'Imagem',
    },
    { key: 'taxa_atualizacao', label: 'Taxa de atualização máxima', type: 'number', unit: 'Hz', direction: 'higher', comparable: true, highlight: true, group: 'Imagem' },
    { key: 'hdr', label: 'Formatos HDR', type: 'text', comparable: true, group: 'Imagem' },
    { key: 'dolby_vision', label: 'Dolby Vision', type: 'boolean', direction: 'higher', comparable: true, group: 'Imagem' },
    { key: 'sistema', label: 'Sistema', type: 'text', comparable: true, group: 'Smart' },
    { key: 'hdmi_21', label: 'Portas HDMI 2.1', type: 'number', direction: 'higher', comparable: true, group: 'Conexões' },
    { key: 'audio_potencia', label: 'Potência de áudio', type: 'number', unit: 'W', direction: 'higher', comparable: true, group: 'Som' },
    { key: 'garantia', label: 'Garantia', type: 'number', unit: 'meses', direction: 'higher', comparable: true, group: 'Suporte' },
    { key: 'tamanho', label: 'Tamanho', type: 'number', unit: '"', perVariant: true, required: true, comparable: true, group: 'Geral' },
    { key: 'consumo', label: 'Consumo', type: 'number', unit: 'W', direction: 'lower', perVariant: true, comparable: true, group: 'Geral' },
  ],
  brands: [
    { slug: 'lg', name: 'LG', officialSite: 'https://www.lg.com/br' },
    { slug: 'samsung', name: 'Samsung', officialSite: 'https://www.samsung.com/br' },
    { slug: 'tcl', name: 'TCL', officialSite: 'https://www.tcl.com/br' },
  ],
  products: [
    {
      slug: C5,
      name: 'LG OLED evo C5',
      brandSlug: 'lg',
      specs: {
        painel: 'OLED',
        retroiluminacao: 'Autoemissiva (OLED)',
        taxa_atualizacao: '144',
        hdr: 'Dolby Vision, HDR10, HLG',
        dolby_vision: 'sim',
        sistema: 'webOS 25',
        hdmi_21: '4',
        audio_potencia: '40',
        garantia: '12',
      },
      variants: [
        { label: '55"', modelCode: 'OLED55C5PSA', isReference: true, specs: { tamanho: '55' } },
        { label: '65"', modelCode: 'OLED65C5PSA', specs: { tamanho: '65' } },
      ],
      scores: {
        imagem: {
          score: 9.5,
          justification: 'Painel OLED com pixels que acendem sozinhos: preto perfeito, contraste infinito e ótimos ângulos de visão. Suporta Dolby Vision, HDR10 e HLG.',
        },
        recursos_smart: {
          score: 9,
          justification: 'webOS 25 rápido e completo, controle Magic Remote, 4 portas HDMI 2.1 e até 144 Hz com VRR: excelente para consoles e PC.',
        },
        som: { score: 7.5, justification: 'Sistema 2.2 de 40 W com Dolby Atmos, acima da média das TVs, mas uma soundbar ainda faz diferença para filmes.' },
        confiabilidade_suporte: {
          score: 8.5,
          justification: 'Linha C da LG é madura, com boa assistência no Brasil. Garantia de fábrica de 12 meses, como a da maioria das TVs.',
        },
        custo_beneficio: {
          score: 7,
          justification: 'Custa mais que as Mini LED desta lista. Vale para quem prioriza a melhor imagem, especialmente em sala escura.',
        },
      },
      verdict: 'A melhor imagem da lista: OLED com preto perfeito, 4 portas HDMI 2.1 e até 144 Hz, ideal para filmes em sala escura e para games.',
      pros: ['Preto perfeito e contraste infinito (OLED)', 'Dolby Vision e Dolby Atmos', '4 portas HDMI 2.1 e até 144 Hz para games', 'webOS rápido e completo'],
      cons: ['Preço mais alto que as Mini LED', 'Brilho menor que o das Mini LED em salas muito claras'],
      recommendedFor: 'Quem quer a melhor imagem para filmes e séries, assiste com a luz baixa e joga em console de última geração.',
      avoidIf: 'A TV fica numa sala muito clara, com sol direto na tela, ou o orçamento é apertado.',
      review: lexicalDoc([
        heading('h2', 'Imagem'),
        paragraph(
          'No OLED cada pixel acende e apaga sozinho, sem luz de fundo. O resultado é preto absoluto, contraste infinito e cores que não desbotam vistas de lado. A C5 suporta Dolby Vision, HDR10 e HLG.',
        ),
        heading('h2', 'Games e conexões'),
        paragraph(
          'São 4 portas HDMI 2.1, 120 Hz nativos e até 144 Hz com taxa variável (VRR). Para PlayStation 5, Xbox Series X ou PC, é uma das TVs mais completas do mercado.',
        ),
        heading('h2', 'Sistema e som'),
        paragraph('O webOS 25 é rápido e tem os principais aplicativos. O som 2.2 de 40 W com Dolby Atmos é bom para uma TV, mas uma soundbar melhora bastante os filmes.'),
        heading('h2', 'Vale a pena?'),
        paragraph(
          'Se a prioridade é imagem e a sala não é muito clara, sim: é a melhor TV desta lista. Em ambientes muito iluminados, uma Mini LED com mais brilho pode ser mais confortável.',
        ),
      ]),
      faq: [
        { question: 'OLED queima a tela?', answer: 'O risco existe com imagens fixas por muitas horas, mas é baixo no uso normal. A TV tem recursos automáticos para evitar marcas.' },
        { question: 'Quais tamanhos existem?', answer: '42, 48, 55, 65, 77 e 83 polegadas. Nesta análise usamos a de 55" como referência.' },
      ],
      sources: [SRC.c5Oficial, SRC.c5Ficha, SRC.techtudo, SRC.garantia],
    },
    {
      slug: QN85F,
      name: 'Samsung Neo QLED QN85F',
      brandSlug: 'samsung',
      specs: {
        painel: 'QLED',
        retroiluminacao: 'Mini LED',
        taxa_atualizacao: '144',
        hdr: 'HDR10+, HDR10, HLG',
        dolby_vision: 'não',
        sistema: 'Tizen',
        audio_potencia: '40',
        garantia: '12',
      },
      variants: [
        { label: '55"', modelCode: 'QN55QN85FAGXZD', isReference: true, specs: { tamanho: '55' } },
        { label: '65"', modelCode: 'QN65QN85FAGXZD', specs: { tamanho: '65' } },
      ],
      scores: {
        imagem: {
          score: 8.5,
          justification: 'Mini LED com pontos quânticos: brilho alto para salas claras e bom controle de contraste. Não suporta Dolby Vision (usa HDR10+).',
        },
        recursos_smart: {
          score: 8.5,
          justification: 'Tizen completo, Gaming Hub com jogos na nuvem, SmartThings, AirPlay e 4 entradas HDMI, com 120 Hz nativos e até 144 Hz.',
        },
        som: { score: 7.5, justification: '40 W de potência e recursos de som da Samsung; bom para o dia a dia, com espaço para uma soundbar.' },
        confiabilidade_suporte: { score: 8.5, justification: 'Samsung tem a maior rede de assistência do país. Garantia de fábrica de 12 meses.' },
        custo_beneficio: {
          score: 7.5,
          justification: 'Mais barata que a OLED C5 e mais cara que a TCL C6K. Faz sentido para quem quer Mini LED com a marca e o ecossistema Samsung.',
        },
      },
      verdict: 'Mini LED de brilho alto para salas claras, com o ecossistema Samsung e até 144 Hz; só não tem Dolby Vision.',
      pros: ['Brilho alto, boa para salas iluminadas', 'Até 144 Hz e Gaming Hub', 'Tizen completo, com AirPlay e SmartThings', 'Ampla assistência técnica'],
      cons: ['Sem Dolby Vision', 'Custa mais que a TCL C6K, que tem recursos parecidos'],
      recommendedFor: 'Quem tem sala clara, já usa aparelhos Samsung e quer uma Mini LED de marca consolidada.',
      avoidIf: 'Você assiste muito conteúdo em Dolby Vision ou quer a melhor imagem possível em sala escura.',
      review: lexicalDoc([
        heading('h2', 'Imagem'),
        paragraph(
          'A QN85F usa Mini LED: milhares de LEDs pequenos atrás da tela, controlados por zonas. Isso dá brilho alto, ótimo para salas claras, com bom contraste. Em HDR, ela trabalha com HDR10+, sem Dolby Vision.',
        ),
        heading('h2', 'Games e recursos'),
        paragraph(
          'São 120 Hz nativos e até 144 Hz, com VRR, além do Gaming Hub para jogar na nuvem sem console. O Tizen tem todos os aplicativos populares, AirPlay e integração com a casa conectada pelo SmartThings.',
        ),
        heading('h2', 'Vale a pena?'),
        paragraph(
          'Para salas claras e quem gosta do ecossistema Samsung, sim. Se o foco é preço, a TCL C6K entrega uma Mini LED parecida por menos. Se o foco é imagem em sala escura, a OLED C5 é superior.',
        ),
      ]),
      faq: [{ question: 'Neo QLED é a mesma coisa que Mini LED?', answer: 'Sim. Neo QLED é o nome comercial da Samsung para TVs QLED com iluminação Mini LED.' }],
      sources: [SRC.qn85fOficial, SRC.qn85fFicha, SRC.buscapeRanking, SRC.garantia],
    },
    {
      slug: C6K,
      name: 'TCL QD-Mini LED C6K',
      brandSlug: 'tcl',
      specs: {
        painel: 'QLED',
        retroiluminacao: 'Mini LED',
        taxa_atualizacao: '144',
        hdr: 'Dolby Vision, HDR10+, HDR10, HLG',
        dolby_vision: 'sim',
        sistema: 'Google TV',
        hdmi_21: '1',
        garantia: '12',
      },
      variants: [
        { label: '55"', modelCode: '55C6K', isReference: true, specs: { tamanho: '55' } },
        { label: '65"', modelCode: '65C6K', specs: { tamanho: '65' } },
      ],
      scores: {
        imagem: {
          score: 8,
          justification: 'QD-Mini LED com até cerca de 1.300 nits, Dolby Vision e HDR10+. Pretos profundos para a faixa de preço, segundo medições publicadas.',
        },
        recursos_smart: {
          score: 8.5,
          justification: 'Google TV com Assistente, 144 Hz nativos, VRR, ALLM e FreeSync Premium. Atraso de 13,6 ms no modo jogo em teste publicado.',
        },
        som: { score: 8, justification: 'Áudio Onkyo 2.1 com subwoofer integrado, Dolby Atmos e DTS Virtual:X: graves acima do comum em TVs dessa faixa.' },
        confiabilidade_suporte: {
          score: 7,
          justification: 'Garantia de 12 meses. Só uma das portas HDMI é 2.1, o que limita quem tem mais de um console de última geração.',
        },
        custo_beneficio: {
          score: 9.5,
          justification: 'Mini LED com 144 Hz, Dolby Vision e som com subwoofer pelo preço de TVs LED intermediárias. O melhor custo-benefício da lista.',
        },
      },
      verdict: 'O melhor custo-benefício: Mini LED com Dolby Vision, 144 Hz nativos e som Onkyo com subwoofer por preço de TV intermediária.',
      pros: ['Mini LED com Dolby Vision e HDR10+', '144 Hz nativos e baixo atraso para games', 'Som Onkyo 2.1 com subwoofer', 'Google TV com Assistente'],
      cons: ['Apenas uma porta HDMI 2.1', 'Pós-venda menos conhecido que o de LG e Samsung'],
      recommendedFor: 'Quem quer imagem de TV premium gastando bem menos e joga em um console de última geração.',
      avoidIf: 'Você vai ligar dois consoles de nova geração ou um PC em 144 Hz ao mesmo tempo.',
      review: lexicalDoc([
        heading('h2', 'Imagem'),
        paragraph(
          'A C6K combina pontos quânticos e iluminação Mini LED, recursos que até pouco tempo eram de TVs bem mais caras. O brilho passa de 1.300 nits nas versões maiores e ela aceita Dolby Vision e HDR10+.',
        ),
        heading('h2', 'Games'),
        paragraph(
          'Os 144 Hz são nativos, com VRR, ALLM e FreeSync Premium, e testes publicados mediram 13,6 ms de atraso no modo jogo. O ponto fraco é ter só uma porta HDMI 2.1.',
        ),
        heading('h2', 'Som e sistema'),
        paragraph('O som Onkyo 2.1 tem subwoofer integrado e Dolby Atmos, com graves melhores que a média. O Google TV traz os principais aplicativos e o Assistente.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para a maioria das pessoas, sim: é a TV que entrega mais por real investido nesta lista.'),
      ]),
      faq: [{ question: 'O que é QD-Mini LED?', answer: 'É a combinação de pontos quânticos (QD), que melhoram as cores, com iluminação Mini LED, que melhora brilho e contraste.' }],
      sources: [SRC.c6kOficial, SRC.c6kOferta, SRC.c6kGuia, SRC.techtudo, SRC.garantia],
    },
    {
      slug: U8100F,
      name: 'Samsung Crystal UHD U8100F',
      brandSlug: 'samsung',
      specs: {
        painel: 'LED',
        retroiluminacao: 'LED direto',
        taxa_atualizacao: '60',
        hdr: 'HDR10+, HDR10, HLG',
        dolby_vision: 'não',
        sistema: 'Tizen',
        audio_potencia: '20',
        garantia: '12',
      },
      variants: [
        { label: '55"', modelCode: 'UN55U8100FGXZD', isReference: true, specs: { tamanho: '55' } },
        { label: '65"', modelCode: 'UN65U8100FGXZD', specs: { tamanho: '65' } },
      ],
      scores: {
        imagem: { score: 6.5, justification: 'LED 4K com HDR10+, correto para o dia a dia, mas com contraste e brilho bem abaixo das Mini LED e da OLED. 60 Hz.' },
        recursos_smart: { score: 8, justification: 'Mesmo Tizen das Samsung mais caras, com Gaming Hub, ALLM e assistentes de voz. Três entradas HDMI.' },
        som: { score: 6, justification: '2.0 canais e 20 W: suficiente para TV aberta e séries, fraco para filmes de ação.' },
        confiabilidade_suporte: { score: 8, justification: 'Linha de entrada simples e madura da Samsung, com a maior rede de assistência do país. Garantia de 12 meses.' },
        custo_beneficio: { score: 8, justification: 'A mais barata da lista para uma tela grande 4K de marca conhecida, com um sistema smart completo.' },
      },
      verdict: 'A opção de entrada: tela 4K grande com o sistema completo da Samsung por pouco, mas com imagem e som apenas corretos.',
      pros: ['Preço baixo para uma tela grande 4K', 'Tizen completo com os principais aplicativos', 'Ampla assistência técnica'],
      cons: ['60 Hz: não aproveita os 120 Hz dos consoles atuais', 'Contraste e brilho limitados', 'Som simples, de 20 W'],
      recommendedFor: 'Quem quer uma TV grande para streaming, TV aberta e futebol, gastando pouco.',
      avoidIf: 'Você joga em console de última geração ou quer HDR de verdade em filmes.',
      review: lexicalDoc([
        heading('h2', 'Imagem'),
        paragraph(
          'A U8100F é uma TV LED 4K com HDR10+. Para streaming, TV aberta e esportes, a imagem é correta, mas falta brilho e contraste para o HDR brilhar como nas Mini LED e na OLED.',
        ),
        heading('h2', 'Recursos'),
        paragraph('O sistema é o mesmo Tizen das Samsung mais caras, com todos os aplicativos populares e assistentes de voz. A taxa é de 60 Hz, sem os 120 Hz dos consoles atuais.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Se o orçamento é curto e o uso é streaming e TV, sim. Se der para esticar, a TCL C6K é um salto grande de qualidade.'),
      ]),
      faq: [{ question: 'Serve para PlayStation 5?', answer: 'Funciona, mas em 60 Hz. Para aproveitar 120 Hz, escolha um modelo com HDMI 2.1, como a TCL C6K.' }],
      sources: [SRC.u8100fFicha, SRC.garantia],
    },
  ],
  contents: [
    {
      type: 'melhores',
      slug: 'melhores-smart-tvs',
      title: 'As melhores smart TVs para comprar',
      summary:
        'A LG OLED C5 tem a melhor imagem; a TCL C6K é o melhor custo-benefício; a Samsung QN85F é a Mini LED para salas claras; e a Samsung U8100F é a opção de entrada.',
      metaDescription: 'As melhores smart TVs do Brasil comparadas por imagem, recursos, som, suporte e preço: OLED, Mini LED e LED, com notas por critério.',
      modelsAnalyzed: 4,
      picks: [
        { productSlug: C5, profileLabel: 'Melhor imagem', position: 1, why: 'OLED com preto perfeito, Dolby Vision e 4 portas HDMI 2.1. A melhor para filmes e games.' },
        { productSlug: C6K, profileLabel: 'Melhor custo-benefício', position: 2, why: 'Mini LED com Dolby Vision, 144 Hz e som com subwoofer por preço de TV intermediária.' },
        { productSlug: QN85F, profileLabel: 'Para salas claras', position: 3, why: 'Mini LED de brilho alto, com o ecossistema e a assistência da Samsung.' },
        { productSlug: U8100F, profileLabel: 'Mais barata', position: 4, why: 'Tela 4K grande com sistema completo por pouco, para streaming e TV aberta.' },
      ],
      body: lexicalDoc([
        heading('h2', 'Como escolher'),
        paragraph(
          'Comece pelo tamanho, de acordo com a distância do sofá, e depois pela tecnologia: OLED para a melhor imagem em sala escura, Mini LED para salas claras e bom preço, LED para gastar pouco.',
        ),
        paragraph('Se você joga em console de última geração, procure 120 Hz ou mais e HDMI 2.1. Veja todos os detalhes no nosso guia de compra.'),
      ]),
      sources: [SRC.techtudo, SRC.buscapeRanking, SRC.c5Ficha, SRC.c6kGuia],
    },
    {
      type: 'comparativo',
      title: 'TCL C6K ou Samsung QN85F: qual TV Mini LED comprar?',
      summary:
        'A TCL C6K entrega Dolby Vision, som com subwoofer e 144 Hz por menos; a Samsung QN85F tem mais portas e o ecossistema Samsung. Para a maioria, a C6K é a escolha.',
      metaDescription: 'TCL C6K ou Samsung QN85F? Comparamos imagem, HDR, games, som, sistema e preço das duas TVs Mini LED para você decidir.',
      comparedProductSlugs: [C6K, QN85F],
      badges: [
        { productSlug: C6K, label: 'Vencedora geral' },
        { productSlug: QN85F, label: 'Mais completa em conexões' },
      ],
      chooseIf: [
        { productSlug: C6K, text: 'quer o melhor preço, Dolby Vision e som mais encorpado' },
        { productSlug: QN85F, text: 'liga vários aparelhos na TV e já usa o ecossistema Samsung' },
      ],
      conclusion:
        'A TCL C6K vence pelo conjunto: Dolby Vision, som com subwoofer e 144 Hz por um preço menor. A Samsung QN85F faz sentido para quem precisa de mais entradas e valoriza a marca e a assistência.',
      body: lexicalDoc([
        heading('h2', 'Imagem e HDR'),
        paragraph(
          'As duas são Mini LED com pontos quânticos e brilho alto. A C6K aceita Dolby Vision e HDR10+; a QN85F só HDR10+, o que pesa para quem assiste muito streaming com Dolby Vision.',
        ),
        heading('h2', 'Games'),
        paragraph('As duas chegam a 144 Hz com VRR. A C6K tem só uma porta HDMI 2.1; a QN85F tem 4 entradas HDMI e o Gaming Hub para jogos na nuvem.'),
        heading('h2', 'Som e sistema'),
        paragraph('A C6K traz som Onkyo 2.1 com subwoofer; a QN85F, 40 W. O Google TV da TCL e o Tizen da Samsung são completos.'),
      ]),
      sources: [SRC.c6kOferta, SRC.c6kGuia, SRC.qn85fFicha],
    },
    {
      type: 'guia',
      slug: 'como-escolher-smart-tv',
      title: 'Como escolher uma smart TV',
      summary:
        'Escolha o tamanho pela distância do sofá, a tecnologia pela iluminação da sala (OLED, Mini LED ou LED) e confira taxa de atualização, HDMI 2.1, formatos HDR e sistema.',
      metaDescription: 'Guia para escolher smart TV: tamanho ideal pela distância, OLED, Mini LED ou LED, 120 Hz e HDMI 2.1 para games, HDR, sistema e som.',
      body: lexicalDoc([
        heading('h2', 'Tamanho: meça a distância do sofá'),
        paragraph(
          'Para TVs 4K, uma regra prática é multiplicar a distância (em metros) por 25 para ter a polegada máxima confortável. A 2 metros, uma TV de 50 a 55 polegadas fica ótima; a 2,5 metros, de 55 a 65.',
        ),
        block({ blockType: 'tip', kind: 'dica', text: 'Na dúvida entre dois tamanhos, quase todo mundo se arrepende de ter comprado a menor, não a maior.' }),
        heading('h2', 'OLED, Mini LED ou LED?'),
        paragraph(
          'OLED tem o melhor contraste e preto perfeito, ideal para sala escura. Mini LED tem mais brilho e custa menos, boa para salas claras. LED comum é a mais barata, com contraste e brilho mais limitados.',
        ),
        heading('h2', 'Games: 120 Hz e HDMI 2.1'),
        paragraph(
          'Para PlayStation 5, Xbox Series X ou PC, procure 120 Hz ou mais, VRR e portas HDMI 2.1. Confira quantas portas são 2.1: alguns modelos têm só uma.',
        ),
        heading('h2', 'HDR e sistema'),
        paragraph(
          'Os principais formatos de HDR são Dolby Vision (muito usado em streaming) e HDR10+. Quanto ao sistema, webOS (LG), Tizen (Samsung) e Google TV (TCL e outras) têm os aplicativos populares.',
        ),
        heading('h2', 'Som'),
        paragraph('TVs finas têm pouco espaço para alto-falantes. Se você gosta de filmes, reserve parte do orçamento para uma soundbar.'),
        heading('h2', 'Comparação rápida dos modelos que analisamos'),
        block({ blockType: 'comparisonTable', productSlugs: [C5, QN85F, C6K, U8100F], attributes: [] }),
        block({
          blockType: 'faq',
          items: [
            { question: 'Vale a pena TV 8K?', answer: 'Ainda não: quase não há conteúdo em 8K, e uma boa TV 4K entrega imagem melhor pelo mesmo preço.' },
            { question: 'Garantia estendida vale a pena?', answer: 'Depende do preço e da cobertura. A garantia de fábrica costuma ser de 12 meses; leia o que a estendida cobre antes de contratar.' },
          ],
        }),
      ]),
      sources: [SRC.techtudo, SRC.c5Ficha, SRC.c6kGuia, SRC.garantia],
    },
    {
      type: 'entenda',
      slug: 'oled-qled-mini-led-diferencas',
      title: 'OLED, QLED e Mini LED: qual a diferença?',
      summary:
        'No OLED cada pixel gera a própria luz (preto perfeito). QLED e Mini LED usam luz de fundo; o Mini LED tem milhares de LEDs pequenos que melhoram brilho e contraste.',
      metaDescription: 'Entenda a diferença entre TVs OLED, QLED e Mini LED: como cada tecnologia funciona, vantagens, desvantagens e qual combina com a sua sala.',
      body: lexicalDoc([
        heading('h2', 'A diferença em uma frase'),
        block({
          blockType: 'sideBySide',
          leftTitle: 'OLED',
          leftText: 'Cada pixel acende e apaga sozinho, sem luz de fundo: preto perfeito e contraste infinito, com brilho menor.',
          rightTitle: 'QLED / Mini LED',
          rightText: 'Painel LCD com pontos quânticos e luz de fundo. No Mini LED, a luz vem de milhares de LEDs minúsculos: muito brilho.',
        }),
        heading('h2', 'E o QLED comum?'),
        paragraph(
          'QLED é um painel LCD com uma camada de pontos quânticos que deixa as cores mais vivas. Quando a iluminação é Mini LED, a TV controla o brilho por zonas e chega mais perto do contraste do OLED.',
        ),
        heading('h2', 'Qual combina com a sua sala?'),
        paragraph(
          'Sala escura e foco em filmes: OLED. Sala clara, com janela ou luz acesa: Mini LED. Orçamento curto para streaming e TV aberta: LED comum resolve.',
        ),
      ]),
      sources: [SRC.techtudo, SRC.c5Ficha, SRC.c6kGuia],
    },
  ],
}
