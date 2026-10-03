# DeciCompra: Especificação de Design (v1)

**Slogan:** Compare. Entenda. Decida.
**Data:** 03/10/2026
**Status:** aguardando revisão do responsável pelo projeto

---

## 0. Resumo das decisões

| Tema | Decisão |
|---|---|
| Natureza | Portal de conteúdo, comparação, análise e recomendação. **Não é loja**: sem checkout e sem venda |
| Público | Brasil, português, preços em reais |
| Monetização v1 | Links de afiliado (Amazon, Mercado Livre, Shopee; outros depois) e, após aprovação, Google AdSense |
| Produção de conteúdo | Pesquisa (sem testes físicos), com apoio de IA e revisão humana obrigatória. O uso de IA é declarado publicamente |
| Autoria | Marca "Equipe DeciCompra". Sem autores fictícios. A estrutura de autores já existe para pessoas reais no futuro |
| Responsável legal | Pessoa física (identificada nominalmente apenas na Política de Privacidade, como controlador LGPD) |
| Stack | Next.js + Payload CMS 3 (TypeScript, projeto único) + PostgreSQL (Neon) + Cloudflare R2 (imagens) + Vercel |
| Preços | **Faixa de preço** + data "verificado em" + botão "Ver na {loja}". Sem preço exato na v1 |
| Variações | Produto "família" com variantes (tamanho, voltagem etc.) |
| Produto × análise | Uma única URL por produto. A análise editorial fica no próprio produto |
| Comparativos | Produto × produto (estruturado). Comparativos conceituais (OLED vs QLED) são conteúdos "Entenda" |
| Newsletter | Fora da v1 |
| Domínio | decicompra.com.br (a registrar) |
| Lançamento | 5 categorias, cada uma com 1 subcategoria âncora bem coberta |

---

## 1. Visão e posicionamento

O DeciCompra ajuda pessoas a tomar decisões de compra melhores. Ele atende três necessidades:

- **A. "Estou procurando um produto"**: busca e navegação por categoria
- **B. "Estou em dúvida entre alguns produtos"**: comparativos
- **C. "Não sei qual comprar"**: listas de melhores, guias e conteúdo educativo

A jornada é **Pesquisar → Comparar → Entender → Decidir → Comprar** (na loja externa).

Toda página segue o princípio de **dois níveis: Resumo rápido → Análise completa**. A resposta vem primeiro e os detalhes depois, para quem quiser aprofundar.

O site deve parecer um **portal especializado e confiável**: nem vitrine de ofertas nem blog genérico. Os links de afiliado são parte transparente da experiência, nunca o centro dela.

---

## 2. Escopo

### 2.1 Dentro da v1
- Site público com todos os templates da seção 6
- Painel administrativo (Payload) com o modelo de dados da seção 4 e o fluxo editorial da seção 8
- Redirecionamento centralizado de afiliados (`/ir/{oferta}`)
- Busca interna (PostgreSQL full-text)
- SEO técnico completo (seção 11)
- Aviso de cookies com Google Consent Mode v2, GA4 e Search Console
- Espaços de anúncio implementados e **desligados** até a aprovação do AdSense
- Páginas institucionais e legais com texto redigido
- Backup semanal do banco

### 2.2 Fora da v1 (backlog na seção 16)
Contas de usuário, comentários e avaliações de usuários, histórico de preços, alertas de preço, preços automáticos por API, verificador automático de links, comparador interativo livre, quiz/assistente de decisão, newsletter, geração de texto por IA dentro do painel, publicidade direta, conteúdo patrocinado ativo, busca externa (Algolia/Meilisearch), múltiplos idiomas.

---

## 3. Arquitetura de informação

### 3.1 Taxonomia
Árvore de **2 níveis**: Categoria → Subcategoria. Novas categorias e subcategorias são criadas pelo painel, sem programação.

| Categoria | Subcategoria âncora (lançamento) | Outras subcategorias previstas |
|---|---|---|
| Casa & Eletrodomésticos | **Ar-condicionado** | Geladeiras, Máquinas de lavar, Micro-ondas, Fornos, Aspiradores, Climatizadores |
| Ferramentas & Equipamentos | **Furadeiras e parafusadeiras** | Serras, Compressores, Lavadoras de alta pressão, Ferramentas manuais |
| Eletroportáteis | **Air fryers** | Cafeteiras, Liquidificadores, Batedeiras, Panelas elétricas, Sanduicheiras, Processadores |
| Tecnologia | **Notebooks** | Computadores, Monitores, Impressoras, Celulares, Tablets, Acessórios, Roteadores, Armazenamento |
| TVs & Entretenimento | **Smart TVs** | Soundbars, Projetores, Acessórios |

**Regra:** uma subcategoria sem nenhum conteúdo publicado não aparece em menus nem na home, e fica fora do Google (`noindex`, fora do sitemap).

### 3.2 URLs
As URLs são organizadas **por tipo de conteúdo**, curtas e estáveis. A hierarquia aparece nos breadcrumbs, não no endereço. Os slugs são sempre minúsculos, sem acentos e separados por hífen.

| Página | URL |
|---|---|
| Início | `/` |
| Categoria | `/{categoria}/` ex.: `/tvs-e-entretenimento/` |
| Subcategoria (hub) | `/{categoria}/{subcategoria}/` ex.: `/tvs-e-entretenimento/smart-tvs/` |
| Produto (ficha + análise) | `/produtos/{produto}/` ex.: `/produtos/lg-c4/` |
| Melhores | `/melhores/{slug}/` |
| Comparativo | `/comparar/{a}-vs-{b}/` (ou `{a}-vs-{b}-vs-{c}`) |
| Guia | `/guias/{slug}/` |
| Entenda (educativo/conceitual) | `/entenda/{slug}/` |
| Marca | `/marcas/{marca}/` |
| Autor | `/autores/{autor}/` |
| Índices | `/categorias/`, `/melhores/`, `/comparar/`, `/guias/`, `/entenda/`, `/marcas/` |
| Busca | `/busca?q=` (noindex) |
| Saída para loja | `/ir/{idOferta}` (redirecionamento, bloqueado para robôs) |
| Institucionais | `/sobre/`, `/contato/`, `/como-avaliamos/`, `/politica-editorial/`, `/divulgacao-de-afiliados/`, `/publicidade-e-transparencia/`, `/privacidade/`, `/cookies/`, `/termos/` |
| Painel | `/admin` |

**URL canônica de comparativo:** os slugs dos produtos são ordenados alfabeticamente e unidos por `-vs-`. Qualquer outra ordem redireciona (301) para a canônica. Não podem existir dois comparativos com o mesmo conjunto de produtos.

**Mudança de slug** em documento publicado cria automaticamente um redirecionamento 301 da URL antiga.

### 3.3 Inventário de páginas
Home · Categoria · Subcategoria · Produto · Comparativo · Melhores · Guia · Entenda · Marca · Autor · Busca · 404 · índices (Categorias, Melhores, Comparativos, Guias, Entenda, Marcas) · Sobre · Contato · Como avaliamos · Política Editorial (inclui a Política de Correções) · Divulgação de Afiliados · Publicidade e Transparência · Privacidade · Cookies · Termos de Uso.

---

## 4. Modelo de dados

Os identificadores no código ficam em inglês. Os rótulos no painel e no site ficam em português. Abaixo, os nomes usados são os do painel.

### 4.1 Categoria
`nome`, `slug`, `descrição` (texto introdutório do hub), `ícone`, `ordem`, `ativa`, `pai` (vazio = categoria; preenchido = subcategoria).

Campos exclusivos de **subcategoria**:
- `âncora` (booleano; destaque na home)
- `modeloDeEspecificações`: lista de atributos (4.2)
- `critérios`: lista de critérios de nota (4.3)

### 4.2 Atributo de especificação (dentro da subcategoria)
| Campo | Descrição |
|---|---|
| `chave` | identificador estável (ex.: `taxa_atualizacao`) |
| `rótulo` | "Taxa de atualização" |
| `tipo` | número · texto · booleano · opção (lista fechada) |
| `unidade` | "Hz", "W", "L"… (opcional) |
| `opções` | para o tipo opção |
| `grupo` | agrupamento na tabela (ex.: "Imagem", "Conectividade") |
| `direção` | maior é melhor · menor é melhor · neutro (usado para destacar o vencedor nas tabelas) |
| `destaque` | aparece nos cards e no resumo |
| `comparável` | aparece nas tabelas comparativas |
| `obrigatório` | exigido para publicar o produto |
| `porVariante` | o valor pode diferir entre variantes (ex.: tamanho, consumo) |

### 4.3 Critério de nota (dentro da subcategoria)
`nome`, `descrição` (exibida em "Como avaliamos" e nas páginas), `peso` (%).
**Validação:** a soma dos pesos da subcategoria deve ser exatamente 100.

### 4.4 Marca
`nome`, `slug`, `logo`, `descrição`, `siteOficial`.

### 4.5 Produto
| Grupo | Campos |
|---|---|
| Identificação | `nome` (ex.: "LG C4"), `slug`, `marca`, `subcategoria`, `imagens` (1+; a primeira é a principal) |
| Variantes | lista com **pelo menos 1** variante: `rótulo` (ex.: `55"`), `códigoDoModelo` (ex.: OLED55C4PSA), `voltagem` (opcional), valores dos atributos `porVariante`, `referência` (booleano; exatamente uma variante é a de referência) |
| Especificações | valores dos atributos não-`porVariante` |
| Notas | nota 0–10 (uma casa decimal) por critério da subcategoria + `justificativa` curta por critério |
| Nota DeciCompra | **calculada**, não editável (regra 5.1) |
| Resumo | `veredito` (uma frase), `prós` (3–6), `contras` (2–5), `indicadoPara`, `eviteSe` |
| Análise | `análiseCompleta` (texto rico com blocos), `fontes` (lista título + URL), `faq` (pergunta/resposta) |
| Datas | `publicadoEm`, `revisadoEm` |
| SEO | `metaTítulo`, `metaDescrição`, `imagemOG` (opcional; os padrões são gerados automaticamente) |
| Status | **rascunho** · **ficha** (aparece em listas e comparativos; página `noindex`, fora do sitemap) · **análise** (página completa e indexada) |

As **ofertas** pertencem às variantes (4.7). Um produto sem variações tem uma única variante.

### 4.6 Loja
`nome`, `slug`, `logo`, `programaDeAfiliados` (texto), `ativa`, `observações` (regras do programa, ex.: "não exibir preço").

### 4.7 Oferta (único lugar onde links e preços são editados)
| Campo | Descrição |
|---|---|
| `id` | identificador curto usado em `/ir/{id}` |
| `produto` + `variante` | a que se refere |
| `loja` | Amazon, Mercado Livre… |
| `url` | URL comum da página na loja |
| `urlAfiliado` | URL com rastreamento (destino real do redirecionamento) |
| `preçoMín` / `preçoMáx` | faixa observada, em reais |
| `verificadoEm` | data da última conferência |
| `status` | ativa · indisponível |
| `observações` | informações adicionais internas |

### 4.8 Conteúdo
Uma coleção única com o campo **tipo**: **Melhores · Comparativo · Guia · Entenda**. A análise de produto não é um "Conteúdo": ela vive no Produto (4.5).

Campos comuns: `título`, `slug`, `tipo`, `subcategoriaPrincipal` (obrigatória), `subcategoriasRelacionadas`, `resumoRápido` (obrigatório), `corpo` (texto rico com blocos, 4.9), `fontes` (1+), `autor`, `publicadoEm`, `revisadoEm`, SEO (como no produto), `status` (rascunho · em revisão · publicado · agendado), `patrocinado` (booleano; só permitido em Guia e Entenda; na v1 fica desabilitado na interface), `produtosReferenciados` (oculto e calculado ao salvar, ver 5.6).

Campos por tipo:
- **Melhores:** `escolhas` (3–10 itens: `produto`, `variante` opcional, `rótulo de perfil` livre, ex.: "Melhor custo-benefício", `posição`, `porQue`), `tambémConsideramos` (produto + motivo), `modelosAnalisados` (número exibido no topo)
- **Comparativo:** `produtos` (2–3, **mesma subcategoria**), `selos` (rótulo por produto, ex.: "Vencedora geral"), `escolhaSe` (uma frase por produto), `ajustesDeEspecificação` (por atributo: vencedor manual ou "sem vencedor", com justificativa), `conclusão`
- **Guia** e **Entenda:** apenas os campos comuns

### 4.9 Blocos disponíveis no texto rico
Card de produto · Botão de oferta · Tabela comparativa (2–5 produtos da mesma subcategoria + atributos escolhidos) · Lado a lado conceitual (duas colunas de texto, sem notas nem lojas) · Dica/Aviso · FAQ · Imagem (alt obrigatório) · Tabela simples.

Os blocos que mostram produtos **guardam apenas a referência**. Nome, nota, imagem, faixa de preço e link são lidos do Produto e da Oferta na hora de gerar a página.

### 4.10 Demais coleções
- **Autor:** `nome`, `slug`, `bio`, `imagem`. Na v1 existe apenas "Equipe DeciCompra".
- **Mídia:** imagem + `alt` (obrigatório) + `crédito/fonte`. O upload gera automaticamente versões WebP de 320, 640 e 1280 px.
- **Redirecionamento:** `de`, `para`, `tipo` (301). É criado automaticamente na mudança de slug e também pode ser criado manualmente.
- **Usuário:** `nome`, `e-mail`, `papel` (Administrador · Editor · Redator).

### 4.11 Configurações globais
- **Página inicial:**
  - chips de sugestão da busca (texto + link)
  - cartões "O que você está procurando?" (6–12 subcategorias)
  - comparativos em destaque (3–6)
  - melhores em destaque (4–8)
  - guias em destaque (3–6)
  - entenda em destaque (3–6)
- **Site:**
  - menu principal e colunas do rodapé
  - texto curto do aviso de afiliados
  - `anúnciosLigados` (booleano), ID do cliente AdSense e IDs de cada espaço
  - ID do GA4
  - conteúdo do `ads.txt`
  - e-mail de destino do formulário de contato

---

## 5. Regras de negócio

### 5.1 Nota DeciCompra
- Nota final = média ponderada das notas por critério pelos pesos da subcategoria, arredondada para 1 casa decimal.
- Todos os critérios precisam ter nota para o produto sair de "rascunho".
- Quando os pesos de uma subcategoria mudam, as notas de todos os seus produtos são recalculadas e as páginas afetadas são regeradas.
- Faixas: **9–10** Excepcional · **8–8,9** Muito bom · **7–7,9** Bom · **6–6,9** Regular · **< 6** Não recomendado.

### 5.2 Faixa de preço exibida
- **Para uma variante:** menor `preçoMín` até maior `preçoMáx` entre as ofertas **ativas** dela. A data exibida é a `verificadoEm` mais antiga entre essas ofertas.
- **Em cards, listas e comparativos:** usa a **variante de referência**.
- Se a oferta mais antiga foi verificada **há mais de 60 dias**, a faixa é ocultada e só os botões "Ver preço na {loja}" aparecem.
- **Sem oferta ativa:** "Indisponível no momento" e nenhum botão.
- **Formato:** "R$ 4.300 – R$ 5.100 · verificado em 03/10/2026".

### 5.3 Redirecionamento `/ir/{id}`
- **Oferta ativa:** redirecionamento **302** para `urlAfiliado`, com cabeçalho `X-Robots-Tag: noindex`.
- **Oferta inexistente ou indisponível:** 302 para a página do produto.
- **Links para `/ir/`:** sempre com `rel="sponsored nofollow noopener"` e `target="_blank"`.
- **`robots.txt`:** bloqueia `/ir/`.
- **Clique em botão de oferta:** dispara o evento de analytics `clique_oferta` (loja, produto, tipo de página), respeitando o consentimento.

### 5.4 Vencedores no comparativo
- **Por critério:** vence o produto com a maior nota naquele critério; igualdade = empate. Não há ajuste manual. Para mudar o vencedor, muda-se a nota, o que mantém a consistência com a página do produto.
- **Por atributo de especificação:** sugerido pela `direção` do atributo (neutro = sem destaque). O editor pode sobrescrever atributo a atributo, com justificativa obrigatória.
- **Selos gerais** ("Vencedora geral", "Melhor custo-benefício"…): definidos pelo editor.
- **Placar** exibido: número de critérios vencidos por produto.

### 5.5 Indexação
| Documento | Indexado quando |
|---|---|
| Produto | status = análise |
| Conteúdo | status = publicado |
| Subcategoria / Categoria | tem ao menos 1 item publicado |
| Marca | tem ao menos 3 itens publicados (produtos em análise ou conteúdos que a referenciam) |
| Autor, índices, institucionais | sempre |
| Busca, `/ir/`, `/admin`, `/api` | nunca |

Documentos não indexáveis recebem `noindex` e ficam fora do sitemap.

### 5.6 Atualização das páginas (revalidação)
- As páginas são geradas estaticamente e servidas pela CDN.
- Ao salvar qualquer documento, o sistema regera somente as páginas afetadas.
- Para isso, cada Conteúdo guarda em `produtosReferenciados` os produtos usados em blocos e campos. Ao alterar um **Produto** ou uma **Oferta**, são regeradas:
  - a página do produto
  - todos os conteúdos que o referenciam
  - os hubs da subcategoria e da marca
  - a home, se ele aparecer nela
- Trocar a `urlAfiliado` vale imediatamente, porque `/ir/` é dinâmico.

### 5.7 Checklist de publicação
A publicação de Produto (status análise) ou Conteúdo é bloqueada se faltar algum destes itens:
- meta descrição (pode ser a gerada automaticamente, desde que tenha 70–160 caracteres)
- ao menos 1 fonte
- data de revisão
- `alt` em todas as imagens
- resumo rápido (Conteúdo) ou veredito + prós + contras (Produto)
- notas completas (Produto)
- 3+ escolhas (Melhores)
- 2+ produtos da mesma subcategoria (Comparativo)

### 5.8 Revisão periódica
Conteúdos e produtos com `revisadoEm` há mais de 6 meses aparecem na tela "Conteúdos a revisar". A data de revisão é sempre exibida na página.

---

## 6. Templates de página

Princípios comuns:
- Cabeçalho com logo, menu e busca. Na home, a busca do cabeçalho só aparece após rolar além da busca principal.
- Breadcrumbs em todas as páginas internas.
- Linha de transparência no topo de páginas com ofertas: "Revisado em {data} · Equipe DeciCompra · Podemos receber comissão (saiba mais)".
- Mobile-first.

### 6.1 Página inicial (aprovada: versão 2)
1. **Cabeçalho:** logo · Categorias ▾ · Melhores · Comparativos · Guias · Entenda · (busca ao rolar)
2. **Topo** escuro (azul profundo, ocupando a largura toda):
   - linha "Análises independentes · Não vendemos produtos"
   - título "Compare. Entenda. **Decida.**", com "Decida." em verde
   - texto de apoio
   - busca grande com botão verde
   - chips de sugestão
   - três atalhos: 🔎 Procurando um produto (→ /categorias/) · ⚖️ Em dúvida entre modelos (→ /comparar/) · 💡 Não sei qual comprar (→ /melhores/)

   No desktop há uma imagem de produtos à direita (WebP otimizada, carregamento prioritário). No celular a imagem não aparece.
3. **"O que você está procurando?"**: cartões de subcategorias escolhidas no painel (ícone, nome, descrição curta), com uma linha abaixo listando as 5 categorias
4. Comparativos em destaque
5. Melhores do momento
6. Espaço de anúncio (único na home, abaixo da dobra)
7. Guias de compra
8. Análises recentes (automático: produtos com status análise, por data)
9. Entenda antes de comprar
10. Faixa de confiança: Independente · Critérios públicos · Transparente · Atualizado
11. Rodapé em 5 colunas: marca + "Não vendemos produtos" · Categorias · Conteúdo · Sobre · Transparência (inclui "Preferências de cookies")

### 6.2 Categoria
Introdução, grade de subcategorias, destaques (melhores, comparativos e guias de todas as subcategorias) e links para os índices.

### 6.3 Subcategoria (hub principal de SEO)
1. Introdução editorial
2. Lista "Melhores" principal em destaque
3. Guias
4. Comparativos
5. Produtos analisados (grade com nota e faixa de preço, paginada com 24 por página)
6. Entenda
7. Critérios de avaliação da subcategoria (com link para "Como avaliamos")

### 6.4 Produto (aprovado: duas colunas com caixa de decisão fixa)
- **Coluna principal:**
  1. **Resumo rápido**: imagem, nome, Nota DeciCompra, data de revisão, veredito, prós/contras, indicado para / evite se
  2. Índice da página
  3. Notas por critério, com justificativas
  4. Especificações agrupadas (com seletor de variante)
  5. Análise completa
  6. Alternativas e comparativos relacionados (automático: comparativos e listas que o referenciam + produtos da mesma subcategoria com nota próxima)
  7. FAQ
  8. Fontes
- **Coluna lateral fixa (desktop):** caixa "Onde comprar" com seletor de variante, faixa de preço, data, botões por loja e aviso de comissão. Abaixo dela, o espaço de anúncio lateral.
- **Celular:** coluna única. Uma barra fixa no rodapé mostra "nota · faixa · Ver lojas" e abre a caixa de lojas.
- Espaço de anúncio entre as seções 3 e 5.

### 6.5 Comparativo (aprovado)
1. **Veredito rápido:** produtos lado a lado com imagem, nota, selo, faixa de preço, botão e um resumo de uma frase
2. **"Escolha qual se…"**
3. **Quem vence em cada critério:** tabela de notas com o vencedor destacado e o placar
4. **Especificações lado a lado:** geradas a partir dos atributos `comparável`, com o vencedor destacado, a opção "mostrar só diferenças" e cabeçalho fixo ao rolar no celular
5. Análise detalhada por critério (seções expansíveis)
6. Conclusão + botões das lojas
7. Outros comparativos · listas relacionadas · FAQ

No celular, uma barra fixa no rodapé dá acesso às lojas de cada produto. Há espaço de anúncio entre as seções 3 e 4 e após a 5. São 2 produtos por padrão e 3 no máximo.

### 6.6 Melhores (aprovado)
1. Título com o ano e a linha "N modelos analisados · M selecionados · Como avaliamos"
2. **Nossas escolhas em resumo:** rótulo de perfil, produto, nota, faixa, botão
3. Tabela comparativa rápida (automática)
4. Cada escolha em detalhe: posição, por que escolhemos, prós/contras, indicado para, links para a análise e para os comparativos
5. Também consideramos
6. Como escolher (resumo + link para o guia)
7. Como escolhemos estes produtos (critérios e pesos da subcategoria + fontes)
8. FAQ e links relacionados

No máximo 1 espaço de anúncio a cada 3 blocos de escolha, e nunca dentro do bloco 2.

### 6.7 Guia e Entenda
- Título, linha de transparência, **resumo rápido** em destaque, índice, corpo com blocos, fontes e conteúdos relacionados.
- Anúncios entre seções longas, no máximo 1 a cada 3–4 seções.
- **Entenda** usa o bloco "Lado a lado conceitual" para comparações como OLED vs QLED, sem notas e sem lojas.

### 6.8 Marca, Autor, Índices
- **Marca:** descrição + produtos analisados + conteúdos que a referenciam
- **Autor:** bio + conteúdos
- **Índices:** listas paginadas (24 por página) filtráveis por categoria

### 6.9 Busca
- **Sugestões instantâneas no cabeçalho:** a partir de 2 caracteres, até 6 itens agrupados por tipo
- **Página `/busca`:** resultados agrupados (Produtos · Comparativos · Melhores · Guias e Entenda · Marcas · Subcategorias)
- **Tolerância:** ignora acentos e maiúsculas e aceita prefixos
- **Sem resultados:** sugestões e categorias

### 6.10 404
Mensagem, busca, categorias e conteúdos populares.

### 6.11 Contato
- **Campos:** nome, e-mail, assunto (Dúvida · Correção de conteúdo · Parcerias/Publicidade · Privacidade · Outro), mensagem
- **Envio:** por e-mail ao endereço configurado. **Nenhum dado é armazenado no banco.**
- **Anti-spam:** campo honeypot + limite de envios por IP

### 6.12 Institucionais
Textos redigidos pelo desenvolvimento e revisados pelo responsável. Recomenda-se revisão jurídica antes da monetização.

| Página | Conteúdo essencial |
|---|---|
| Sobre | Missão, o que o DeciCompra é e não é, como se mantém financeiramente |
| Como avaliamos | Seção 9 desta spec |
| Política Editorial | Processo (pesquisa → redação com apoio de IA → revisão humana → publicação → revisão periódica), independência, fontes, **política de correções** |
| Divulgação de Afiliados | Como funcionam os links, possibilidade de comissão, ausência de custo extra ao usuário, independência das notas, lojas atuais |
| Publicidade e Transparência | Política de anúncios, regras para eventual conteúdo patrocinado (seção 10.4) |
| Privacidade | Controlador (nome do responsável + e-mail), dados tratados, finalidades, bases legais, cookies, terceiros (Google), direitos do titular, canal de privacidade |
| Cookies | Categorias, lista de cookies, como alterar preferências |
| Termos de Uso | Natureza informativa, ausência de venda, limitação de responsabilidade sobre preços e disponibilidade nas lojas |

---

## 7. Identidade visual e interface

### 7.1 Tokens de cor
| Token | Cor | Uso |
|---|---|---|
| `azul-profundo` | #172554 | Fundo do topo, cabeçalho, rodapé, títulos |
| `azul-eletrico` | #2563EB | Links, navegação, **botões de loja**, destaques de interface |
| `verde` | #16A34A | Decisão e positivo em **elementos grandes, ícones e decoração** ("Decida.", selos, ✔ dos prós) |
| `verde-texto` | #15803D | Verde para **texto pequeno e fundos de botão com texto branco** (garante contraste AA) |
| `cinza-claro` | #F1F5F9 | Fundo de seções e do resumo rápido |
| `branco` | #FFFFFF | Superfícies |
| `texto` | #0F172A | Texto principal |
| `texto-suave` | #475569 | Texto secundário (nunca mais claro que isso sobre branco) |
| `negativo` | #DC2626 | ✘ dos contras |

**Motivo do `verde-texto`:** o #16A34A com texto branco tem contraste de cerca de 3,3:1, abaixo do mínimo AA (4,5:1) para texto normal. Toda combinação de cores é verificada contra WCAG 2.2 AA.

### 7.2 Tipografia
**Manrope** (títulos, logo; pesos 700–800) e **Inter** (texto; 400–600), auto-hospedadas.

| Elemento | Desktop | Celular |
|---|---|---|
| Título do topo da home | 56–64 px | 36 px |
| H1 de página | 40 px | 28 px |
| Texto de apoio do topo | 18–20 px | 16 px |
| Corpo | 17–18 px | 16 px |

### 7.3 Layout
- **Conteúdo:** até ~1280 px de largura, centralizado. Fundos de seção ocupam a largura total.
- **Margem lateral no celular:** 16 px.
- **Topo da home no desktop:** ~520–560 px de altura.
- **Busca principal:** ~56 px de altura e ~560 px de largura.
- **Cartões de subcategoria:** ~180 × 140 px, 6 por linha no desktop e 3 no celular.

### 7.4 Logo
Um "D" estilizado representando duas opções convergindo para uma decisão, com gradiente do azul elétrico para o verde, acompanhado do texto "DeciCompra". O arquivo final do logo é fornecido pelo responsável (SVG). Até lá, usa-se um provisório.

### 7.5 Componentes-chave
Cabeçalho · Busca com sugestões · Breadcrumbs · Resumo rápido · Selo de nota · Caixa "Onde comprar" · Barra fixa de rodapé (celular) · Card de produto · Card de conteúdo · Tabela comparativa · Placar por critério · Lista de prós/contras · Linha de transparência · Espaço de anúncio · Aviso de cookies · Faixa de confiança · Rodapé.

**Regra visual:** os botões de loja são sempre "Ver na {loja}", nunca "Comprar". Os anúncios nunca imitam os botões de loja.

---

## 8. Painel administrativo e fluxo editorial

### 8.1 Coleções no painel
Categorias · Marcas · Produtos · Lojas · Ofertas · Conteúdos · Mídia · Autores · Redirecionamentos · Usuários · Configurações (Página inicial, Site).

### 8.2 Níveis de acesso
| Ação | Administrador | Editor | Redator |
|---|---|---|---|
| Criar/editar rascunhos de conteúdo e produto | ✔ | ✔ | ✔ |
| Publicar / agendar | ✔ | ✔ | ✘ |
| Criar/editar ofertas e links | ✔ | ✔ | ✘ |
| Categorias, critérios, especificações | ✔ | ✔ | ✘ |
| Lojas, configurações, usuários | ✔ | ✘ | ✘ |

### 8.3 Fluxo
**Rascunho → Em revisão → Publicado** (ou Agendado), com:
- salvamento automático
- histórico de versões
- pré-visualização fiel da página
- checklist de publicação (5.7)

**IA na v1:** o texto é produzido fora do painel (ferramentas de IA externas) e colado no editor para revisão humana obrigatória.

### 8.4 Telas de manutenção
- **Ofertas desatualizadas:** `verificadoEm` > 30 dias
- **Conteúdos a revisar:** `revisadoEm` > 6 meses
- **Produtos sem oferta ativa**

---

## 9. Metodologia: "Como avaliamos os produtos"

### 9.1 Princípios publicados
- As análises são feitas por **pesquisa estruturada**, sem testes físicos. Isso é dito com clareza. O site nunca afirma "testamos" ou "usamos".
- A IA é usada como **apoio** na pesquisa e na redação. **Todo conteúdo é revisado por uma pessoa** antes de publicar.
- **A comissão nunca altera nota nem posição em ranking.** Lojas e marcas não pagam para aparecer. Um produto pode ser recomendado mesmo sem link de afiliado. Produtos com nota baixa também são publicados.
- Revisão no mínimo a cada 6 meses, ou antes se houver mudança relevante de preço ou de modelo.

### 9.2 Fontes
Especificações oficiais do fabricante · Selo Procel/Inmetro · Reviews especializados com testes de laboratório (citados com link) · Avaliações de compradores em volume relevante · Reclame Aqui · Termos de garantia e rede de assistência técnica no Brasil.

### 9.3 Critérios-base
Desempenho · Recursos · Confiabilidade e durabilidade · Suporte no Brasil · Custo-benefício (relativo à faixa de preço dentro da subcategoria) · Eficiência energética (quando aplicável). Cada subcategoria adapta esses critérios.

### 9.4 Pesos iniciais das subcategorias âncora (ajustáveis no painel)
| Smart TVs | % | Air fryers | % | Notebooks | % |
|---|---|---|---|---|---|
| Imagem | 35 | Cozimento e capacidade | 30 | Desempenho | 30 |
| Recursos/Smart | 15 | Facilidade de uso e limpeza | 20 | Tela e construção | 15 |
| Som | 10 | Construção e durabilidade | 20 | Bateria e portabilidade | 15 |
| Confiabilidade e suporte | 15 | Suporte | 10 | Confiabilidade e suporte | 15 |
| Custo-benefício | 25 | Custo-benefício | 20 | Custo-benefício | 25 |

| Furadeiras e parafusadeiras | % | Ar-condicionado | % |
|---|---|---|---|
| Potência e desempenho | 30 | Eficiência energética (Procel/IDRS) | 25 |
| Ergonomia | 15 | Desempenho e ruído | 20 |
| Durabilidade | 20 | Recursos (inverter, Wi-Fi, filtros) | 10 |
| Suporte e peças | 15 | Confiabilidade, suporte e instalação | 20 |
| Custo-benefício | 20 | Custo-benefício | 25 |

---

## 10. Monetização e conformidade

### 10.1 Afiliados
- **Implementação técnica:** seção 5.3.
- **O aviso de afiliados aparece em três lugares:**
  - na linha de transparência no topo da página
  - junto aos botões ("Podemos receber comissão · Saiba mais")
  - na página Divulgação de Afiliados

  Isso atende ao CONAR (publicidade identificada) e ao Google.
- **Imagens:** fotos oficiais de imprensa dos fabricantes, ou imagens obtidas por API da loja quando houver permissão. Nunca fotos copiadas de anúncios. O crédito fica registrado na Mídia.
- **Antes do lançamento:** checar as regras atuais de cada programa (exibição de preços, uso de imagens, redirecionamentos, uso de links em e-mail/PDF) e registrar em `observações` da Loja.

### 10.2 AdSense
- **Solicitar aprovação** após cerca de 30+ conteúdos completos, todas as páginas institucionais publicadas e algumas semanas no ar. É um alvo prudente, não uma regra do Google.
- **Posicionamento manual** (sem anúncios automáticos), com componentes que reservam altura para evitar deslocamento de layout.
- **Regras de posicionamento:**
  - Nunca dentro do resumo rápido, da caixa "Onde comprar" ou das barras fixas
  - No máximo 1 anúncio a cada 3–4 seções, e 1 na home
  - Na lateral, só abaixo da caixa de decisão
  - Sem anúncios flutuantes, de tela cheia ou pop-ups na v1
- **Ativação:** os espaços vêm desligados (`anúnciosLigados = false`). O `ads.txt` é servido a partir das Configurações.

### 10.3 LGPD, cookies e medição
- **Aviso de cookies próprio,** com categorias **Necessários** (sempre ativos), **Estatísticas** e **Publicidade**.
  - Integrado ao **Google Consent Mode v2**, com todos os sinais negados por padrão.
  - Nenhum script de rastreamento ou anúncio carrega sem o consentimento correspondente.
  - A escolha fica guardada por 12 meses e pode ser reaberta pelo link "Preferências de cookies" no rodapé.
- **AdSense:** ao ativá-lo, liga-se também a ferramenta de consentimento certificada do Google para visitantes do Espaço Econômico Europeu, Reino Unido e Suíça.
- **Medição:** Google Search Console + GA4. Eventos: `clique_oferta`, `busca`, `atalho_home` (qual dos 3 caminhos foi usado).
- **Canal de privacidade:** assunto "Privacidade" no formulário de contato + e-mail na Política de Privacidade.

### 10.4 Monetização futura (estrutura prevista, sem implementação na v1)
- **Novos programas de afiliados:** cadastro de nova Loja.
- **Publicidade direta:** os espaços de anúncio aceitam conteúdo alternativo ao AdSense.
- **Conteúdo patrocinado:** campo `patrocinado` com o selo "Conteúdo patrocinado". **Regra permanente: patrocínio nunca em Produto/análise, Melhores ou Comparativo.**
- Newsletter e leads: backlog.

---

## 11. SEO

- **Meta tags:** `<title>` no formato "{título} | DeciCompra" e meta descrição editáveis, com padrões automáticos por tipo.
- **Canonical:** autorreferente em todas as páginas, sem parâmetros de rastreamento. Na paginação, `?pagina=N` usa canonical próprio.
- **Sitemap:** índice com sitemaps por tipo (produtos, conteúdos, taxonomia, marcas, institucionais). Inclui só URLs indexáveis, com `lastmod` = `revisadoEm` ou data de atualização.
- **`robots.txt`:** bloqueia `/ir/`, `/admin`, `/api`, `/busca` e aponta o sitemap.
- **Open Graph e Twitter Card:** em todas as páginas, com imagem gerada automaticamente (título + logo + nota, quando houver).
- **Breadcrumbs:** visíveis e em dados estruturados.
- **Dados estruturados (JSON-LD):**
  - `Organization` + `WebSite` (com SearchAction) no site
  - `BreadcrumbList` em todas as páginas internas
  - `Product` + `Review` (nota DeciCompra, autor organização) nos produtos com status análise
  - `ItemList` em Melhores
  - `Article` em Guia, Entenda e Comparativo
- **Links internos automáticos:** produto ↔ comparativos ↔ listas ↔ guias ↔ hub da subcategoria ↔ marca.
- **Confiança (E-E-A-T):** páginas institucionais completas, metodologia pública, fontes citadas, datas de revisão visíveis, política de correções.
- **Não implementar:** AMP, meta keywords, hreflang, dados estruturados de FAQ, páginas de tag.

---

## 12. Arquitetura técnica

### 12.1 Componentes
| Peça | Escolha |
|---|---|
| Aplicação | Next.js (App Router) + Payload CMS 3, em TypeScript, num único repositório e deploy |
| Banco | PostgreSQL no Neon. Branch de desenvolvimento separado do de produção, o que dispensa Docker local |
| Imagens | Cloudflare R2 (adaptador S3 do Payload), servidas por subdomínio próprio (ex.: `img.decicompra.com.br`) com as versões pré-geradas no upload, sem depender do otimizador de imagens da Vercel |
| Estilo | Tailwind CSS, com os tokens da seção 7 |
| E-mail (contato) | Serviço transacional com plano gratuito (ex.: Resend) |
| Hospedagem | Vercel. Plano Hobby no desenvolvimento, **Pro no lançamento público** (uso comercial) |
| Código | Git + GitHub, com prévia automática na Vercel a cada branch |

### 12.2 Renderização
- As páginas públicas são renderizadas no servidor e geradas estaticamente, com regeneração sob demanda (5.6).
- O JavaScript no navegador fica restrito a: busca com sugestões, aviso de cookies, seletor de variante, menu do celular, "mostrar só diferenças", barras fixas e seções expansíveis.
- `/ir/` e `/busca` são dinâmicos.

### 12.3 Busca
Full-text do PostgreSQL com configuração para português + `unaccent` + busca por prefixo, sobre:
- produtos (nome, marca, códigos de modelo das variantes)
- conteúdos (título, resumo)
- marcas
- subcategorias

### 12.4 Escalabilidade e portabilidade
- **Tráfego:** atendido pela CDN. O banco só é consultado na regeneração de páginas, na busca e em `/ir/`.
- **Volume:** milhares de produtos e conteúdos estão dentro do que a arquitetura suporta sem mudanças.
- **Migração:** a aplicação roda em qualquer servidor Node (VPS/Docker/Railway etc.), o banco é PostgreSQL padrão e as imagens já ficam fora da Vercel.

### 12.5 Operação e segurança
- **Backup:** semanal automático do banco (GitHub Actions → arquivo no R2), além da restauração nativa do Neon.
- **Segredos:** apenas em variáveis de ambiente.
- **Login do painel:** com bloqueio após tentativas falhas.
- **CI no GitHub Actions:** lint, verificação de tipos, testes e build a cada pull request.

---

## 13. Qualidade

### 13.1 Testes
- **Unitários (Vitest):**
  - cálculo da nota e validação de pesos (soma = 100)
  - faixa de preço e regra dos 60 dias
  - vencedores por critério e por atributo
  - slug canônico de comparativo
  - regras de indexação
  - checklist de publicação
  - extração de `produtosReferenciados`
  - criação automática de redirecionamentos
- **Ponta a ponta (Playwright):**
  - home e busca com sugestões
  - renderização de produto, comparativo e melhores
  - `/ir/` redirecionando (oferta ativa e inativa)
  - aviso de cookies bloqueando scripts até o consentimento
  - bloqueio de publicação pelo checklist

### 13.2 Metas
- **Core Web Vitals (celular, percentil 75):** LCP < 2,5 s · CLS < 0,1 · INP < 200 ms.
- **Lighthouse mobile:** desempenho ≥ 90 nos templates principais.
- **Acessibilidade:** WCAG 2.2 AA (contraste, navegação por teclado, foco visível, `alt` obrigatório, hierarquia de títulos, rótulos em formulários).

---

## 14. Fases de entrega

Cada fase de desenvolvimento terá seu próprio plano de implementação.

| Fase | Entrega | Responsável |
|---|---|---|
| **0. Fundação** | Repositório, Next + Payload, Neon, R2, deploy de prévia na Vercel, tokens de design, fontes, cabeçalho e rodapé, CI | Desenvolvimento, orientando o responsável na criação das contas (GitHub, Vercel, Neon, Cloudflare) |
| **1. Dados + painel** | Todas as coleções da seção 4, regras da seção 5, `/ir/`, níveis de acesso, checklist, telas de manutenção, redirecionamentos | Desenvolvimento |
| **2. Páginas públicas** | Todos os templates da seção 6, busca e componentes | Desenvolvimento |
| **3. SEO + conformidade** | Seção 11 completa, aviso de cookies + Consent Mode, GA4, Search Console, espaços de anúncio desligados, `ads.txt`, textos institucionais, formulário de contato, backup | Desenvolvimento |
| **4. Conteúdo de lançamento** | Especificações e pesos das 5 âncoras e, **por âncora**, no mínimo 1 Melhores, 1 Guia, 1 Comparativo, 1 Entenda e 3 produtos com análise (cerca de 35 páginas no total) | Responsável, com IA e com orientação |
| **Lançamento** | Registro do domínio, Vercel Pro, conexão de domínio, envio do sitemap ao Search Console | Juntos |
| **Pós-lançamento** | Pedido de aprovação no AdSense e ativação dos espaços. Depois, o backlog | Juntos |

---

## 15. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Conteúdo por pesquisa + IA visto como de baixo valor pelo Google/AdSense | Metodologia pública, fontes citadas, dados estruturados próprios (tabelas, notas explicáveis), contexto brasileiro (voltagem, Procel, assistência), revisão humana real, volume controlado |
| Autoria só pela marca enfraquece sinais de confiança | Páginas institucionais completas, política editorial detalhada, datas de revisão, estrutura pronta para autores reais |
| Pouca autoridade com 5 categorias | Concentrar o lançamento em 1 subcategoria âncora por categoria, com hubs bem interligados |
| Preços desatualizados ou proibidos por regras de programas | Só faixa de preço, data visível, ocultação após 60 dias, verificação das regras de cada programa |
| Páginas rasas (produtos sem análise) | Status "ficha" = `noindex` e fora do sitemap. Hubs e marcas só indexam com conteúdo |
| Links de afiliado quebrados ou trocados | Fonte única em Ofertas + `/ir/` dinâmico + tela de ofertas desatualizadas |
| Vercel Hobby não permite uso comercial | Plano Pro no lançamento público. Arquitetura portável |
| Questões legais (LGPD, políticas) | Mínimo de dados coletados, consentimento antes de rastrear, revisão jurídica recomendada antes de monetizar |
| Direitos de imagem | Imagens oficiais de imprensa ou via API, com crédito registrado |

---

## 16. Backlog (fases futuras)

Preços via API das lojas · Verificador automático de links · Painel de cliques por oferta · Newsletter · Comparador interativo (o usuário escolhe os produtos) · Quiz/assistente de decisão · Histórico e alertas de preço · Geração de rascunhos por IA dentro do painel · Publicidade direta · Conteúdo patrocinado (com as regras de 10.4) · Busca externa (Algolia/Meilisearch) · Contas de usuário e avaliações de usuários.

---

## 17. Pendências do responsável (fora do código)

- [ ] Registrar **decicompra.com.br** no registro.br
- [ ] Consultar a marca "DeciCompra" no INPI
- [ ] Fornecer o logo final em SVG
- [ ] Confirmar as regras atuais dos programas Amazon, Mercado Livre e Shopee (a lista de pontos a verificar será preparada no desenvolvimento)
- [ ] Revisão jurídica das políticas antes de monetizar (recomendada)
- [ ] Conversar com um contador sobre a tributação dos ganhos como pessoa física
