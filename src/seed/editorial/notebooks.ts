import { block, heading, lexicalDoc, paragraph } from '../lexical'
import type { EditorialPack, Source } from './types'

// Notebooks (Fase 4). Pesquisa estruturada feita em 10/2026: fichas técnicas, comparadores, lojas e
// listas especializadas. Revisão humana obrigatória antes de publicar (spec §9.1).

const SRC = {
  macFicha: { title: 'Oficina da Net: ficha técnica do MacBook Air M4 13"', url: 'https://www.oficinadanet.com.br/notebooks/apple-macbook-air-m4-13' },
  macLancamento: { title: 'Tecnoblog: Apple anuncia MacBook Air de 13" e 15" com chip M4', url: 'https://tecnoblog.net/noticias/apple-anuncia-macbook-air-de-13-e-15-com-chip-m4/' },
  galaxyFicha: {
    title: 'Buscapé: Samsung Galaxy Book4 NP750XGJ-KG2BR (Core i5-1335U, 16 GB, 512 GB)',
    url: 'https://www.buscape.com.br/notebook/notebook-samsung-book-np750xgj-kg2br-intel-core-i5-1335u-15-6-16gb-ssd-512-gb-windows-11',
  },
  galaxyLancamento: {
    title: 'TecMundo: Samsung Galaxy Book4 é lançado no Brasil (preço e especificações)',
    url: 'https://www.tecmundo.com.br/produto/283353-samsung-galaxy-book4-lancado-brasil-confira-preco-especificacoes.htm',
  },
  aspireFicha: { title: 'Oficina da Net: ficha técnica do Acer Aspire 5 A515-57', url: 'https://www.oficinadanet.com.br/notebooks/acer-aspire-5-a515-57-55b8' },
  aspireLoja: {
    title: 'Pichau: Acer Aspire 5 A515-57-565J (Core i5-12450H, 8 GB, 512 GB)',
    url: 'https://www.pichau.com.br/notebook-acer-aspire-5-15-6-pol-intel-core-i5-12450h-8gb-ddr4-ssd-512gb-preto-a515-57-565j',
  },
  ideapadFicha: { title: 'Notebookcheck: Lenovo IdeaPad Slim 3 15IAH8', url: 'https://www.notebookcheck.net/Lenovo-IdeaPad-Slim-3-15IAH8.785985.0.html' },
  ideapadSpecs: { title: 'Geektopia: características do IdeaPad Slim 3 15IAH8', url: 'https://www.geektopia.es/es/product/lenovo/ideapad-slim-3-15iah8-83er006psp/' },
  techtudo: { title: 'TechTudo: melhor notebook custo-benefício por até R$ 4.000 (2026)', url: 'https://www.techtudo.com.br/listas/2026/08/melhor-notebook-custo-beneficio-edqualcomprarie.ghtml' },
  exame: {
    title: 'Exame: notebooks custo-benefício para trabalhar em 2026',
    url: 'https://exame.com/tecnologia/examelab/notebooks-custo-beneficio-para-trabalhar-em-2026-do-basico-ao-premium/',
  },
} satisfies Record<string, Source>

const MAC = 'apple-macbook-air-m4-13'
const GALAXY = 'samsung-galaxy-book4-15'
const ASPIRE = 'acer-aspire-5-a515-57'
const IDEAPAD = 'lenovo-ideapad-slim-3-15iah8'

export const notebooks: EditorialPack = {
  subcategorySlug: 'notebooks',
  criteriaKeys: ['desempenho', 'tela_construcao', 'bateria_portabilidade', 'confiabilidade_suporte', 'custo_beneficio'],
  specTemplate: [
    { key: 'processador', label: 'Processador', type: 'text', required: true, comparable: true, highlight: true, group: 'Desempenho' },
    { key: 'memoria_ram', label: 'Memória RAM', type: 'number', unit: 'GB', direction: 'higher', perVariant: true, required: true, comparable: true, group: 'Desempenho' },
    { key: 'armazenamento', label: 'Armazenamento (SSD)', type: 'number', unit: 'GB', direction: 'higher', perVariant: true, required: true, comparable: true, group: 'Desempenho' },
    { key: 'ram_expansivel', label: 'Memória pode ser ampliada', type: 'boolean', direction: 'higher', comparable: true, group: 'Desempenho' },
    { key: 'placa_video', label: 'Placa de vídeo', type: 'text', comparable: true, group: 'Desempenho' },
    { key: 'tela_tamanho', label: 'Tela', type: 'number', unit: '"', direction: 'neutral', required: true, comparable: true, highlight: true, group: 'Tela' },
    { key: 'tela_resolucao', label: 'Resolução', type: 'text', comparable: true, group: 'Tela' },
    { key: 'peso', label: 'Peso', type: 'number', unit: 'kg', direction: 'lower', comparable: true, highlight: true, group: 'Portabilidade' },
    { key: 'bateria_wh', label: 'Bateria', type: 'number', unit: 'Wh', direction: 'higher', comparable: true, group: 'Portabilidade' },
    { key: 'hdmi', label: 'Saída HDMI', type: 'boolean', direction: 'higher', comparable: true, group: 'Conexões' },
    { key: 'sistema', label: 'Sistema', type: 'text', comparable: true, group: 'Geral' },
  ],
  brands: [
    { slug: 'apple', name: 'Apple', officialSite: 'https://www.apple.com/br' },
    { slug: 'samsung', name: 'Samsung', officialSite: 'https://www.samsung.com/br' },
    { slug: 'acer', name: 'Acer', officialSite: 'https://www.acer.com/br-pt' },
    { slug: 'lenovo', name: 'Lenovo', officialSite: 'https://www.lenovo.com/br/pt' },
  ],
  products: [
    {
      slug: MAC,
      name: 'Apple MacBook Air M4 13"',
      brandSlug: 'apple',
      specs: {
        processador: 'Apple M4 (10 núcleos de CPU, 10 de GPU)',
        ram_expansivel: 'não',
        placa_video: 'Integrada ao chip M4 (10 núcleos)',
        tela_tamanho: '13.6',
        tela_resolucao: '2560 × 1664 (Liquid Retina)',
        peso: '1.24',
        bateria_wh: '53.8',
        hdmi: 'não',
        sistema: 'macOS',
      },
      variants: [
        { label: '16 GB / 256 GB', isReference: true, specs: { memoria_ram: '16', armazenamento: '256' } },
        { label: '16 GB / 512 GB', specs: { memoria_ram: '16', armazenamento: '512' } },
      ],
      scores: {
        desempenho: { score: 9.5, justification: 'Chip M4 com 10 núcleos de CPU e 10 de GPU e 16 GB de memória: sobra desempenho para trabalho, estudo e edição leve de foto e vídeo, sem ventoinha.' },
        tela_construcao: { score: 9, justification: 'Tela Liquid Retina de 13,6" com 2560 × 1664 e até 500 nits, corpo de alumínio fino (1,1 cm) e acabamento premium.' },
        bateria_portabilidade: { score: 10, justification: '1,24 kg e até 18 horas de autonomia anunciadas pela Apple: o mais leve e o de maior bateria da lista.' },
        confiabilidade_suporte: { score: 9, justification: 'Atualizações do macOS por muitos anos e boa revenda. Memória e SSD são soldados, então escolha a configuração certa na compra.' },
        custo_beneficio: { score: 7, justification: 'O mais caro da lista. Vale para quem usa o notebook o dia todo e quer bateria e desempenho de sobra; não tem HDMI e só tem 2 portas USB-C.' },
      },
      verdict: 'O melhor notebook da lista: desempenho de sobra, tela excelente, 1,24 kg e bateria para o dia inteiro, por um preço premium.',
      pros: ['Chip M4 rápido e silencioso (sem ventoinha)', 'Bateria de até 18 horas', 'Leve: 1,24 kg', 'Tela Liquid Retina de alta resolução', 'Atualizações do sistema por muitos anos'],
      cons: ['Preço alto', 'Só 2 portas USB-C e sem HDMI', 'Memória e SSD não podem ser ampliados'],
      recommendedFor: 'Quem trabalha ou estuda o dia todo longe da tomada e quer um notebook rápido, leve e durável.',
      avoidIf: 'Você depende de programas que só rodam no Windows, joga no computador ou tem orçamento limitado.',
      review: lexicalDoc([
        heading('h2', 'Desempenho'),
        paragraph(
          'O chip M4 tem 10 núcleos de CPU e 10 de GPU, e todas as versões vêm com pelo menos 16 GB de memória. Navegação, escritório, videochamadas e edição leve de foto e vídeo rodam com folga, sem ventoinha e em silêncio.',
        ),
        heading('h2', 'Tela e construção'),
        paragraph('A tela de 13,6" tem 2560 × 1664 pixels e brilho de até 500 nits. O corpo é de alumínio, com 1,1 cm de espessura.'),
        heading('h2', 'Bateria e portabilidade'),
        paragraph('Com 1,24 kg e bateria de 53,8 Wh, a Apple anuncia até 18 horas de uso. Ele carrega pelo MagSafe ou pelas portas USB-C.'),
        heading('h2', 'Vale a pena?'),
        paragraph(
          'Se o orçamento permite e você não depende de programas exclusivos do Windows, é o notebook mais equilibrado da lista. Escolha bem o armazenamento na compra: não dá para ampliar depois.',
        ),
      ]),
      faq: [
        { question: 'Dá para aumentar a memória ou o SSD depois?', answer: 'Não. Memória e armazenamento são soldados; escolha a configuração certa na compra.' },
        { question: 'Ele tem saída HDMI?', answer: 'Não. São 2 portas USB-C (Thunderbolt); para HDMI é preciso um adaptador.' },
      ],
      sources: [SRC.macFicha, SRC.macLancamento, SRC.exame],
    },
    {
      slug: GALAXY,
      name: 'Samsung Galaxy Book4 15,6"',
      brandSlug: 'samsung',
      specs: {
        processador: 'Intel Core i5-1335U (13ª geração)',
        ram_expansivel: 'não',
        placa_video: 'Integrada (Intel Iris Xe)',
        tela_tamanho: '15.6',
        tela_resolucao: '1920 × 1080 (Full HD, antirreflexo)',
        peso: '1.55',
        hdmi: 'sim',
        sistema: 'Windows 11',
      },
      variants: [
        { label: '16 GB / 512 GB', modelCode: 'NP750XGJ-KG2BR', isReference: true, specs: { memoria_ram: '16', armazenamento: '512' } },
        { label: '8 GB / 512 GB', modelCode: 'NP750XGJ-KG3BR', specs: { memoria_ram: '8', armazenamento: '512' } },
        { label: '8 GB / 256 GB', modelCode: 'NP750XGJ-KG4BR', specs: { memoria_ram: '8', armazenamento: '256' } },
      ],
      scores: {
        desempenho: { score: 7, justification: 'Core i5-1335U, processador de baixo consumo da 13ª geração: suficiente para escritório, estudo e multitarefa leve. Sem placa de vídeo dedicada.' },
        tela_construcao: { score: 7.5, justification: 'Tela Full HD de 15,6" com antirreflexo e corpo fino (1,5 cm), com acabamento acima da média da faixa.' },
        bateria_portabilidade: { score: 8, justification: '1,55 kg, leve para um notebook de 15,6", e processador de baixo consumo, que favorece a bateria.' },
        confiabilidade_suporte: { score: 8, justification: 'Ampla assistência Samsung no Brasil. A memória é soldada: prefira a versão de 16 GB.' },
        custo_beneficio: { score: 7.5, justification: 'Boa conectividade (HDMI, rede cabeada, 4 portas USB) e construção leve por preço intermediário.' },
      },
      verdict: 'Leve e bem conectado para trabalho e estudo: tela Full HD de 15,6", HDMI, rede cabeada e 1,55 kg; prefira a versão de 16 GB.',
      pros: ['Leve para o tamanho: 1,55 kg', 'Conexões completas: HDMI, rede cabeada, USB-C e 4 portas USB', 'Tela Full HD com antirreflexo', 'Wi-Fi 6'],
      cons: ['Memória soldada, sem upgrade', 'Sem placa de vídeo dedicada', 'Versões de 8 GB ficam limitadas com o tempo'],
      recommendedFor: 'Quem trabalha ou estuda com Windows, liga o notebook em monitor e rede cabeada e quer algo leve.',
      avoidIf: 'Você joga, edita vídeo ou pretende ampliar a memória no futuro.',
      review: lexicalDoc([
        heading('h2', 'Desempenho'),
        paragraph(
          'O Core i5-1335U é um processador de baixo consumo da 13ª geração. Para pacote Office, navegador com muitas abas, aulas e reuniões online, dá conta. A memória é soldada, por isso a versão de 16 GB é a mais recomendada.',
        ),
        heading('h2', 'Tela, construção e conexões'),
        paragraph(
          'A tela de 15,6" é Full HD com tratamento antirreflexo. O corpo tem 1,5 cm e 1,55 kg. As conexões são completas: HDMI, rede cabeada, USB-C, portas USB e leitor de cartão, além de Wi-Fi 6.',
        ),
        heading('h2', 'Vale a pena?'),
        paragraph('Para trabalho e estudo no Windows, sim, especialmente a versão de 16 GB. Para jogos ou edição pesada, procure um modelo com placa de vídeo dedicada.'),
      ]),
      faq: [{ question: 'Qual versão escolher?', answer: 'A de 16 GB de memória (NP750XGJ-KG2BR). Como a memória é soldada, não dá para ampliar depois.' }],
      sources: [SRC.galaxyFicha, SRC.galaxyLancamento, SRC.exame],
    },
    {
      slug: ASPIRE,
      name: 'Acer Aspire 5 A515-57',
      brandSlug: 'acer',
      specs: {
        processador: 'Intel Core i5-12450H (12ª geração)',
        ram_expansivel: 'sim',
        placa_video: 'Integrada (Intel UHD)',
        tela_tamanho: '15.6',
        tela_resolucao: '1920 × 1080 (Full HD, painel TN)',
        peso: '1.85',
        bateria_wh: '40',
        hdmi: 'sim',
        sistema: 'Windows 11',
      },
      variants: [
        { label: '8 GB / 512 GB', modelCode: 'A515-57-565J', isReference: true, specs: { memoria_ram: '8', armazenamento: '512' } },
        { label: '8 GB / 256 GB', modelCode: 'A515-57-55B8', specs: { memoria_ram: '8', armazenamento: '256' } },
      ],
      scores: {
        desempenho: { score: 7.5, justification: 'Core i5-12450H, processador da linha H com 8 núcleos: mais fôlego que os de baixo consumo em tarefas pesadas.' },
        tela_construcao: { score: 6, justification: 'Tela Full HD com painel TN, com cores e ângulos de visão inferiores aos de painéis IPS. Construção simples.' },
        bateria_portabilidade: { score: 6, justification: '1,85 kg e bateria de 40 Wh: o mais pesado e o de menor bateria da lista.' },
        confiabilidade_suporte: { score: 7.5, justification: 'Memória em slots, ampliável até 32 GB, o que estende a vida útil. Assistência Acer em todo o país.' },
        custo_beneficio: { score: 8.5, justification: 'Processador forte e possibilidade de upgrade por preço de entrada: bom investimento de longo prazo.' },
      },
      verdict: 'Processador forte e memória ampliável até 32 GB por preço baixo; em troca, é pesado, tem bateria modesta e tela de painel TN.',
      pros: ['Processador Core i5 da linha H, com 8 núcleos', 'Memória ampliável até 32 GB', 'Conexões completas, com rede cabeada e HDMI', 'Preço baixo para o desempenho'],
      cons: ['Tela de painel TN, com cores e ângulos limitados', 'Pesado (1,85 kg) e bateria de 40 Wh', 'Vem com só 8 GB de memória'],
      recommendedFor: 'Quem usa o notebook mais na mesa, quer desempenho e pretende ampliar a memória com o tempo.',
      avoidIf: 'Você carrega o notebook todo dia ou se importa com a qualidade da tela.',
      review: lexicalDoc([
        heading('h2', 'Desempenho e upgrade'),
        paragraph(
          'O Core i5-12450H tem 8 núcleos e foi feito para mais desempenho que os processadores de baixo consumo. A memória fica em slots e pode chegar a 32 GB: ampliar de 8 para 16 GB é o upgrade que mais faz diferença.',
        ),
        heading('h2', 'Tela e portabilidade'),
        paragraph('A tela Full HD usa painel TN, com cores mais lavadas e ângulos de visão limitados. Com 1,85 kg e bateria de 40 Wh, é um notebook mais para a mesa do que para a mochila.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para quem prioriza desempenho e longevidade, gasta pouco e trabalha perto da tomada, sim. Para quem se desloca muito, há opções mais leves.'),
      ]),
      faq: [{ question: 'Dá para colocar mais memória?', answer: 'Sim. A memória fica em slots e o modelo aceita até 32 GB.' }],
      sources: [SRC.aspireFicha, SRC.aspireLoja, SRC.techtudo],
    },
    {
      slug: IDEAPAD,
      name: 'Lenovo IdeaPad Slim 3 15IAH8',
      brandSlug: 'lenovo',
      specs: {
        processador: 'Intel Core i5-12450H (12ª geração)',
        ram_expansivel: 'não',
        placa_video: 'Integrada (Intel UHD)',
        tela_tamanho: '15.6',
        tela_resolucao: '1920 × 1080 (Full HD)',
        peso: '1.62',
        bateria_wh: '47',
        hdmi: 'sim',
        sistema: 'Windows 11',
      },
      variants: [
        { label: '8 GB / 512 GB', isReference: true, specs: { memoria_ram: '8', armazenamento: '512' } },
        { label: '16 GB / 512 GB', specs: { memoria_ram: '16', armazenamento: '512' } },
      ],
      scores: {
        desempenho: { score: 7.5, justification: 'Mesmo Core i5-12450H de 8 núcleos do Aspire 5, com memória LPDDR5 mais rápida: bom fôlego para multitarefa.' },
        tela_construcao: { score: 6.5, justification: 'Tela Full HD de 15,6" com brilho modesto e construção simples, porém firme, com 1,79 cm de espessura.' },
        bateria_portabilidade: { score: 7, justification: '1,62 kg e bateria de 47 Wh: mais leve e com mais bateria que o Aspire 5.' },
        confiabilidade_suporte: { score: 7.5, justification: 'Linha IdeaPad consolidada, com assistência Lenovo em todo o país. A memória é soldada.' },
        custo_beneficio: { score: 8.5, justification: 'Processador da linha H, SSD de 512 GB e boa portabilidade por preço de entrada.' },
      },
      verdict: 'O melhor custo-benefício: Core i5 de 8 núcleos, SSD de 512 GB e 1,62 kg por preço de entrada; só a memória não pode ser ampliada.',
      pros: ['Core i5 da linha H com 8 núcleos', 'Memória LPDDR5 rápida', 'SSD de 512 GB', 'Mais leve que o Aspire 5'],
      cons: ['Memória soldada, sem upgrade', 'Tela com brilho modesto'],
      recommendedFor: 'Estudantes e quem precisa de um notebook bom para trabalho, gastando pouco.',
      avoidIf: 'Você quer uma tela muito boa ou pretende ampliar a memória no futuro.',
      review: lexicalDoc([
        heading('h2', 'Desempenho'),
        paragraph(
          'O IdeaPad Slim 3 15IAH8 usa o Core i5-12450H de 8 núcleos, com memória LPDDR5 e SSD PCIe 4.0 de 512 GB. Para estudo, escritório e multitarefa, roda com folga. A memória é soldada, então a versão de 16 GB vale a diferença se couber no orçamento.',
        ),
        heading('h2', 'Tela e portabilidade'),
        paragraph('A tela é Full HD de 15,6", com brilho modesto. Pesa 1,62 kg e tem bateria de 47 Wh, mais leve e com mais bateria que outros notebooks de entrada desse tamanho.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Sim: é a melhor relação entre preço e desempenho desta lista para quem usa Windows.'),
      ]),
      faq: [{ question: 'Dá para ampliar a memória?', answer: 'Não. A memória LPDDR5 é soldada; se puder, escolha a versão de 16 GB.' }],
      sources: [SRC.ideapadFicha, SRC.ideapadSpecs, SRC.techtudo],
    },
  ],
  contents: [
    {
      type: 'melhores',
      slug: 'melhores-notebooks',
      title: 'Os melhores notebooks para comprar',
      summary:
        'O MacBook Air M4 é o melhor no geral; o Lenovo IdeaPad Slim 3 tem o melhor custo-benefício; o Samsung Galaxy Book4 é leve e bem conectado; e o Acer Aspire 5 é para quem quer ampliar a memória.',
      metaDescription: 'Os melhores notebooks do Brasil comparados por desempenho, tela, bateria, peso, suporte e preço, com notas por critério.',
      modelsAnalyzed: 4,
      picks: [
        { productSlug: MAC, profileLabel: 'Melhor no geral', position: 1, why: 'Chip M4, tela excelente, 1,24 kg e bateria de até 18 horas.' },
        { productSlug: IDEAPAD, profileLabel: 'Melhor custo-benefício', position: 2, why: 'Core i5 de 8 núcleos, SSD de 512 GB e 1,62 kg por preço de entrada.' },
        { productSlug: GALAXY, profileLabel: 'Para trabalho e estudo', position: 3, why: 'Leve, com tela antirreflexo e conexões completas: HDMI, rede cabeada e 4 portas USB.' },
        { productSlug: ASPIRE, profileLabel: 'Para ampliar a memória', position: 4, why: 'Memória em slots, até 32 GB, e processador forte por preço baixo.' },
      ],
      body: lexicalDoc([
        heading('h2', 'Como escolher'),
        paragraph(
          'Defina o uso principal: estudo e escritório pedem 16 GB de memória e SSD de 512 GB; jogos e edição de vídeo pedem placa de vídeo dedicada. Depois pese portabilidade (peso e bateria) contra preço.',
        ),
        paragraph('Repare se a memória é soldada: nesses modelos, compre já com a quantidade que vai precisar. Veja tudo no nosso guia de compra.'),
      ]),
      sources: [SRC.techtudo, SRC.exame, SRC.macFicha, SRC.ideapadFicha],
    },
    {
      type: 'comparativo',
      title: 'Samsung Galaxy Book4 ou Lenovo IdeaPad Slim 3: qual notebook comprar?',
      summary:
        'O IdeaPad Slim 3 tem processador mais forte e custa menos; o Galaxy Book4 é mais leve, tem mais conexões e oferece versão com 16 GB. Os dois têm memória soldada.',
      metaDescription: 'Galaxy Book4 ou IdeaPad Slim 3? Comparamos processador, memória, tela, peso, bateria, conexões e preço para você decidir.',
      comparedProductSlugs: [GALAXY, IDEAPAD],
      badges: [
        { productSlug: IDEAPAD, label: 'Melhor desempenho por real' },
        { productSlug: GALAXY, label: 'Mais leve e conectado' },
      ],
      chooseIf: [
        { productSlug: IDEAPAD, text: 'quer mais desempenho pagando menos' },
        { productSlug: GALAXY, text: 'carrega o notebook todo dia e usa HDMI, rede cabeada e muitas portas USB' },
      ],
      conclusion:
        'Para a maioria, o IdeaPad Slim 3 entrega mais desempenho por real. O Galaxy Book4 compensa para quem prioriza leveza e conexões e escolhe a versão de 16 GB.',
      body: lexicalDoc([
        heading('h2', 'Desempenho'),
        paragraph('O IdeaPad usa o Core i5-12450H, da linha H, com 8 núcleos; o Galaxy Book4, o Core i5-1335U, de baixo consumo. Em tarefas pesadas, o IdeaPad leva vantagem.'),
        heading('h2', 'Memória'),
        paragraph('Nos dois a memória é soldada. Escolha já na compra: 16 GB é o recomendado para durar mais anos.'),
        heading('h2', 'Portabilidade e conexões'),
        paragraph('O Galaxy Book4 pesa 1,55 kg; o IdeaPad, 1,62 kg. O Galaxy tem rede cabeada e mais portas USB, útil para quem trabalha com monitor e periféricos.'),
      ]),
      sources: [SRC.galaxyFicha, SRC.ideapadFicha, SRC.techtudo],
    },
    {
      type: 'guia',
      slug: 'como-escolher-notebook',
      title: 'Como escolher um notebook',
      summary:
        'Defina o uso, escolha processador e memória (16 GB para durar), SSD de 512 GB, tela Full HD IPS e equilibre peso e bateria com o preço. Fique atento à memória soldada.',
      metaDescription: 'Guia para escolher notebook: processador, quanto de memória, SSD, tela, peso e bateria, placa de vídeo e o que muda entre Windows e macOS.',
      body: lexicalDoc([
        heading('h2', 'Comece pelo uso'),
        paragraph(
          'Estudo, escritório e navegação: qualquer processador intermediário atual resolve. Edição de foto e vídeo e programação pesada: prefira processadores da linha H ou chips Apple. Jogos: só com placa de vídeo dedicada.',
        ),
        heading('h2', 'Memória RAM e armazenamento'),
        paragraph(
          'Hoje, 8 GB é o mínimo e 16 GB é o recomendado para o notebook durar anos sem travar. Em armazenamento, prefira SSD de 512 GB. Muitos modelos têm memória soldada: nesses, não dá para ampliar depois.',
        ),
        block({ blockType: 'tip', kind: 'dica', text: 'Entre mais processador e mais memória, no dia a dia quase sempre vale mais ter 16 GB de memória.' }),
        heading('h2', 'Tela'),
        paragraph('Full HD (1920 × 1080) é o padrão. Prefira painel IPS ou OLED, que têm cores e ângulos de visão melhores que o painel TN.'),
        heading('h2', 'Peso e bateria'),
        paragraph('Se você carrega o notebook todo dia, procure menos de 1,6 kg e bateria acima de 50 Wh. Para uso na mesa, peso e bateria pesam menos na escolha.'),
        heading('h2', 'Windows ou macOS?'),
        paragraph('O macOS dos MacBook tem ótima bateria e atualizações longas, mas nem todo programa (e quase nenhum jogo) roda nele. O Windows tem mais opções de modelos e preços.'),
        heading('h2', 'Comparação rápida dos modelos que analisamos'),
        block({ blockType: 'comparisonTable', productSlugs: [MAC, GALAXY, ASPIRE, IDEAPAD], attributes: [] }),
        block({
          blockType: 'faq',
          items: [
            { question: 'Notebook com 8 GB ainda vale a pena?', answer: 'Para uso leve, sim, se a memória puder ser ampliada depois. Se for soldada, prefira 16 GB.' },
            { question: 'SSD ou HD?', answer: 'Sempre SSD: o notebook liga e abre programas muito mais rápido.' },
          ],
        }),
      ]),
      sources: [SRC.techtudo, SRC.exame, SRC.aspireFicha, SRC.macFicha],
    },
    {
      type: 'entenda',
      slug: 'quanta-memoria-ram-notebook-precisa',
      title: 'Quanta memória RAM um notebook precisa?',
      summary:
        'Para navegar e estudar, 8 GB funcionam; para o notebook durar anos com muitas abas, reuniões e programas abertos, 16 GB é o recomendado. Memória soldada não pode ser ampliada.',
      metaDescription: 'Entenda quanta memória RAM você precisa no notebook: 8 GB, 16 GB ou mais, a diferença entre memória soldada e em slot e quando vale ampliar.',
      body: lexicalDoc([
        heading('h2', 'Para que serve a memória RAM'),
        paragraph(
          'A RAM guarda o que está aberto agora: abas, programas, videochamadas. Quando ela acaba, o sistema passa a usar o SSD como memória extra, que é muito mais lento, e o notebook começa a travar.',
        ),
        heading('h2', '8 GB ou 16 GB?'),
        block({
          blockType: 'sideBySide',
          leftTitle: '8 GB',
          leftText: 'Dá conta de navegação, texto e aulas online. Com muitas abas e reuniões ao mesmo tempo, começa a ficar no limite.',
          rightTitle: '16 GB',
          rightText: 'O recomendado hoje: multitarefa folgada, edição leve de foto e vídeo e vários anos sem travar.',
        }),
        heading('h2', 'Soldada ou em slot?'),
        paragraph(
          'Em muitos notebooks finos a memória é soldada na placa e não pode ser trocada. Em outros, ela fica em slots e pode ser ampliada com um pente novo. Antes de comprar um modelo de 8 GB, confira se ele aceita ampliação.',
        ),
      ]),
      sources: [SRC.techtudo, SRC.aspireFicha, SRC.galaxyFicha],
    },
  ],
}
