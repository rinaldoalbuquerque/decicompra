import { block, heading, lexicalDoc, paragraph } from '../lexical'
import type { EditorialPack, Source } from './types'

// Furadeiras e parafusadeiras (Fase 4). Pesquisa estruturada feita em 10/2026: fichas técnicas,
// manuais, lojas e listas especializadas. Revisão humana obrigatória antes de publicar (spec §9.1).

const SRC = {
  dewaltReview: {
    title: 'Analisa Melhor: furadeira e parafusadeira de impacto DeWalt DCD7781D2',
    url: 'https://analisamelhor.com.br/revisao-parafusadeira-e-furadeira-de-impacto-a-bateria-20v-max-brushless-dewalt-dcd7781d2',
  },
  dewaltFicha: {
    title: 'Ficha técnica da DeWalt DCD7781D2 (20V MAX brushless)',
    url: 'https://www.gigatools.ph/products/dewalt-dcd7781d2-13mm-20v-max-brushless-cordless-hammer-drill-driver-set',
  },
  boschGsbBlog: { title: 'Bosch Professional: furadeira GSB 185-LI, torque poderoso', url: 'https://www.bosch-professional.com/br/pt/blog/-furadeira-bosch-185-li-torque-poderoso/' },
  boschGsbLoja: {
    title: 'Casas Bahia: Bosch GSB 185-LI com 2 baterias (ficha e garantia)',
    url: 'https://www.casasbahia.com.br/furadeira-parafusadeira-de-impacto-1-2-quot-18v-2-baterias-carregador-gsb-185-li-bosch/p/1565374799',
  },
  boschGsrLoja: {
    title: 'Loja do Mecânico: Bosch GSR 1000 Smart 12V (ficha e garantia)',
    url: 'https://www.lojadomecanico.com.br/produto/320522/21/223/furadeira-parafusadeira-12v-gsr-1000-smart-38-pol-com-bateria-15ah-embutida-e-carregador-bivolt-bosch-06019f40e4-000/64184',
  },
  wapManual: { title: 'WAP: manual da BPF 12K3', url: 'https://mais.wap.ind.br/produtos/BPF-12K3/WAP-BPF-12K3-Manual-Rev.04.pdf' },
  wapReview: { title: 'Analisa Melhor: parafusadeira e furadeira WAP BPF 12K3', url: 'https://analisamelhor.com.br/revisao-parafusadeira-e-furadeira-a-bateria-wap-bpf-12k3-12v-li-ion' },
  maisVendida: { title: 'Loja Stander: qual é a parafusadeira mais vendida de 2026?', url: 'https://blog.lojastander.com.br/parafusadeira-mais-vendida/' },
  ranking: { title: 'Mestre das Ferramentas: melhores parafusadeiras 2026', url: 'https://mestredasferramentas.com.br/melhor-parafusadeira/' },
} satisfies Record<string, Source>

const DEWALT = 'dewalt-dcd7781d2'
const GSB = 'bosch-gsb-185-li'
const GSR = 'bosch-gsr-1000-smart'
const WAP = 'wap-bpf-12k3'

export const furadeiras: EditorialPack = {
  subcategorySlug: 'furadeiras-e-parafusadeiras',
  criteriaKeys: ['potencia_desempenho', 'ergonomia', 'durabilidade', 'suporte_pecas', 'custo_beneficio'],
  specTemplate: [
    { key: 'tensao', label: 'Tensão da bateria', type: 'number', unit: 'V', direction: 'higher', required: true, comparable: true, highlight: true, group: 'Desempenho' },
    { key: 'torque_max', label: 'Torque máximo', type: 'number', unit: 'Nm', direction: 'higher', required: true, comparable: true, highlight: true, group: 'Desempenho' },
    { key: 'rotacao_max', label: 'Rotação máxima', type: 'number', unit: 'rpm', direction: 'higher', comparable: true, group: 'Desempenho' },
    { key: 'impacto', label: 'Função impacto (alvenaria)', type: 'boolean', direction: 'higher', required: true, comparable: true, highlight: true, group: 'Desempenho' },
    { key: 'mandril', label: 'Mandril', type: 'number', unit: 'mm', direction: 'higher', comparable: true, group: 'Desempenho' },
    { key: 'motor_brushless', label: 'Motor sem escovas (brushless)', type: 'boolean', direction: 'higher', comparable: true, group: 'Durabilidade' },
    { key: 'bateria_ah', label: 'Capacidade da bateria', type: 'number', unit: 'Ah', direction: 'higher', comparable: true, group: 'Bateria' },
    { key: 'baterias_inclusas', label: 'Baterias inclusas', type: 'number', direction: 'higher', comparable: true, group: 'Bateria' },
    { key: 'bateria_removivel', label: 'Bateria removível', type: 'boolean', direction: 'higher', comparable: true, group: 'Bateria' },
    { key: 'peso', label: 'Peso', type: 'number', unit: 'kg', direction: 'lower', comparable: true, group: 'Ergonomia' },
    { key: 'garantia', label: 'Garantia', type: 'number', unit: 'meses', direction: 'higher', comparable: true, group: 'Suporte' },
  ],
  brands: [
    { slug: 'dewalt', name: 'DeWalt', officialSite: 'https://www.dewalt.com.br' },
    { slug: 'bosch', name: 'Bosch', officialSite: 'https://www.bosch-professional.com/br/pt/' },
    { slug: 'wap', name: 'WAP', officialSite: 'https://www.wap.ind.br' },
  ],
  products: [
    {
      slug: GSB,
      name: 'Bosch GSB 185-LI',
      brandSlug: 'bosch',
      specs: {
        tensao: '18',
        torque_max: '50',
        rotacao_max: '1900',
        impacto: 'sim',
        mandril: '13',
        motor_brushless: 'sim',
        bateria_ah: '2',
        baterias_inclusas: '2',
        bateria_removivel: 'sim',
        peso: '1.3',
        garantia: '24',
      },
      variants: [{ label: 'Kit com 2 baterias e carregador', isReference: true, specs: {} }],
      scores: {
        potencia_desempenho: { score: 9, justification: '18 V, 50 Nm de torque, duas velocidades (até 1.900 rpm) e impacto de 27.000 golpes por minuto: fura alvenaria e parafusa com folga.' },
        ergonomia: { score: 9, justification: 'Apenas 1,3 kg com bateria, compacta e equilibrada para trabalhar acima da cabeça.' },
        durabilidade: { score: 9, justification: 'Motor brushless, que dura mais e aproveita melhor a bateria, e construção da linha profissional da Bosch.' },
        suporte_pecas: { score: 9, justification: 'Garantia de 24 meses e baterias da plataforma 18 V da Bosch, compatíveis com outras ferramentas da marca.' },
        custo_beneficio: { score: 7.5, justification: 'Custa mais que as ferramentas de 12 V, mas entrega desempenho profissional com 2 baterias e 2 anos de garantia.' },
      },
      verdict: 'A melhor no geral: 18 V com motor brushless, impacto para alvenaria, 1,3 kg e 2 anos de garantia, para casa ou uso profissional.',
      pros: ['Motor brushless, mais durável', 'Impacto para furar alvenaria', 'Leve e compacta: 1,3 kg com bateria', '2 baterias de 2 Ah no kit', 'Garantia de 24 meses'],
      cons: ['Preço acima das 12 V', 'Torque menor que o da DeWalt DCD7781D2'],
      recommendedFor: 'Quem faz reformas, instala móveis e prateleiras em parede de alvenaria ou trabalha com a ferramenta todo dia.',
      avoidIf: 'Você só vai montar móveis de vez em quando: uma 12 V resolve e custa bem menos.',
      review: lexicalDoc([
        heading('h2', 'Potência'),
        paragraph(
          'São 18 V, torque de até 50 Nm e duas velocidades: até 500 rpm para parafusar com força e até 1.900 rpm para furar. A função impacto, de 27.000 golpes por minuto, permite furar tijolo e concreto leve.',
        ),
        heading('h2', 'Ergonomia e durabilidade'),
        paragraph('Pesa 1,3 kg com bateria. O motor brushless, sem escovas, gasta menos bateria e se desgasta menos com o tempo.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para quem usa com frequência, sim: une potência, leveza e 2 anos de garantia. As baterias servem em outras ferramentas 18 V da Bosch.'),
      ]),
      faq: [{ question: 'Fura concreto?', answer: 'Fura tijolo e concreto leve com a função impacto e broca de vídea. Para concreto muito duro, o ideal é um martelete.' }],
      sources: [SRC.boschGsbBlog, SRC.boschGsbLoja, SRC.ranking],
    },
    {
      slug: DEWALT,
      name: 'DeWalt DCD7781D2',
      brandSlug: 'dewalt',
      specs: {
        tensao: '20',
        torque_max: '65',
        rotacao_max: '1750',
        impacto: 'sim',
        mandril: '13',
        motor_brushless: 'sim',
        bateria_ah: '2',
        baterias_inclusas: '2',
        bateria_removivel: 'sim',
      },
      variants: [{ label: 'Kit com 2 baterias e carregador', modelCode: 'DCD7781D2', isReference: true, specs: {} }],
      scores: {
        potencia_desempenho: { score: 9.5, justification: 'O maior torque da lista (65 Nm), 15 ajustes de torque, duas velocidades e impacto de 29.750 golpes por minuto.' },
        ergonomia: { score: 8, justification: 'Compacta para a potência, mas um pouco mais pesada e robusta que a Bosch GSB 185-LI.' },
        durabilidade: { score: 9.5, justification: 'Motor brushless e construção da linha profissional DeWalt, feita para uso diário de eletricistas, instaladores e marceneiros.' },
        suporte_pecas: { score: 8.5, justification: 'Bateria da plataforma 20V MAX, compatível com dezenas de ferramentas DeWalt. Boa rede de assistência no Brasil.' },
        custo_beneficio: { score: 7, justification: 'Preço de ferramenta profissional. Compensa para quem trabalha com ela; para uso doméstico, é mais do que o necessário.' },
      },
      verdict: 'A mais potente: 65 Nm de torque, motor brushless e impacto para alvenaria, feita para uso profissional diário.',
      pros: ['Maior torque da lista: 65 Nm', 'Motor brushless', 'Impacto para alvenaria', '2 baterias de 2 Ah no kit', 'Plataforma 20V MAX com muitas ferramentas compatíveis'],
      cons: ['Preço alto para uso doméstico', 'Um pouco mais pesada que a Bosch GSB 185-LI'],
      recommendedFor: 'Profissionais e quem faz obras e reformas com frequência.',
      avoidIf: 'O uso é eventual, como montar móveis e pendurar quadros.',
      review: lexicalDoc([
        heading('h2', 'Potência'),
        paragraph(
          'Com 65 Nm de torque, é a mais forte desta lista. Tem duas velocidades (até 500 e até 1.750 rpm), 15 ajustes de torque e impacto de 29.750 golpes por minuto, com mandril de 13 mm.',
        ),
        heading('h2', 'Durabilidade e plataforma'),
        paragraph('O motor brushless e a construção profissional aguentam uso diário. As baterias 20V MAX servem em toda a linha de ferramentas a bateria da DeWalt.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para uso profissional, sim. Para casa, a Bosch GSB 185-LI entrega quase o mesmo resultado, é mais leve e vem com 2 anos de garantia.'),
      ]),
      faq: [{ question: '20 V é mais forte que 18 V?', answer: 'Na prática não: "20V MAX" é a tensão de pico da mesma bateria que outras marcas chamam de 18 V. Compare o torque.' }],
      sources: [SRC.dewaltReview, SRC.dewaltFicha, SRC.ranking],
    },
    {
      slug: GSR,
      name: 'Bosch GSR 1000 Smart',
      brandSlug: 'bosch',
      specs: {
        tensao: '12',
        torque_max: '15',
        rotacao_max: '700',
        impacto: 'não',
        motor_brushless: 'não',
        bateria_ah: '1.5',
        baterias_inclusas: '1',
        bateria_removivel: 'não',
        peso: '0.9',
        garantia: '12',
      },
      variants: [{ label: 'Com bateria embutida e carregador', isReference: true, specs: {} }],
      scores: {
        potencia_desempenho: { score: 5.5, justification: '15 Nm e até 700 rpm: ótima para parafusar e furar madeira fina, mas fraca para alvenaria.' },
        ergonomia: { score: 9.5, justification: 'A mais leve da lista (0,9 kg), compacta e fácil de usar para quem nunca teve uma ferramenta.' },
        durabilidade: { score: 7, justification: 'Bem construída, mas a bateria é embutida: quando ela se desgastar, a troca é mais difícil.' },
        suporte_pecas: { score: 8.5, justification: 'Garantia de 1 ano e ampla assistência da Bosch no Brasil.' },
        custo_beneficio: { score: 8, justification: 'Preço baixo para uma Bosch, e faz até 600 parafusamentos por carga em madeira macia.' },
      },
      verdict: 'A mais leve e fácil de usar: 0,9 kg, ótima para montar móveis e pequenos reparos, mas sem força para furar parede de alvenaria.',
      pros: ['A mais leve da lista: 0,9 kg', 'Muito fácil de usar', 'Até 600 parafusamentos por carga, segundo a Bosch', 'Marca com boa assistência'],
      cons: ['Torque baixo (15 Nm)', 'Sem impacto: não fura alvenaria', 'Bateria embutida, sem troca'],
      recommendedFor: 'Quem monta móveis, troca dobradiças e faz pequenos reparos em casa.',
      avoidIf: 'Você precisa furar parede de tijolo ou concreto.',
      review: lexicalDoc([
        heading('h2', 'Para que serve'),
        paragraph(
          'A GSR 1000 Smart é uma parafusadeira compacta de 12 V, com 15 Nm de torque e até 700 rpm. Ela é perfeita para montar móveis e apertar parafusos, mas não tem impacto: para furar alvenaria, não serve.',
        ),
        heading('h2', 'Uso e bateria'),
        paragraph('Pesa só 0,9 kg. A bateria de 1,5 Ah é embutida e carrega em cerca de 60 minutos; a Bosch indica até 600 parafusamentos por carga em madeira macia.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para montar móveis e pequenos reparos, sim. Se você também vai furar paredes, escolha um modelo com impacto.'),
      ]),
      faq: [{ question: 'Dá para furar parede?', answer: 'Não é indicada: ela não tem função impacto. Use uma furadeira de impacto para tijolo e concreto.' }],
      sources: [SRC.boschGsrLoja, SRC.ranking],
    },
    {
      slug: WAP,
      name: 'WAP BPF 12K3',
      brandSlug: 'wap',
      specs: {
        tensao: '12',
        torque_max: '17',
        rotacao_max: '740',
        impacto: 'não',
        mandril: '10',
        bateria_ah: '1.5',
        bateria_removivel: 'sim',
        peso: '1.1',
      },
      variants: [{ label: 'Kit com carregador, acessórios e maleta', modelCode: 'BPF 12K3', isReference: true, specs: {} }],
      scores: {
        potencia_desempenho: { score: 6.5, justification: '17 Nm, até 740 rpm e mandril de 10 mm: fura até 6 mm em aço e 20 mm em madeira. Sem impacto para alvenaria.' },
        ergonomia: { score: 7.5, justification: '1,1 kg e 18 níveis de ajuste de torque, que evitam espanar parafusos.' },
        durabilidade: { score: 6.5, justification: 'Construção simples, adequada ao uso doméstico eventual. Motor com escovas.' },
        suporte_pecas: { score: 7, justification: 'Marca nacional com assistência no país e carregador bivolt.' },
        custo_beneficio: { score: 9.5, justification: 'A parafusadeira mais vendida do Brasil em 2026: kit completo, com maleta e acessórios, por um preço muito baixo.' },
      },
      verdict: 'O melhor custo-benefício para casa: kit completo com maleta por preço baixo, ótimo para montar móveis e furar madeira.',
      pros: ['Preço muito baixo', 'Kit com maleta e acessórios', '18 níveis de torque', 'Carregador bivolt', 'Mandril de 10 mm'],
      cons: ['Sem impacto: não fura alvenaria', 'Torque baixo para trabalhos pesados', 'Motor com escovas, menos durável'],
      recommendedFor: 'Quem quer a primeira parafusadeira para montar móveis e pequenos reparos, gastando pouco.',
      avoidIf: 'Você vai furar paredes de tijolo ou concreto, ou usar a ferramenta todo dia.',
      review: lexicalDoc([
        heading('h2', 'Desempenho'),
        paragraph(
          'A BPF 12K3 tem 12 V, 17 Nm de torque e até 740 rpm, com mandril de 10 mm. Pelo manual, fura até 6 mm em aço e 20 mm em madeira. Não tem impacto, então não é indicada para alvenaria.',
        ),
        heading('h2', 'Uso'),
        paragraph('Pesa 1,1 kg e tem 18 níveis de torque, que ajudam a não espanar parafusos em móveis. O kit vem com carregador bivolt, acessórios e maleta.'),
        heading('h2', 'Vale a pena?'),
        paragraph('Para uso doméstico eventual, sim: é a escolha mais barata e completa desta lista.'),
      ]),
      faq: [{ question: 'Ela fura parede?', answer: 'Não é indicada para tijolo e concreto, porque não tem impacto. Fura madeira (até 20 mm) e aço (até 6 mm).' }],
      sources: [SRC.wapManual, SRC.wapReview, SRC.maisVendida],
    },
  ],
  contents: [
    {
      type: 'melhores',
      slug: 'melhores-furadeiras-parafusadeiras',
      title: 'As melhores furadeiras e parafusadeiras a bateria',
      summary:
        'A Bosch GSB 185-LI é a melhor no geral; a DeWalt DCD7781D2 é a mais potente; a WAP BPF 12K3 tem o melhor custo-benefício; e a Bosch GSR 1000 Smart é a mais leve para montar móveis.',
      metaDescription: 'As melhores furadeiras e parafusadeiras a bateria comparadas por potência, ergonomia, durabilidade, garantia e preço, com notas por critério.',
      modelsAnalyzed: 4,
      picks: [
        { productSlug: GSB, profileLabel: 'Melhor no geral', position: 1, why: '18 V brushless com impacto, 1,3 kg e 2 anos de garantia.' },
        { productSlug: DEWALT, profileLabel: 'Mais potente', position: 2, why: '65 Nm de torque e construção profissional para uso diário.' },
        { productSlug: WAP, profileLabel: 'Melhor custo-benefício', position: 3, why: 'Kit completo com maleta por preço muito baixo, para uso doméstico.' },
        { productSlug: GSR, profileLabel: 'Para montar móveis', position: 4, why: 'A mais leve e fácil de usar, ideal para parafusar.' },
      ],
      body: lexicalDoc([
        heading('h2', 'Como escolher'),
        paragraph(
          'Se você vai furar parede de tijolo ou concreto, precisa de função impacto e de 18 V ou mais. Para montar móveis e pequenos reparos, uma parafusadeira de 12 V resolve e custa bem menos.',
        ),
        paragraph('Motor brushless dura mais e economiza bateria. Kits com 2 baterias evitam paradas no meio do trabalho. Veja tudo no nosso guia de compra.'),
      ]),
      sources: [SRC.ranking, SRC.maisVendida, SRC.boschGsbBlog, SRC.dewaltReview],
    },
    {
      type: 'comparativo',
      title: 'Bosch GSB 185-LI ou DeWalt DCD7781D2: qual furadeira de impacto comprar?',
      summary:
        'A DeWalt tem mais torque (65 Nm contra 50 Nm); a Bosch é mais leve e tem 2 anos de garantia. Para a maioria, a Bosch é a escolha; para uso profissional pesado, a DeWalt.',
      metaDescription: 'Bosch GSB 185-LI ou DeWalt DCD7781D2? Comparamos torque, impacto, peso, bateria, garantia e preço das duas furadeiras de impacto.',
      comparedProductSlugs: [GSB, DEWALT],
      badges: [
        { productSlug: GSB, label: 'Vencedora geral' },
        { productSlug: DEWALT, label: 'Mais potente' },
      ],
      chooseIf: [
        { productSlug: GSB, text: 'quer leveza, 2 anos de garantia e potência de sobra para casa e reformas' },
        { productSlug: DEWALT, text: 'trabalha com a ferramenta todo dia e precisa do máximo de torque' },
      ],
      conclusion:
        'A Bosch GSB 185-LI vence pelo equilíbrio: leve, brushless, com impacto e 2 anos de garantia. A DeWalt DCD7781D2 é a escolha para uso profissional pesado, pelo torque maior e pela plataforma 20V MAX.',
      body: lexicalDoc([
        heading('h2', 'Potência'),
        paragraph('A DeWalt chega a 65 Nm e 29.750 golpes por minuto; a Bosch, 50 Nm e 27.000 golpes. As duas têm duas velocidades e mandril de 13 mm.'),
        heading('h2', 'Peso e uso'),
        paragraph('A Bosch pesa 1,3 kg com bateria e é mais confortável em trabalhos longos e acima da cabeça.'),
        heading('h2', 'Bateria e garantia'),
        paragraph('As duas vêm com 2 baterias de 2 Ah e motor brushless. A Bosch tem garantia de 24 meses informada pela loja.'),
      ]),
      sources: [SRC.boschGsbLoja, SRC.boschGsbBlog, SRC.dewaltReview, SRC.dewaltFicha],
    },
    {
      type: 'guia',
      slug: 'como-escolher-furadeira-parafusadeira',
      title: 'Como escolher uma furadeira ou parafusadeira a bateria',
      summary:
        'Para montar móveis, 12 V basta; para furar alvenaria, escolha 18 V ou mais com impacto. Compare torque, motor brushless, mandril, bateria removível e garantia.',
      metaDescription: 'Guia para escolher furadeira e parafusadeira a bateria: 12 V ou 18 V, torque, impacto para alvenaria, brushless, mandril, bateria e garantia.',
      body: lexicalDoc([
        heading('h2', 'Para que você vai usar?'),
        paragraph(
          'Montar móveis, trocar dobradiças e furar madeira: uma parafusadeira de 12 V resolve. Pendurar prateleiras e furar parede de tijolo ou concreto: escolha uma furadeira de impacto de 18 V ou mais.',
        ),
        heading('h2', 'Torque e velocidade'),
        paragraph(
          'O torque (em Nm) mede a força para apertar parafusos: até 20 Nm é uso leve; 40 Nm ou mais é uso pesado. Duas velocidades ajudam: baixa para parafusar, alta para furar.',
        ),
        heading('h2', 'Impacto, motor e mandril'),
        paragraph(
          'A função impacto é o que permite furar alvenaria. Motores brushless (sem escovas) duram mais e economizam bateria. Mandril de 13 mm aceita brocas maiores que o de 10 mm.',
        ),
        block({ blockType: 'tip', kind: 'dica', text: 'Prefira bateria removível e, se possível, um kit com duas: enquanto uma trabalha, a outra carrega.' }),
        heading('h2', 'Bateria e plataforma'),
        paragraph(
          'A capacidade em Ah indica quanto tempo a bateria dura. As baterias costumam servir em outras ferramentas da mesma marca e tensão, então vale pensar no que você pode querer comprar depois.',
        ),
        heading('h2', 'Comparação rápida dos modelos que analisamos'),
        block({ blockType: 'comparisonTable', productSlugs: [GSB, DEWALT, GSR, WAP], attributes: [] }),
        block({
          blockType: 'faq',
          items: [
            { question: '20 V é mais forte que 18 V?', answer: 'Não necessariamente: "20V MAX" é a tensão de pico de baterias equivalentes às de 18 V. Compare o torque.' },
            { question: 'Qual broca usar em parede?', answer: 'Broca de vídea, com a função impacto ligada. Para cerâmica e azulejo, comece sem impacto para não trincar.' },
          ],
        }),
      ]),
      sources: [SRC.ranking, SRC.boschGsbBlog, SRC.wapManual, SRC.dewaltReview],
    },
    {
      type: 'entenda',
      slug: 'parafusadeira-furadeira-ou-impacto-diferenca',
      title: 'Parafusadeira, furadeira ou furadeira de impacto: qual a diferença?',
      summary:
        'A parafusadeira aperta parafusos e fura madeira; a furadeira fura com mais velocidade; a furadeira de impacto também martela a broca para furar tijolo e concreto.',
      metaDescription: 'Entenda a diferença entre parafusadeira, furadeira e furadeira de impacto, o que cada uma faz e qual escolher para o seu tipo de trabalho.',
      body: lexicalDoc([
        heading('h2', 'A diferença em uma frase'),
        block({
          blockType: 'sideBySide',
          leftTitle: 'Parafusadeira',
          leftText: 'Controla a força (torque) para apertar parafusos sem espanar. Também fura madeira e metal fino.',
          rightTitle: 'Furadeira de impacto',
          rightText: 'Além de girar, "martela" a broca milhares de vezes por minuto, o que permite furar tijolo e concreto.',
        }),
        heading('h2', 'E as furadeiras e parafusadeiras 2 em 1?'),
        paragraph(
          'A maioria dos modelos a bateria faz as duas coisas: tem ajuste de torque para parafusar e velocidade alta para furar. Os que têm a função impacto acrescentam a capacidade de furar alvenaria.',
        ),
        heading('h2', 'Qual escolher?'),
        paragraph('Só monta móveis e faz pequenos reparos? Parafusadeira de 12 V. Vai pendurar coisas na parede ou fazer reforma? Furadeira e parafusadeira de impacto de 18 V.'),
      ]),
      sources: [SRC.ranking, SRC.boschGsbBlog],
    },
  ],
}
