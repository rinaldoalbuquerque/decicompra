import { block, heading, lexicalDoc, paragraph } from '../lexical'
import type { EditorialPack, Source } from './types'

// Air fryers (Fase 4). Pesquisa estruturada feita em 10/2026: fichas das lojas, testes publicados e
// reputação no Reclame Aqui. Revisão humana obrigatória antes de publicar (spec §9.1).

const SRC = {
  na341Loja: {
    title: 'Fast Shop: ficha da Airfryer Philips Walita Série 3000 (NA341)',
    url: 'https://site.fastshop.com.br/fritadeira-airfryer-philips-walita-serie-3000-7-2l-digital-com-visor-1800w-wana34100pto_prd/p',
  },
  na341Review: {
    title: 'Olhar Digital: análise da Philips Walita Série 3000 (07/2026)',
    url: 'https://olhardigital.com.br/2026/07/07/reviews/philips-walita-serie-3000-analisamos-a-air-fryer-com-capacidade-para-a-familia-inteira/',
  },
  na341Ruido: {
    title: 'Olhar Digital: air fryer de 7,2 litros da Philips Walita faz pouco barulho (04/2026)',
    url: 'https://olhardigital.com.br/2026/04/13/reviews/testamos-air-fryer-de-72-litros-da-philips-walita-faz-muita-comida-e-pouco-barulho/',
  },
  na230Loja: {
    title: 'Fast Shop: ficha da Airfryer Philips Walita Série 2000 XL (NA230/00)',
    url: 'https://site.fastshop.com.br/fritadeira-philips-walita-airfryer-digital-serie-2000-xl-preta-com-6-2-litros-de-capacidade---na230-00-wana230pto_prd/p',
  },
  na230Comparador: {
    title: 'Buscapé: ficha e ofertas da Philips Walita Série 2000 NA230',
    url: 'https://www.buscape.com.br/fritadeira/fritadeira-eletrica-air-fryer-philips-walita-serie-2000-xl-digital-na230-sem-oleo-1700w-6-2l-preta',
  },
  philipsReclameAqui: {
    title: 'Philips Walita vence o Prêmio Reclame Aqui na categoria Eletrodomésticos (fabricante)',
    url: 'https://www.abcdacomunicacao.com.br/philips-walita-e-vencedora-do-premio-reclame-aqui-na-categoria-eletrodomesticos-fabricante/',
  },
  mondialLoja: {
    title: 'Fast Shop: ficha da Air Fryer Mondial AFN-50-BI',
    url: 'https://site.fastshop.com.br/fritadeira-air-fryer-5-litros-afn-50-bi-mondial-54140/p',
  },
  mondialReview: {
    title: 'GDM: análise da Mondial AFN-50-BI (capacidade útil medida e limpeza)',
    url: 'https://gdm.com.br/mondial-afn-50-bi/',
  },
  mondialReclameAqui: {
    title: 'Reclame Aqui: reputação da Mondial Eletrodomésticos',
    url: 'https://www.reclameaqui.com.br/empresa/mondial-eletrodomestico',
  },
  britaniaLoja: {
    title: 'Fast Shop: ficha da Air Fryer Britânia BFR50',
    url: 'https://site.fastshop.com.br/air-fryer-britania-bfr50-55l-1500w-com-cesto-removivel-antiaderente-redstone-preto-220v-166581/p',
  },
  britaniaLoja2: {
    title: 'Gazin: ficha da Air Fryer Britânia BFR50 5,5 L 1500 W',
    url: 'https://www.gazin.com.br/produto/fritadeira-eletrica-air-fryer-britania-bfr50-55l-1500w/8661/sem-cor/110-volts',
  },
  marcas: {
    title: 'Zoom: comparação das marcas de air fryer (2026)',
    url: 'https://www.zoom.com.br/fritadeira/deumzoom/qual-a-melhor-marca-de-air-fryer',
  },
} satisfies Record<string, Source>

const NA341 = 'philips-walita-serie-3000-xl-na341'
const NA230 = 'philips-walita-serie-2000-xl-na230'
const MONDIAL = 'mondial-grand-family-afn-50-bi'
const BRITANIA = 'britania-bfr50'

export const airFryers: EditorialPack = {
  subcategorySlug: 'air-fryers',
  criteriaKeys: ['cozimento_capacidade', 'facilidade_uso_limpeza', 'construcao_durabilidade', 'suporte', 'custo_beneficio'],
  specTemplate: [
    { key: 'capacidade_total', label: 'Capacidade total', type: 'number', unit: 'L', direction: 'higher', required: true, comparable: true, highlight: true, group: 'Capacidade' },
    { key: 'capacidade_cesto', label: 'Capacidade útil do cesto', type: 'number', unit: 'L', direction: 'higher', comparable: true, group: 'Capacidade' },
    { key: 'potencia', label: 'Potência', type: 'number', unit: 'W', direction: 'neutral', perVariant: true, required: true, comparable: true, group: 'Desempenho' },
    { key: 'temperatura_max', label: 'Temperatura máxima', type: 'number', unit: '°C', direction: 'higher', comparable: true, group: 'Desempenho' },
    { key: 'timer_max', label: 'Timer', type: 'number', unit: 'min', direction: 'higher', comparable: true, group: 'Desempenho' },
    { key: 'controle', label: 'Controle', type: 'option', options: ['Digital', 'Mecânico'], direction: 'neutral', required: true, comparable: true, highlight: true, group: 'Uso' },
    { key: 'funcoes_predefinidas', label: 'Funções pré-definidas', type: 'number', direction: 'higher', comparable: true, group: 'Uso' },
    { key: 'visor', label: 'Visor com luz interna', type: 'boolean', direction: 'higher', comparable: true, group: 'Uso' },
    { key: 'lava_loucas', label: 'Cesto vai à lava-louças', type: 'boolean', direction: 'higher', comparable: true, group: 'Uso' },
    { key: 'garantia', label: 'Garantia', type: 'number', unit: 'meses', direction: 'higher', required: true, comparable: true, highlight: true, group: 'Suporte' },
  ],
  brands: [
    { slug: 'philips-walita', name: 'Philips Walita', officialSite: 'https://www.philips.com.br' },
    { slug: 'mondial', name: 'Mondial', officialSite: 'https://www.mondialline.com.br' },
    { slug: 'britania', name: 'Britânia', officialSite: 'https://www.britania.com.br' },
  ],
  products: [
    {
      slug: NA341,
      name: 'Philips Walita Airfryer Série 3000 XL (NA341)',
      brandSlug: 'philips-walita',
      specs: {
        capacidade_total: '7.2',
        capacidade_cesto: '4.7',
        temperatura_max: '200',
        timer_max: '60',
        controle: 'Digital',
        funcoes_predefinidas: '12',
        visor: 'sim',
        lava_loucas: 'sim',
        garantia: '24',
      },
      variants: [
        { label: '127 V', voltage: '127v', modelCode: 'NA341/00', isReference: true, specs: { potencia: '1800' } },
        { label: '220 V', voltage: '220v', modelCode: 'NA341/00', specs: { potencia: '2000' } },
      ],
      scores: {
        cozimento_capacidade: {
          score: 9,
          justification: 'Cesto grande (7,2 L no total, 4,7 L úteis) e potência alta (1.800 W em 127 V, 2.000 W em 220 V) para preparar porções de família de uma vez.',
        },
        facilidade_uso_limpeza: {
          score: 9,
          justification: 'Painel digital com 12 funções prontas e uma personalizável, visor com luz para acompanhar sem abrir e cesto que vai à lava-louças. Testes apontam funcionamento silencioso.',
        },
        construcao_durabilidade: {
          score: 8.5,
          justification: 'Acabamento firme, visor de vidro temperado e bom isolamento térmico: o corpo não esquenta demais por fora, segundo análise publicada.',
        },
        suporte: {
          score: 9,
          justification: 'Garantia de 2 anos e rede de assistência ampla. A Philips Walita venceu o Prêmio Reclame Aqui na categoria de eletrodomésticos (fabricante).',
        },
        custo_beneficio: {
          score: 7.5,
          justification: 'Está entre as mais caras desta lista. O preço se justifica para famílias grandes, mas quem cozinha para até 3 pessoas paga por capacidade que não vai usar.',
        },
      },
      verdict: 'A mais completa da lista: cesto grande, painel digital com visor e funcionamento silencioso, ideal para famílias de 4 a 6 pessoas.',
      pros: [
        'Capacidade para refeições da família inteira',
        'Visor com luz interna para acompanhar o preparo',
        '12 funções prontas e painel digital fácil de usar',
        'Funcionamento silencioso, segundo testes publicados',
        'Garantia de 2 anos',
      ],
      cons: ['Preço acima da média da categoria', 'Ocupa bastante espaço na bancada e precisa de recuo da parede para a saída de ar'],
      recommendedFor: 'Famílias de 4 a 6 pessoas que usam a air fryer quase todo dia e querem acompanhar o preparo sem abrir o cesto.',
      avoidIf: 'Você mora sozinho ou em dupla, tem pouco espaço na bancada ou procura o menor preço.',
      review: lexicalDoc([
        heading('h2', 'Capacidade e desempenho'),
        paragraph(
          'A Série 3000 XL tem 7,2 litros no total e 4,7 litros de cesto útil, o suficiente para uma refeição de família sem precisar fazer o preparo em levas. A potência é de 1.800 W na versão 127 V e 2.000 W na 220 V, e a temperatura chega a 200 °C.',
        ),
        heading('h2', 'Uso no dia a dia'),
        paragraph(
          'O painel digital fica no topo e traz 12 funções prontas, além de uma personalizável. O visor com luz interna é o grande diferencial: dá para conferir o ponto sem abrir a gaveta e perder calor. Análises publicadas destacam que ela é mais silenciosa que outros modelos do mercado.',
        ),
        heading('h2', 'Limpeza e construção'),
        paragraph(
          'O cesto antiaderente é removível e pode ir à lava-louças. O acabamento é firme e o isolamento térmico mantém o corpo menos quente por fora. Como a saída de ar fica atrás, é bom deixar um espaço entre o aparelho e a parede.',
        ),
        heading('h2', 'Vale a pena?'),
        paragraph(
          'Para famílias que usam a air fryer com frequência, sim: é a opção mais completa desta lista. Para uma ou duas pessoas, modelos menores e mais baratos entregam o mesmo resultado no prato.',
        ),
      ]),
      faq: [
        { question: 'Qual a capacidade real do cesto?', answer: 'A capacidade total é de 7,2 litros e a útil do cesto, de 4,7 litros, segundo a ficha do produto.' },
        { question: 'Ela é bivolt?', answer: 'Não. Existem versões de 127 V (1.800 W) e de 220 V (2.000 W); confira a voltagem antes de comprar.' },
        { question: 'O cesto pode ir à lava-louças?', answer: 'Sim, o cesto antiaderente removível pode ser lavado na lava-louças.' },
      ],
      sources: [SRC.na341Loja, SRC.na341Review, SRC.na341Ruido, SRC.philipsReclameAqui],
    },
    {
      slug: NA230,
      name: 'Philips Walita Airfryer Série 2000 XL (NA230)',
      brandSlug: 'philips-walita',
      specs: {
        capacidade_total: '6.2',
        temperatura_max: '200',
        timer_max: '60',
        controle: 'Digital',
        funcoes_predefinidas: '8',
        visor: 'sim',
        lava_loucas: 'sim',
        garantia: '24',
      },
      variants: [
        { label: '127 V', voltage: '127v', modelCode: 'NA230/00', isReference: true, specs: { potencia: '1700' } },
        { label: '220 V', voltage: '220v', modelCode: 'NA230/00', specs: { potencia: '1700' } },
      ],
      scores: {
        cozimento_capacidade: {
          score: 8.5,
          justification: 'Cesto de 6,2 L (cerca de 1,2 kg de alimento), 1.700 W e tecnologia RapidAir de circulação de ar: cozimento rápido e uniforme para até 6 pessoas.',
        },
        facilidade_uso_limpeza: {
          score: 8.5,
          justification: 'Painel touch com 8 funções prontas, temperatura de 80 a 200 °C, visor com luz interna e peças removíveis que vão à lava-louças.',
        },
        construcao_durabilidade: {
          score: 8,
          justification: 'Boa construção, com pés antiderrapantes e desligamento automático. Acabamento um degrau abaixo da Série 3000.',
        },
        suporte: {
          score: 9,
          justification: 'Garantia de 2 anos da Philips Walita, marca premiada no Reclame Aqui na categoria de eletrodomésticos, com assistência em todo o país.',
        },
        custo_beneficio: {
          score: 8.5,
          justification: 'Entrega quase tudo da Série 3000 (painel digital, visor, lava-louças, 2 anos de garantia) por um preço menor. É o melhor equilíbrio da lista.',
        },
      },
      verdict: 'O melhor equilíbrio entre preço e recursos: painel digital, visor e cesto de 6,2 litros, com a garantia de 2 anos da Philips Walita.',
      pros: ['Painel digital com 8 funções prontas', 'Visor com luz interna', 'Cesto de 6,2 L para até 6 pessoas', 'Peças vão à lava-louças', 'Garantia de 2 anos'],
      cons: ['Menos funções e acabamento mais simples que a Série 3000', 'Não é bivolt: é preciso escolher 127 V ou 220 V'],
      recommendedFor: 'Famílias de 3 a 5 pessoas que querem uma air fryer digital, com visor e boa garantia, sem pagar o preço do modelo topo de linha.',
      avoidIf: 'Você cozinha para muita gente de uma vez ou quer o máximo de capacidade (veja a Série 3000 XL).',
      review: lexicalDoc([
        heading('h2', 'Capacidade e desempenho'),
        paragraph(
          'São 6,2 litros de capacidade, cerca de 1,2 kg de alimento, e 1.700 W de potência. A temperatura vai de 80 a 200 °C e o timer chega a 60 minutos, cobrindo de batata frita a assados.',
        ),
        heading('h2', 'Uso no dia a dia'),
        paragraph(
          'O painel touch tem 8 funções pré-definidas e o visor com luz interna permite acompanhar o preparo sem abrir a gaveta, recurso raro nessa faixa de preço. O desligamento é automático ao fim do tempo.',
        ),
        heading('h2', 'Limpeza'),
        paragraph('A grelha antiaderente e as demais peças removíveis vão à lava-louças.'),
        heading('h2', 'Vale a pena?'),
        paragraph(
          'É a escolha mais equilibrada desta lista: leva o essencial da Série 3000 (digital, visor, lava-louças e 2 anos de garantia) por menos. Só perde para ela em capacidade e número de funções.',
        ),
      ]),
      faq: [
        { question: 'Para quantas pessoas ela serve?', answer: 'O fabricante indica para até 6 pessoas; na prática, rende bem para famílias de 3 a 5.' },
        { question: 'Qual a diferença para a Série 3000 XL?', answer: 'A Série 3000 XL tem mais capacidade (7,2 L), mais funções (12) e potência maior; a Série 2000 XL custa menos.' },
      ],
      sources: [SRC.na230Loja, SRC.na230Comparador, SRC.philipsReclameAqui],
    },
    {
      slug: MONDIAL,
      name: 'Mondial Air Fryer Grand Family AFN-50-BI',
      brandSlug: 'mondial',
      specs: {
        capacidade_total: '5',
        capacidade_cesto: '4.6',
        temperatura_max: '200',
        timer_max: '60',
        controle: 'Mecânico',
        visor: 'não',
        lava_loucas: 'sim',
        garantia: '12',
      },
      variants: [
        { label: '127 V', voltage: '127v', modelCode: 'AFN-50-BI', isReference: true, specs: { potencia: '1900' } },
        { label: '220 V', voltage: '220v', modelCode: 'AFN-50-BI', specs: { potencia: '1900' } },
      ],
      scores: {
        cozimento_capacidade: {
          score: 8,
          justification: '1.900 W de potência e 5 L de capacidade (4,6 L úteis, segundo medição publicada): cozinha rápido e atende bem famílias de até 4 pessoas.',
        },
        facilidade_uso_limpeza: {
          score: 7,
          justification: 'Controles simples de temperatura e timer, sem visor nem funções prontas. Peças vão à lava-louças, mas o revestimento pede cuidado com esponjas abrasivas.',
        },
        construcao_durabilidade: {
          score: 7,
          justification: 'Acabamento em inox bonito para o preço, mas há relatos de revestimento do cesto descascando quando limpo com esponja abrasiva.',
        },
        suporte: {
          score: 8,
          justification: 'Garantia de 1 ano. A Mondial tem reputação RA1000 no Reclame Aqui, com nota média de 9,4 e 96% das reclamações resolvidas.',
        },
        custo_beneficio: {
          score: 9,
          justification: 'Uma das air fryers mais vendidas do Brasil: muita potência e boa capacidade por um preço bem abaixo dos modelos digitais.',
        },
      },
      verdict: 'Muita potência e boa capacidade por um preço baixo: a escolha certa para quem quer o essencial bem feito, sem painel digital nem visor.',
      pros: ['Potência alta (1.900 W) que acelera o preparo', 'Boa capacidade para até 4 pessoas', 'Preço baixo para o que entrega', 'Peças antiaderentes vão à lava-louças'],
      cons: [
        'Sem visor e sem funções prontas',
        'Revestimento do cesto pode descascar com esponja abrasiva',
        'Garantia de 1 ano, metade da oferecida pela Philips Walita',
      ],
      recommendedFor: 'Quem quer gastar pouco e prefere controles simples, sem menus, para uma família de até 4 pessoas.',
      avoidIf: 'Você quer acompanhar o preparo por um visor, usar receitas prontas no painel ou precisa de garantia mais longa.',
      review: lexicalDoc([
        heading('h2', 'Capacidade e desempenho'),
        paragraph(
          'A Grand Family tem 5 litros no total; em medição publicada, o cesto comportou 4,6 litros úteis. Os 1.900 W de potência estão entre os mais altos da faixa de preço e encurtam o tempo de preparo.',
        ),
        heading('h2', 'Uso no dia a dia'),
        paragraph(
          'Os controles de temperatura (até 200 °C) e de tempo (até 60 minutos) são simples e diretos. Não há visor nem programas prontos, então é você quem acerta tempo e temperatura de cada receita.',
        ),
        heading('h2', 'Limpeza e cuidados'),
        paragraph(
          'O cesto e a cuba antiaderentes são removíveis e podem ir à lava-louças. Para o revestimento durar, evite esponjas abrasivas e utensílios de metal: é a causa mais comum dos relatos de descascamento.',
        ),
        heading('h2', 'Vale a pena?'),
        paragraph(
          'Para quem quer gastar pouco, sim. Ela entrega potência e capacidade de modelos mais caros e abre mão só das comodidades: painel digital, visor e garantia mais longa.',
        ),
      ]),
      faq: [
        { question: 'Ela é digital?', answer: 'Não. Os controles de temperatura e timer são mecânicos, sem programas prontos.' },
        { question: 'Qual a garantia?', answer: '1 ano de garantia da Mondial, segundo a ficha do produto.' },
        { question: 'Por que o cesto descasca?', answer: 'Os relatos costumam envolver esponjas abrasivas ou utensílios de metal. Use esponja macia e espátulas de silicone ou madeira.' },
      ],
      sources: [SRC.mondialLoja, SRC.mondialReview, SRC.mondialReclameAqui],
    },
    {
      slug: BRITANIA,
      name: 'Britânia Air Fryer BFR50',
      brandSlug: 'britania',
      specs: {
        capacidade_total: '5.5',
        temperatura_max: '200',
        timer_max: '60',
        controle: 'Mecânico',
        visor: 'não',
        garantia: '12',
      },
      variants: [
        { label: '127 V', voltage: '127v', modelCode: 'BFR50', isReference: true, specs: { potencia: '1500' } },
        { label: '220 V', voltage: '220v', modelCode: 'BFR50', specs: { potencia: '1500' } },
      ],
      scores: {
        cozimento_capacidade: {
          score: 7,
          justification: 'Cesto quadrado de 5,5 L com bom aproveitamento de espaço, mas os 1.500 W deixam o preparo mais lento que nos modelos de 1.700 W ou mais.',
        },
        facilidade_uso_limpeza: {
          score: 7,
          justification: 'Seletor de temperatura (80 a 200 °C) e timer mecânico de 60 minutos, simples de usar. Sem visor nem funções prontas.',
        },
        construcao_durabilidade: {
          score: 7,
          justification: 'Revestimento Redstone com nano cerâmica, base antiderrapante e proteção contra superaquecimento. Construção simples, adequada à faixa de preço.',
        },
        suporte: {
          score: 7,
          justification: 'Garantia de 12 meses contra defeitos de fabricação, e a Britânia tem assistência técnica em todo o país.',
        },
        custo_beneficio: {
          score: 8.5,
          justification: 'Uma das opções mais baratas com cesto acima de 5 litros, boa porta de entrada para quem nunca teve air fryer.',
        },
      },
      verdict: 'Porta de entrada com cesto quadrado de 5,5 litros e preço baixo; o preparo é um pouco mais lento por causa dos 1.500 W de potência.',
      pros: ['Preço baixo', 'Cesto quadrado de 5,5 L com bom aproveitamento', 'Revestimento Redstone de nano cerâmica', 'Proteção contra superaquecimento'],
      cons: ['Potência de 1.500 W, menor que a dos concorrentes', 'Sem visor e sem funções prontas', 'Garantia de 12 meses'],
      recommendedFor: 'Quem vai comprar a primeira air fryer, quer gastar pouco e não se importa com preparos alguns minutos mais longos.',
      avoidIf: 'Você usa a air fryer todo dia para a família inteira ou quer controles digitais.',
      review: lexicalDoc([
        heading('h2', 'Capacidade e desempenho'),
        paragraph(
          'O cesto quadrado de 5,5 litros aproveita melhor o espaço que os redondos. A potência de 1.500 W é a menor desta lista, então receitas como batata frita levam alguns minutos a mais.',
        ),
        heading('h2', 'Uso no dia a dia'),
        paragraph('O seletor de temperatura vai de 80 a 200 °C e o timer mecânico, até 60 minutos, com luz indicadora de funcionamento e desligamento automático.'),
        heading('h2', 'Limpeza e construção'),
        paragraph(
          'O revestimento Redstone, com nano cerâmica, permite cozinhar com pouco ou nenhum óleo. Base antiderrapante e proteção contra superaquecimento completam o conjunto, simples mas bem resolvido para o preço.',
        ),
        heading('h2', 'Vale a pena?'),
        paragraph('Como primeira air fryer e para uso eventual, sim. Para uso diário em família, vale investir um pouco mais em um modelo mais potente.'),
      ]),
      faq: [
        { question: 'Qual a potência?', answer: '1.500 W, nas versões 127 V e 220 V.' },
        { question: 'Qual a garantia?', answer: '12 meses contra defeitos de fabricação, segundo a ficha do produto.' },
      ],
      sources: [SRC.britaniaLoja, SRC.britaniaLoja2],
    },
  ],
  contents: [
    {
      type: 'melhores',
      slug: 'melhores-air-fryers',
      title: 'As melhores air fryers para comprar',
      summary:
        'A Philips Walita Série 3000 XL é a mais completa; a Série 2000 XL tem o melhor equilíbrio entre preço e recursos; a Mondial AFN-50-BI entrega muita potência por pouco; e a Britânia BFR50 é a porta de entrada.',
      metaDescription: 'As melhores air fryers do Brasil comparadas por capacidade, facilidade de uso, construção, garantia e preço, com notas por critério.',
      modelsAnalyzed: 4,
      picks: [
        { productSlug: NA341, profileLabel: 'Melhor no geral', position: 1, why: 'Cesto grande, visor com luz, 12 funções prontas e funcionamento silencioso. A mais completa para famílias.' },
        { productSlug: NA230, profileLabel: 'Melhor custo-benefício', position: 2, why: 'Painel digital, visor, lava-louças e 2 anos de garantia por um preço bem menor que o da Série 3000.' },
        { productSlug: MONDIAL, profileLabel: 'Boa e barata', position: 3, why: 'Potência alta e boa capacidade por um preço baixo, para quem prefere controles simples.' },
        { productSlug: BRITANIA, profileLabel: 'Para a primeira air fryer', position: 4, why: 'Cesto quadrado de 5,5 L e preço de entrada; mais lenta, mas resolve o uso eventual.' },
      ],
      body: lexicalDoc([
        heading('h2', 'Como escolher'),
        paragraph(
          'Comece pela capacidade: até 4 litros atende 1 ou 2 pessoas, de 5 a 6 litros uma família de 3 a 4, e acima de 6 litros famílias maiores. Depois decida entre controle digital (mais funções prontas e precisão) e mecânico (mais simples e barato).',
        ),
        paragraph(
          'Confira também a voltagem (a maioria não é bivolt), se o cesto vai à lava-louças e o tempo de garantia. Veja todos os detalhes no nosso guia de compra.',
        ),
      ]),
      sources: [SRC.na341Review, SRC.na230Loja, SRC.mondialReview, SRC.britaniaLoja, SRC.marcas],
    },
    {
      type: 'comparativo',
      title: 'Philips Walita Série 2000 XL ou Mondial AFN-50-BI: qual air fryer comprar?',
      summary:
        'A Philips Walita Série 2000 XL é mais prática (digital, com visor e 2 anos de garantia); a Mondial AFN-50-BI é mais barata e mais potente. Escolha pela comodidade ou pelo preço.',
      metaDescription: 'Philips Walita Série 2000 XL ou Mondial AFN-50-BI? Comparamos capacidade, potência, facilidade de uso, garantia e preço para você decidir.',
      comparedProductSlugs: [NA230, MONDIAL],
      badges: [
        { productSlug: NA230, label: 'Vencedora geral' },
        { productSlug: MONDIAL, label: 'Melhor preço' },
      ],
      chooseIf: [
        { productSlug: NA230, text: 'quer painel digital, visor para acompanhar o preparo e garantia de 2 anos' },
        { productSlug: MONDIAL, text: 'quer gastar menos e prefere controles simples, com bastante potência' },
      ],
      conclusion:
        'A Série 2000 XL vence no conjunto: é mais fácil de usar, tem mais capacidade e o dobro de garantia. A Mondial AFN-50-BI faz sentido para quem quer economizar e não sente falta de visor e funções prontas.',
      body: lexicalDoc([
        heading('h2', 'Capacidade e potência'),
        paragraph(
          'A Philips Walita tem 6,2 litros e 1.700 W; a Mondial, 5 litros (4,6 úteis em medição publicada) e 1.900 W. A Philips leva mais comida por vez; a Mondial esquenta um pouco mais rápido.',
        ),
        heading('h2', 'Facilidade de uso'),
        paragraph(
          'A Philips tem painel touch com 8 funções prontas e visor com luz interna. A Mondial usa controles simples de temperatura e tempo, sem programas nem visor.',
        ),
        heading('h2', 'Limpeza e durabilidade'),
        paragraph(
          'As duas têm peças que vão à lava-louças. Na Mondial, há relatos de revestimento descascando com esponjas abrasivas; use esponja macia.',
        ),
        heading('h2', 'Garantia e suporte'),
        paragraph('A Philips Walita oferece 2 anos de garantia; a Mondial, 1 ano. As duas marcas têm boa reputação no Reclame Aqui.'),
      ]),
      sources: [SRC.na230Loja, SRC.mondialLoja, SRC.mondialReview, SRC.philipsReclameAqui, SRC.mondialReclameAqui],
    },
    {
      type: 'guia',
      slug: 'como-escolher-air-fryer',
      title: 'Como escolher uma air fryer',
      summary:
        'Escolha pela capacidade (de 4 a 7 litros, conforme o número de pessoas), decida entre controle digital ou mecânico, confira a voltagem, se o cesto vai à lava-louças e o tempo de garantia.',
      metaDescription: 'Guia para escolher air fryer: capacidade ideal por pessoas, digital ou mecânica, potência, voltagem, limpeza, garantia e cuidados com o cesto.',
      body: lexicalDoc([
        heading('h2', 'Capacidade: quantas pessoas vão comer?'),
        paragraph(
          'Até 4 litros atende 1 ou 2 pessoas. De 5 a 6 litros, uma família de 3 a 4 pessoas. Acima de 6 litros, famílias maiores ou quem gosta de cozinhar tudo de uma vez. Repare que a capacidade útil do cesto costuma ser menor que a total anunciada.',
        ),
        block({ blockType: 'tip', kind: 'dica', text: 'Na dúvida entre dois tamanhos, escolha o maior: encher demais o cesto deixa a comida menos crocante.' }),
        heading('h2', 'Digital ou mecânica?'),
        paragraph(
          'As digitais têm funções prontas (batata, frango, peixe), ajuste mais preciso e, em alguns modelos, visor com luz para acompanhar o preparo. As mecânicas são mais simples, mais baratas e têm menos peças eletrônicas para dar defeito.',
        ),
        heading('h2', 'Potência e voltagem'),
        paragraph(
          'Modelos de 1.700 W ou mais aquecem mais rápido; com 1.500 W o preparo leva alguns minutos a mais. A maioria das air fryers não é bivolt: confira se a versão é 127 V ou 220 V antes de comprar.',
        ),
        heading('h2', 'Limpeza e cuidados com o cesto'),
        paragraph(
          'Prefira cestos que vão à lava-louças. Para o antiaderente durar, use esponja macia e utensílios de silicone ou madeira: esponjas abrasivas e garfos de metal são a principal causa de cestos descascando.',
        ),
        block({ blockType: 'tip', kind: 'aviso', text: 'Nunca use papel-alumínio ou papel-manteiga cobrindo todo o fundo: isso bloqueia a circulação de ar e pode causar superaquecimento.' }),
        heading('h2', 'Garantia e assistência'),
        paragraph('A garantia varia de 1 a 2 anos. Marcas com assistência técnica espalhada pelo país facilitam o conserto e a compra de peças, como o cesto.'),
        heading('h2', 'Comparação rápida dos modelos que analisamos'),
        block({ blockType: 'comparisonTable', productSlugs: [NA341, NA230, MONDIAL, BRITANIA], attributes: [] }),
        block({
          blockType: 'faq',
          items: [
            { question: 'Air fryer gasta muita energia?', answer: 'Gasta menos que um forno elétrico na maioria dos preparos, porque é menor e cozinha mais rápido. Veja a conta completa no nosso texto sobre consumo.' },
            { question: 'Posso usar óleo?', answer: 'Pode, em pequena quantidade e de preferência borrifado. Não é necessário na maioria das receitas.' },
          ],
        }),
      ]),
      sources: [SRC.na341Review, SRC.mondialReview, SRC.britaniaLoja, SRC.marcas],
    },
    {
      type: 'entenda',
      slug: 'air-fryer-gasta-muita-energia',
      title: 'Air fryer gasta muita energia? Veja como calcular o consumo',
      summary:
        'O consumo é a potência multiplicada pelo tempo de uso. Uma air fryer de 1.500 W ligada por 30 minutos consome 0,75 kWh, cerca de R$ 0,60 com tarifa de R$ 0,80 por kWh.',
      metaDescription: 'Air fryer gasta muita luz? Aprenda a calcular o consumo pela potência e pelo tempo de uso e compare com o forno elétrico.',
      body: lexicalDoc([
        heading('h2', 'A conta em uma linha'),
        paragraph(
          'Consumo (kWh) = potência (W) × horas de uso ÷ 1.000. Uma air fryer de 1.500 W usada por 30 minutos (0,5 hora) consome 1.500 × 0,5 ÷ 1.000 = 0,75 kWh.',
        ),
        paragraph(
          'Para saber o valor em reais, multiplique pela tarifa da sua conta de luz. Com uma tarifa de R$ 0,80 por kWh, esses 30 minutos custam cerca de R$ 0,60. A tarifa varia por cidade e bandeira; confira a sua na conta.',
        ),
        block({
          blockType: 'tip',
          kind: 'dica',
          text: 'A potência anunciada é o máximo. Depois de aquecer, o termostato liga e desliga a resistência, então o consumo real costuma ser menor que o da conta.',
        }),
        heading('h2', 'Air fryer ou forno elétrico?'),
        block({
          blockType: 'sideBySide',
          leftTitle: 'Air fryer',
          leftText: 'Câmara pequena, aquece em poucos minutos e cozinha rápido. Gasta menos em porções pequenas e médias.',
          rightTitle: 'Forno elétrico',
          rightText: 'Mais espaço para assados grandes, mas demora mais para aquecer e costuma ter potência parecida ou maior.',
        }),
        heading('h2', 'Como economizar'),
        paragraph(
          'Evite abrir a gaveta a toda hora, não encha demais o cesto (a comida demora mais e fica menos crocante) e aproveite o calor para preparar duas receitas em sequência.',
        ),
      ]),
      sources: [SRC.marcas, SRC.na341Loja],
    },
  ],
}
