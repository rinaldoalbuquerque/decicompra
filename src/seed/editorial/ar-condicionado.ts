import { block, heading, lexicalDoc, paragraph } from '../lexical'
import type { EditorialPack, Source } from './types'

// Ar-condicionado (Fase 4). Pesquisa estruturada feita em 10/2026: fichas dos fabricantes e de lojas,
// comparadores e conteúdo técnico sobre IDRS/Procel. Revisão humana obrigatória antes de publicar.

const SRC = {
  lgAnalise: { title: 'Buscapé: ar-condicionado LG Dual Inverter Compact +AI é bom?', url: 'https://www.buscape.com.br/ar-condicionado/conteudo/ar-condicionado-lg-dual-inverter-compact-analise' },
  lgLoja: {
    title: 'Fast Shop: LG Dual Inverter Compact +AI 12.000 BTUs S3-Q12JAQAL',
    url: 'https://site.fastshop.com.br/ar-condicionado-lg-dual-inverter-compact--ai-12-000-btus-frio-220v-s3-q12jaqal-83184/p',
  },
  samsungFicha: {
    title: 'Buscapé: Samsung WindFree Connect 12.000 BTUs AR12BVFAAWKNAZ',
    url: 'https://www.buscape.com.br/ar-condicionado/ar-condicionado-split-hi-wall-samsung-wind-free-connect-12000-btus-frio-inverter-ar12bvfaawknaz-ar12bvfaawkxaz',
  },
  mideaFicha: { title: 'Midea: ar-condicionado Split 12.000 BTU Inverter AI XtremeSave (ficha oficial)', url: 'https://www.midea.com.br/ar-condicionado-split-12000-btu-inverter-ai-xtremesave-frio-midea/p' },
  mideaLinha: { title: 'Buscapé: melhor ar-condicionado Springer Midea', url: 'https://www.buscape.com.br/ar-condicionado/conteudo/melhor-ar-condicionado-springer' },
  elginFicha: {
    title: 'Buscapé: Elgin Eco Inverter II 12.000 BTUs (45HJFI12C2WB)',
    url: 'https://www.buscape.com.br/ar-condicionado/ar-condicionado-split-hi-wall-elgin-12000-btus-frio-inverter-45hjfi12c2wb-45hjfe12c2cb',
  },
  elginLoja: { title: 'Fast Shop: Elgin Eco Inverter II Wi-Fi 12.000 BTUs', url: 'https://site.fastshop.com.br/ar-condicionado-inverter-elgin-hw-eco-ii-wi-fi-12000-r-btu-frio-220v-147121/p' },
  idrs: { title: 'Daikin: IDRS, o que é e para que serve', url: 'https://www.daikin.com.br/blog/2025/07/21/idrs-o-que-e-para-que-serve/' },
  ranking12k: { title: 'Buscapé: ar-condicionado 12.000 BTUs, as melhores opções', url: 'https://www.buscape.com.br/ar-condicionado/conteudo/melhor-ar-condicionado-12000-btus' },
  rankingSplit: { title: 'Zoom: qual o melhor ar-condicionado split em 2026', url: 'https://www.zoom.com.br/ar-condicionado/deumzoom/ar-condicionado-split' },
} satisfies Record<string, Source>

const LG = 'lg-dual-inverter-compact-ai-12000'
const SAMSUNG = 'samsung-windfree-connect-12000'
const MIDEA = 'midea-ai-xtremesave-12000'
const ELGIN = 'elgin-eco-inverter-ii-12000'

export const arCondicionado: EditorialPack = {
  subcategorySlug: 'ar-condicionado',
  criteriaKeys: ['eficiencia_energetica', 'desempenho_ruido', 'recursos', 'confiabilidade_suporte_instalacao', 'custo_beneficio'],
  specTemplate: [
    { key: 'capacidade_btu', label: 'Capacidade', type: 'number', unit: 'BTU/h', direction: 'neutral', required: true, comparable: true, highlight: true, group: 'Capacidade' },
    { key: 'ciclo', label: 'Ciclo', type: 'option', options: ['Só frio', 'Quente e frio'], required: true, comparable: true, group: 'Capacidade' },
    { key: 'classe_energetica', label: 'Classe de eficiência (Inmetro)', type: 'option', options: ['A', 'B', 'C', 'D', 'E'], required: true, comparable: true, highlight: true, group: 'Eficiência' },
    { key: 'idrs', label: 'IDRS', type: 'number', unit: 'Wh/Wh', direction: 'higher', comparable: true, group: 'Eficiência' },
    { key: 'consumo_anual', label: 'Consumo anual', type: 'number', unit: 'kWh', direction: 'lower', comparable: true, highlight: true, group: 'Eficiência' },
    { key: 'gas', label: 'Gás refrigerante', type: 'option', options: ['R-32', 'R-410A'], comparable: true, group: 'Eficiência' },
    { key: 'ruido_interno', label: 'Ruído mínimo da unidade interna', type: 'number', unit: 'dB', direction: 'lower', comparable: true, group: 'Desempenho' },
    { key: 'wifi', label: 'Wi-Fi (controle pelo celular)', type: 'boolean', direction: 'higher', comparable: true, group: 'Recursos' },
    { key: 'tensao', label: 'Tensão', type: 'text', comparable: true, group: 'Instalação' },
    { key: 'garantia_compressor', label: 'Garantia do compressor', type: 'number', unit: 'anos', direction: 'higher', comparable: true, group: 'Suporte' },
  ],
  brands: [
    { slug: 'lg', name: 'LG', officialSite: 'https://www.lg.com/br' },
    { slug: 'samsung', name: 'Samsung', officialSite: 'https://www.samsung.com/br' },
    { slug: 'midea', name: 'Midea', officialSite: 'https://www.midea.com.br' },
    { slug: 'elgin', name: 'Elgin', officialSite: 'https://www.elgin.com.br' },
  ],
  products: [
    {
      slug: LG,
      name: 'LG Dual Inverter Compact +AI 12.000 BTUs',
      brandSlug: 'lg',
      specs: { capacidade_btu: '12000', ciclo: 'Só frio', classe_energetica: 'A', gas: 'R-32', ruido_interno: '19', tensao: '220 V' },
      variants: [{ label: '12.000 BTUs, só frio, 220 V', voltage: '220v', modelCode: 'S3-Q12JAQAL', isReference: true, specs: {} }],
      scores: {
        eficiencia_energetica: { score: 9, justification: 'Classe A do Inmetro com Selo Procel e gás R-32, mais eficiente e de menor impacto ambiental. A LG anuncia até 70% de economia sobre aparelhos convencionais.' },
        desempenho_ruido: { score: 9, justification: 'Compressor Dual Inverter, que resfria até 40% mais rápido segundo a LG, e ruído mínimo anunciado de 19 dB na unidade interna.' },
        recursos: { score: 8, justification: 'Inteligência artificial que ajusta temperatura, direção e velocidade do vento conforme o uso, filtro antibacteriano e modo sono.' },
        confiabilidade_suporte_instalacao: { score: 8.5, justification: 'Linha Dual Inverter consolidada, com ampla rede de assistência e instaladores credenciados LG no país.' },
        custo_beneficio: { score: 8.5, justification: 'Recursos de linha intermediária-alta (IA, R-32, baixo ruído) por preço competitivo entre os inverter de 12.000 BTUs.' },
      },
      verdict: 'O melhor no geral: inverter silencioso com inteligência artificial, gás R-32 e classe A, por preço competitivo para 12.000 BTUs.',
      pros: ['Muito silencioso: a partir de 19 dB, segundo a LG', 'Inteligência artificial que ajusta o conforto', 'Gás R-32, eficiente e de menor impacto', 'Classe A com Selo Procel', 'Resfriamento rápido do compressor Dual Inverter'],
      cons: ['Só frio, sem função aquecimento', 'Conexão Wi-Fi varia conforme a versão: confira antes de comprar'],
      recommendedFor: 'Quartos e salas de até cerca de 20 m², para quem quer silêncio para dormir e economia na conta de luz.',
      avoidIf: 'Você precisa de aquecimento no inverno: escolha um modelo quente e frio.',
      review: lexicalDoc([
        heading('h2', 'Eficiência'),
        paragraph(
          'É classe A do Inmetro, com Selo Procel, e usa gás R-32, mais eficiente e com menor impacto ambiental que o R-410A. O compressor Dual Inverter ajusta a velocidade em vez de ligar e desligar, o que reduz o consumo.',
        ),
        heading('h2', 'Conforto e ruído'),
        paragraph('A LG anuncia ruído a partir de 19 dB na unidade interna, adequado para quartos. A inteligência artificial aprende o uso e ajusta temperatura, direção e velocidade do vento.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para quartos e salas pequenas, sim: é o mais equilibrado desta lista entre silêncio, economia e preço.'),
      ]),
      faq: [
        { question: 'Para qual tamanho de ambiente?', answer: 'Cerca de 20 m², em condições normais. Ambientes com muito sol ou muitas pessoas pedem mais BTUs.' },
        { question: 'Ele tem Wi-Fi?', answer: 'As fontes divergem conforme a versão. Confira na ficha da loja se o modelo tem conexão com o app LG ThinQ.' },
      ],
      sources: [SRC.lgAnalise, SRC.lgLoja, SRC.ranking12k],
    },
    {
      slug: MIDEA,
      name: 'Midea AI XtremeSave 12.000 BTUs',
      brandSlug: 'midea',
      specs: { capacidade_btu: '12000', ciclo: 'Só frio', classe_energetica: 'A', idrs: '7.6', consumo_anual: '382.7', wifi: 'sim', tensao: '220 V' },
      variants: [{ label: '12.000 BTUs, só frio, 220 V', voltage: '220v', isReference: true, specs: {} }],
      scores: {
        eficiencia_energetica: { score: 9, justification: 'IDRS de 7,6 Wh/Wh e consumo de 382,7 kWh por ano, os melhores números declarados entre os modelos desta lista.' },
        desempenho_ruido: { score: 7.5, justification: 'Vazão de 538 m³/h e funções Turbo e Follow-me. O fabricante não informa o ruído em dB na ficha.' },
        recursos: { score: 8.5, justification: 'Wi-Fi com o app MSmartLife, comandos por Alexa e Google Assistente, inteligência artificial e filtro contra bactérias, vírus e odores.' },
        confiabilidade_suporte_instalacao: { score: 8, justification: 'Fabricação nacional e ampla rede de assistência Springer Midea.' },
        custo_beneficio: { score: 9, justification: 'Wi-Fi, IA e a melhor eficiência declarada da lista por preço intermediário.' },
      },
      verdict: 'O mais econômico e bem equipado pelo preço: IDRS de 7,6, Wi-Fi com Alexa e Google e inteligência artificial em um inverter de 12.000 BTUs.',
      pros: ['Melhor eficiência declarada da lista (IDRS 7,6)', 'Consumo de 382,7 kWh por ano', 'Wi-Fi e controle por voz', 'Filtro contra vírus, bactérias e odores'],
      cons: ['Ruído em dB não informado pelo fabricante', 'Mais pesado e maior que a média'],
      recommendedFor: 'Quem usa o ar-condicionado muitas horas por dia e quer economizar na conta de luz, com controle pelo celular.',
      avoidIf: 'O silêncio para dormir é a sua prioridade número 1: prefira um modelo com ruído baixo informado.',
      review: lexicalDoc([
        heading('h2', 'Eficiência'),
        paragraph(
          'Pela ficha oficial, o IDRS é de 7,6 Wh/Wh, bem acima do mínimo de 5,5 exigido para a classe A, e o consumo é de 382,7 kWh por ano. É o mais econômico desta lista nos números declarados.',
        ),
        heading('h2', 'Recursos'),
        paragraph('Tem Wi-Fi com o app MSmartLife, comando por Alexa e Google Assistente, inteligência artificial e funções Turbo, sono e Follow-me, que usa a temperatura medida no controle remoto.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para quem usa muitas horas por dia, sim: a economia na conta se soma aos recursos de controle e ao preço intermediário.'),
      ]),
      faq: [{ question: 'O que é IDRS?', answer: 'É o índice de eficiência sazonal: quanto maior, menos energia o aparelho gasta para resfriar ao longo do ano.' }],
      sources: [SRC.mideaFicha, SRC.mideaLinha, SRC.idrs],
    },
    {
      slug: SAMSUNG,
      name: 'Samsung WindFree Connect 12.000 BTUs',
      brandSlug: 'samsung',
      specs: { capacidade_btu: '12000', ciclo: 'Só frio', classe_energetica: 'A', gas: 'R-410A', ruido_interno: '13', wifi: 'sim', tensao: '220 V' },
      variants: [{ label: '12.000 BTUs, só frio, 220 V', voltage: '220v', modelCode: 'AR12BVFAAWKNAZ', isReference: true, specs: {} }],
      scores: {
        eficiencia_energetica: { score: 8, justification: 'Classe A com Selo Procel e compressor inverter, mas usa o gás R-410A, menos eficiente e de maior impacto que o R-32.' },
        desempenho_ruido: { score: 9.5, justification: 'Modo WindFree espalha o ar por microfuros, sem vento direto no corpo, com ruído de 13 a 32 dB nesse modo, segundo a ficha.' },
        recursos: { score: 9.5, justification: 'WindFree, Wi-Fi com SmartThings, comando de voz, dois filtros antibacterianos e autolimpeza.' },
        confiabilidade_suporte_instalacao: { score: 8.5, justification: 'Maior rede de assistência do país e instaladores credenciados Samsung.' },
        custo_beneficio: { score: 7, justification: 'Mais caro que os concorrentes. O preço se paga para quem se incomoda com o vento direto do ar-condicionado.' },
      },
      verdict: 'O mais confortável: resfria sem vento direto no corpo com o modo WindFree, silencioso e cheio de recursos, por um preço mais alto.',
      pros: ['Modo WindFree, sem vento direto', 'Muito silencioso no modo WindFree', 'Wi-Fi com SmartThings e comando de voz', 'Autolimpeza e dois filtros antibacterianos'],
      cons: ['Preço mais alto', 'Gás R-410A, menos eficiente que o R-32'],
      recommendedFor: 'Quem sente desconforto com o vento do ar-condicionado, como crianças, idosos e quem tem rinite, e quer o máximo de recursos.',
      avoidIf: 'O foco é gastar menos na compra e na conta de luz.',
      review: lexicalDoc([
        heading('h2', 'O modo WindFree'),
        paragraph(
          'Depois de atingir a temperatura, o aparelho passa a soltar o ar por milhares de microfuros, sem jato de vento no corpo. Nesse modo, a ficha indica ruído de 13 a 32 dB; em operação normal, 40 dB.',
        ),
        heading('h2', 'Recursos'),
        paragraph('Tem Wi-Fi com o app SmartThings, comando de voz, dois filtros antibacterianos e função de autolimpeza, que ajuda a evitar mofo e mau cheiro.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para quem se incomoda com o vento direto, sim: o conforto é o diferencial. Em eficiência e preço, os modelos com gás R-32 levam vantagem.'),
      ]),
      faq: [{ question: 'WindFree gela o ambiente?', answer: 'Sim. Ele resfria normalmente e, ao atingir a temperatura, troca o jato de ar pela saída suave por microfuros para manter o ambiente.' }],
      sources: [SRC.samsungFicha, SRC.rankingSplit],
    },
    {
      slug: ELGIN,
      name: 'Elgin Eco Inverter II 12.000 BTUs',
      brandSlug: 'elgin',
      specs: { capacidade_btu: '12000', ciclo: 'Só frio', classe_energetica: 'A', consumo_anual: '411', gas: 'R-32', wifi: 'sim', tensao: '220 V', garantia_compressor: '10' },
      variants: [{ label: '12.000 BTUs, só frio, 220 V', voltage: '220v', modelCode: '45HJFI12C2WB', isReference: true, specs: {} }],
      scores: {
        eficiencia_energetica: { score: 8, justification: 'Classe A com Selo Procel, gás R-32 e consumo de cerca de 411 kWh por ano, um pouco acima do Midea AI XtremeSave.' },
        desempenho_ruido: { score: 7, justification: 'Inverter com 3 velocidades. O ruído em dB não aparece nas fichas consultadas.' },
        recursos: { score: 8, justification: 'Wi-Fi, compatibilidade com Alexa e Google Home e filtro ionizador contra vírus, bactérias e ácaros.' },
        confiabilidade_suporte_instalacao: { score: 8, justification: 'Garantia de 10 anos no compressor (12 meses no restante do aparelho) e assistência da Elgin em todo o país.' },
        custo_beneficio: { score: 9, justification: 'Wi-Fi, R-32 e 10 anos de garantia no compressor por um dos menores preços entre os inverter de 12.000 BTUs.' },
      },
      verdict: 'Bom e barato: inverter com Wi-Fi, gás R-32 e 10 anos de garantia no compressor por um dos menores preços da categoria.',
      pros: ['10 anos de garantia no compressor', 'Wi-Fi com Alexa e Google Home', 'Gás R-32', 'Filtro ionizador', 'Preço baixo'],
      cons: ['Consumo um pouco maior que o do Midea AI XtremeSave', 'Ruído em dB não informado', 'Garantia de 12 meses nas demais peças'],
      recommendedFor: 'Quem quer um inverter com Wi-Fi gastando pouco e valoriza garantia longa no compressor.',
      avoidIf: 'O silêncio absoluto é prioridade e você quer números de ruído informados.',
      review: lexicalDoc([
        heading('h2', 'Eficiência'),
        paragraph('Classe A com Selo Procel, gás R-32 e consumo de cerca de 411 kWh por ano, bom para um aparelho dessa faixa de preço.'),
        heading('h2', 'Recursos e garantia'),
        paragraph(
          'Tem Wi-Fi, comandos por Alexa e Google Home e filtro ionizador. O grande destaque é a garantia de 10 anos no compressor, a peça mais cara do aparelho; as demais peças têm 12 meses.',
        ),
        heading('h2', 'Vale a pena?'),
        paragraph('Para quem quer gastar pouco sem abrir mão de inverter e Wi-Fi, sim.'),
      ]),
      faq: [{ question: 'A garantia de 10 anos vale para tudo?', answer: 'Não: os 10 anos são do compressor. As demais peças têm 12 meses. A instalação deve ser feita por credenciado para manter a garantia.' }],
      sources: [SRC.elginFicha, SRC.elginLoja, SRC.ranking12k],
    },
  ],
  contents: [
    {
      type: 'melhores',
      slug: 'melhores-ar-condicionado-12000-btus',
      title: 'Os melhores ar-condicionados inverter de 12.000 BTUs',
      summary:
        'O LG Dual Inverter Compact +AI é o melhor no geral; o Midea AI XtremeSave é o mais econômico; o Samsung WindFree é o mais confortável; e o Elgin Eco Inverter II é o bom e barato.',
      metaDescription: 'Os melhores ar-condicionados inverter de 12.000 BTUs comparados por eficiência, ruído, recursos, garantia e preço, com notas por critério.',
      modelsAnalyzed: 4,
      picks: [
        { productSlug: LG, profileLabel: 'Melhor no geral', position: 1, why: 'Silencioso, com IA, gás R-32 e classe A, por preço competitivo.' },
        { productSlug: MIDEA, profileLabel: 'Mais econômico', position: 2, why: 'IDRS de 7,6 e 382,7 kWh por ano, com Wi-Fi e controle por voz.' },
        { productSlug: SAMSUNG, profileLabel: 'Mais confortável', position: 3, why: 'Modo WindFree, sem vento direto, e o maior pacote de recursos.' },
        { productSlug: ELGIN, profileLabel: 'Bom e barato', position: 4, why: 'Wi-Fi, R-32 e 10 anos de garantia no compressor por preço baixo.' },
      ],
      body: lexicalDoc([
        heading('h2', 'Como escolher'),
        paragraph(
          'Calcule os BTUs pelo tamanho do ambiente (12.000 BTUs atende cerca de 20 m²), prefira inverter, classe A com Selo Procel e gás R-32, e confira o ruído se for para o quarto.',
        ),
        paragraph('Contrate instalação credenciada para não perder a garantia. Veja todos os detalhes no nosso guia de compra.'),
      ]),
      sources: [SRC.ranking12k, SRC.rankingSplit, SRC.mideaFicha, SRC.lgAnalise],
    },
    {
      type: 'comparativo',
      title: 'LG Dual Inverter Compact +AI ou Midea AI XtremeSave: qual ar-condicionado comprar?',
      summary:
        'O LG é mais silencioso e tem gás R-32; o Midea declara a melhor eficiência (IDRS 7,6) e tem Wi-Fi com controle por voz. Para quarto, LG; para muitas horas de uso, Midea.',
      metaDescription: 'LG Dual Inverter Compact +AI ou Midea AI XtremeSave? Comparamos eficiência, consumo, ruído, Wi-Fi, recursos e preço dos dois inverter de 12.000 BTUs.',
      comparedProductSlugs: [LG, MIDEA],
      badges: [
        { productSlug: LG, label: 'Mais silencioso' },
        { productSlug: MIDEA, label: 'Mais econômico' },
      ],
      chooseIf: [
        { productSlug: LG, text: 'vai instalar no quarto e quer o mínimo de ruído para dormir' },
        { productSlug: MIDEA, text: 'usa o ar muitas horas por dia e quer controlar pelo celular e por voz' },
      ],
      conclusion:
        'Os dois são ótimas escolhas. O LG vence no silêncio e no gás R-32, ideal para quartos; o Midea vence na eficiência declarada e nos recursos de controle, ideal para quem usa o aparelho o dia todo.',
      body: lexicalDoc([
        heading('h2', 'Eficiência'),
        paragraph('O Midea declara IDRS de 7,6 e consumo de 382,7 kWh por ano. O LG é classe A com Selo Procel e gás R-32, mas não encontramos o IDRS publicado.'),
        heading('h2', 'Ruído'),
        paragraph('O LG anuncia ruído a partir de 19 dB na unidade interna. O Midea não informa o ruído na ficha oficial.'),
        heading('h2', 'Recursos'),
        paragraph('Os dois têm inteligência artificial. O Midea tem Wi-Fi com Alexa e Google confirmado; no LG, a conexão varia conforme a versão.'),
      ]),
      sources: [SRC.lgAnalise, SRC.lgLoja, SRC.mideaFicha],
    },
    {
      type: 'guia',
      slug: 'como-escolher-ar-condicionado',
      title: 'Como escolher um ar-condicionado',
      summary:
        'Calcule os BTUs pelo tamanho do ambiente, sol e número de pessoas, prefira inverter, classe A com Selo Procel e gás R-32, confira o ruído e contrate instalação credenciada.',
      metaDescription: 'Guia para escolher ar-condicionado: quantos BTUs para o seu ambiente, inverter, Selo Procel e IDRS, gás R-32, ruído, Wi-Fi e instalação.',
      body: lexicalDoc([
        heading('h2', 'Quantos BTUs?'),
        paragraph(
          'Uma referência prática é 600 BTUs por metro quadrado, com acréscimo de cerca de 600 BTUs por pessoa a mais e por aparelho que esquenta, como TV e computador. Ambientes com sol da tarde pedem uma faixa acima.',
        ),
        paragraph('Na prática: até cerca de 15 m², 9.000 BTUs; até cerca de 20 m², 12.000 BTUs; de 20 a 30 m², 18.000 BTUs.'),
        block({ blockType: 'tip', kind: 'dica', text: 'Na dúvida, um especialista pode calcular a carga térmica do ambiente. Aparelho pequeno demais trabalha sem parar e gasta mais.' }),
        heading('h2', 'Inverter e eficiência'),
        paragraph(
          'O inverter ajusta a velocidade do compressor em vez de ligar e desligar, o que economiza energia e mantém a temperatura estável. Procure classe A no selo do Inmetro e, para comparar modelos, o IDRS: quanto maior, mais econômico.',
        ),
        heading('h2', 'Gás, ruído e recursos'),
        paragraph(
          'O gás R-32 é mais eficiente e tem menor impacto ambiental que o R-410A. Para quarto, compare o ruído da unidade interna em dB. Wi-Fi permite ligar o aparelho antes de chegar em casa.',
        ),
        heading('h2', 'Instalação'),
        paragraph(
          'A instalação deve ser feita por técnico credenciado pela marca: muitas garantias exigem isso. Confira também a tensão (127 V ou 220 V) e o espaço para a unidade externa.',
        ),
        block({ blockType: 'tip', kind: 'aviso', text: 'Instalação feita por quem não é credenciado pode fazer você perder a garantia, inclusive a do compressor.' }),
        heading('h2', 'Comparação rápida dos modelos que analisamos'),
        block({ blockType: 'comparisonTable', productSlugs: [LG, MIDEA, SAMSUNG, ELGIN], attributes: [] }),
        block({
          blockType: 'faq',
          items: [
            { question: 'Inverter vale a pena?', answer: 'Sim, para quem usa todos os dias: o inverter gasta bem menos energia que o convencional, e a diferença na conta compensa o preço.' },
            { question: 'Preciso limpar o filtro?', answer: 'Sim, a cada 15 a 30 dias de uso: filtro sujo reduz a eficiência e piora a qualidade do ar.' },
          ],
        }),
      ]),
      sources: [SRC.ranking12k, SRC.idrs, SRC.mideaFicha, SRC.elginFicha],
    },
    {
      type: 'entenda',
      slug: 'idrs-selo-procel-ar-condicionado',
      title: 'IDRS e Selo Procel: como saber se o ar-condicionado é econômico',
      summary:
        'O IDRS mede a eficiência do ar-condicionado ao longo do ano: quanto maior, mais econômico. Desde 2023, a classe A exige IDRS de pelo menos 5,5 na etiqueta do Inmetro.',
      metaDescription: 'Entenda o IDRS e o Selo Procel do ar-condicionado: o que significam, como ler a etiqueta do Inmetro e como comparar o consumo entre modelos.',
      body: lexicalDoc([
        heading('h2', 'O que é o IDRS'),
        paragraph(
          'O IDRS (Índice de Desempenho de Resfriamento Sazonal) mede quanto frio o aparelho entrega por unidade de energia, considerando o uso ao longo do ano e não só a potência máxima. Quanto maior o número, mais econômico.',
        ),
        heading('h2', 'Etiqueta do Inmetro e Selo Procel'),
        block({
          blockType: 'sideBySide',
          leftTitle: 'Etiqueta do Inmetro',
          leftText: 'Classifica de A a E. Desde 2023, para ser classe A, o aparelho precisa de IDRS de pelo menos 5,5.',
          rightTitle: 'Selo Procel',
          rightText: 'Destaca os modelos mais eficientes da categoria. Ajuda a separar os melhores dentro da classe A.',
        }),
        heading('h2', 'Como comparar na prática'),
        paragraph(
          'Entre dois modelos classe A, compare o IDRS e o consumo anual em kWh informados na etiqueta. Um aparelho com IDRS 7,6 gasta bem menos que outro com o mínimo de 5,5 para o mesmo resfriamento.',
        ),
      ]),
      sources: [SRC.idrs, SRC.ranking12k],
    },
  ],
}
