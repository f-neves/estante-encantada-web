# Créditos e licenças

Auditoria feita em 28/07/2026. Cada capa foi identificada pelo hash exato do arquivo no
Wikimedia Commons (ou pela miniatura determinística na largura idêntica), não por semelhança.

## Textos

Todos os textos dos capítulos foram escritos para este projeto. As histórias clássicas são
reescritas curtas a partir de obras em domínio público, não reproduções de traduções alheias.

| Livro | Obra de base | Situação |
|---|---|---|
| Chapeuzinho Vermelho | Charles Perrault (1697) e Irmãos Grimm (1812) | domínio público |
| Cinderela | Charles Perrault (1697) e Irmãos Grimm | domínio público |
| Cachinhos Dourados e os Três Ursos | Robert Southey (1837) | domínio público |
| João e o Pé de Feijão | folclore inglês; Tabart (1807), Joseph Jacobs (1890) | domínio público |
| O Patinho Feio | Hans Christian Andersen (1843) | domínio público |
| Os Três Porquinhos | folclore inglês; Halliwell (1886), Joseph Jacobs | domínio público |
| O Saci-Pererê | folclore brasileiro | domínio público |
| O Curupira | folclore brasileiro | domínio público |
| A Lenda da Vitória-Régia | lenda indígena tupi-guarani | domínio público |
| Sítio do Picapau Amarelo | personagens de Monteiro Lobato (1882-1948) | domínio público no Brasil desde 01/01/2019 |
| O Dragão que Não Sabia Voar | história original | criada para este projeto |
| O Robô que Aprendeu a Sonhar | história original | criada para este projeto |
| A Biblioteca Mágica da Vovó Rosa | história original | criada para este projeto |

Sobre o Sítio: no Brasil os direitos morais do autor são perpétuos, por isso a descrição do
livro credita "inspirado na obra de Monteiro Lobato". Nomes como "Sítio do Picapau Amarelo" e
"Emília" também têm registros de marca para licenciamento, o que é assunto separado do direito
autoral e precisa de atenção própria em uso comercial.

## Capas

### Domínio público (sem obrigações)

| Arquivo | Autor | Fonte |
|---|---|---|
| `chapeuzinho.jpg` | Otto Kubel (1868-1951) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Little_Red_Riding_Hood_Otto_Kubel.jpg) |
| `cachinhos.jpg` | Jessie Willcox Smith (1863-1935) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jessie_Willcox_Smith_-_%27Goldilocks_and_the_Three_Bears%27,_Swift%27s_Premium_Soap_Products_calendar_illustration.jpg) |
| `patinho-feio.jpg` | Milo Winter (1888-1956) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:The_Ugly_Duckling_cropped.jpg) |
| `joao-pe-de-feijao.jpg` | Arthur Rackham (1867-1939) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jack_and_the_Beanstalk_Giant_-_Project_Gutenberg_eText_17034.jpg) |

### Creative Commons (atribuição obrigatória)

| Arquivo | Crédito exigido |
|---|---|
| `cinderela.jpg` | Digitalização da MCAD Library (Jack Zipes Historic Fairy Tale Postcard Collection), ilustração de Oskar Herrfurth (1862-1934). Licença [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). [Arquivo no Commons](https://commons.wikimedia.org/wiki/File:Cinderella_-_Jack_Zipes_Historic_Fairy_Tale_Postcard_Collection_-_Herrfurth,_Oskar_(German,_1862-1934).jpg) |
| `vitoria-regia.jpg` | Fotografia de Bilby. Licença [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). [Arquivo no Commons](https://commons.wikimedia.org/wiki/File:Victoria_amazonica_03.jpg) |

### Arte própria do projeto

| Arquivo | Como foi feito |
|---|---|
| `saci.jpg`, `curupira.jpg`, `sitio.jpg` | Desenhadas em SVG por `scripts/make-covers.mjs` e rasterizadas. Substituíram imagens de terceiros na auditoria de 28/07/2026 |
| `livro01.png` | Ilustração gerada por IA para a história original do projeto |
| `public/icons/*` | Ícones do PWA, derivados do ícone do aplicativo |

As miniaturas em `covers/thumbs/` são recortes das capas acima e seguem a mesma licença de cada
original.

## Narração

Os MP3 são gerados pelo Google Cloud Text-to-Speech (vozes Neural2 pt-BR) a partir dos textos
deste projeto, e pertencem ao projeto conforme os termos do serviço.

## Removidos na auditoria de 28/07/2026

- `sitio.jpg` anterior: era a capa comercial de "Coleção Trenzinho · Monteiro Lobato · O Sítio do
  Picapau Amarelo", ilustrações de Eduardo Vetillo, editora PÉ da Letra. Arte protegida.
- `curupira.jpg` e `saci.jpg` anteriores: ilustrações vetoriais modernas de origem não
  identificada, sem licença comprovável.
- Livro "A Day Dark as Night": era o romance de Carl Bowen (White Wolf Publishing, 2004), da
  linha Exalted. Protegido por direito autoral e fora da faixa etária do app. O PDF nunca chegou
  a ser distribuído (o arquivo não existia), mas a entrada estava no catálogo.
