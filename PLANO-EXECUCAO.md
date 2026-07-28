# Estante Encantada Web · Plano de execução

Porte do aplicativo `estante-encantada-app` (Expo/React Native + backend Express) para uma
versão web interativa, com paridade de funções e duas apresentações: **modo App** (idêntico
ao celular) e **modo Web** (adaptado a mouse e telas grandes), alternáveis por botão.

Repositório de destino: `git@github.com:f-neves/estante-encantada-web.git`

---

## 1. O que o aplicativo faz hoje (inventário de funções)

### 1.1 Fluxo de entrada (decidido por estado, não por navegação)

| Estado | Tela |
|---|---|
| Onboarding não visto | `Onboarding` (3 slides, parallax, pular) |
| Sem usuário | `Login` |
| Usuário sem perfil ativo | `Profiles` |
| Tudo pronto | Stack autenticada (Home e demais) |

### 1.2 Telas e funções

**Onboarding**
- 3 slides horizontais com paginação, bolha colorida flutuante (bob vertical contínuo),
  parallax da bolha, dots de progresso (o ativo vira uma barrinha), botão "Pular",
  botão "Próximo" que vira "Começar a aventura!" no último slide.
- Estado persistido (`estante_onboarding_done`), com opção de rever nas Configurações.

**Login / Criar conta**
- Segmento Entrar / Criar conta.
- Validações: nome com 2+ caracteres, regex de e-mail, senha 6+ caracteres, confirmação igual.
- Mostrar/ocultar senha (olho).
- "Entrar rapidinho": lista de contas salvas (avatar com inicial, nome, e-mail), login com
  1 toque, remover conta da lista. Máximo de 5 contas.
- Botão Google desabilitado com selo "em breve".
- Mensagens de erro em linguagem infantil.

**Profiles / SwitchProfile** (mesma tela, dois papéis)
- Lista de perfis com avatar emoji sobre ladrilho colorido (cor rotativa por índice),
  nome e ano de nascimento; toque seleciona e entra.
- Criar perfil: seletor de 15 avatares emoji, nome, ano de nascimento; cria e já entra.
- Editar perfil (lápis) e excluir (lixeira, com confirmação).
- Sair da conta.
- Quando aberta como "trocar de personagem", tem botão voltar e retorna à Home.

**Home**
- Saudação por horário (Bom dia / Boa tarde / Boa noite) + nome do perfil.
- Chip de sequência (streak) com ícone de chama e pulso contínuo; se streak = 0, mostra
  "Que história vamos ler hoje? ✨".
- Botão de avatar (canto superior direito) que leva a trocar de personagem.
- Busca por título com normalização de acentos.
- Filtro por idade: "Para mim (N anos)" x "Todos".
- Barra rápida com 3 botões chunky (Recompensas, Favoritos, Configurações).
- Cartão "Continuar lendo" (primeiro progresso não concluído): capa, título, capítulo,
  abre o leitor na posição salva.
- Lista de livros: capa, título, selo premium, faixa etária, contagem de capítulos ou "PDF".
- Pull-to-refresh, estados de carregando/erro/vazio (mensagem varia por contexto).
- Animação de entrada escalonada (FadeInUp) nos cartões.

**BookDetail**
- Capa grande (limitada a 40% da altura da tela), pílulas de faixa etária, Premium e Concluído.
- Botão principal contextual: "Começar a ler" / "Continuar (cap. N)" / "Ler de novo",
  ou "Abrir PDF" quando o livro é PDF.
- Favoritar: estrela com animação de pop, brilho (sparkles) e vibração ao marcar; desfaz
  otimisticamente em caso de erro.
- Descrição do livro.
- Lista de capítulos com círculo numerado, que vira check verde quando já lido; toque abre
  o capítulo no leitor.
- Bloqueio premium: HTTP 403 vira tela de cadeado "Livro premium".
- Pull-to-refresh.

**Reader** (a tela mais complexa)
- Barra superior: A- / A+ (escala de fonte 0,85 a 1,6), botão de expandir/recolher o painel
  de narração, 3 amostras de tema de leitura (claro, sépia, escuro) com a ativa destacada.
- Painel de narração: play/pause, alternar narração contínua, 3 vozes (Masculina,
  Feminina 1, Feminina 2, cada uma com sua cor), barra de progresso clicável para saltar,
  tempo atual/total, velocidade 1x e 1,5x.
- Karaokê: destaque contínuo do prefixo já lido, calculado por `wordTimings` (marcas por
  palavra vindas do Google TTS) com fallback proporcional ao tempo quando não há marcas.
- Auto-scroll: recentraliza a leitura quando a palavra atual sai da faixa confortável da
  tela (15% a 65% do viewport), nas duas direções.
- Imagem do capítulo (quando existir), "Capítulo N de M", título e corpo.
- Narração contínua: ao acabar o áudio, avança sozinho ao próximo capítulo e toca.
- Fallback sem áudio gravado: narração pela voz do dispositivo.
- Navegação inferior: Anterior, Capítulos (modal com índice), Próximo.
- "Concluir leitura" no último capítulo, que gera recompensa e abre a celebração.
- Progresso salvo: capítulo atual + percentual de rolagem, ao rolar e ao trocar de capítulo;
  restaura a posição ao reabrir.
- Preferências (fonte, tema, voz, contínua, painel aberto) persistidas.

**CelebrationModal**
- Card com mola, medalha com pop + giro, explosão de 7 brilhos, vibração de sucesso,
  rótulo da recompensa e botão Continuar.

**Rewards**
- Grade de 2 colunas de medalhas: círculo colorido (cor rotativa) com troféu, rótulo e data
  em pt-BR. Entrada escalonada, pull-to-refresh, estado vazio convidativo.

**Favorites**
- Lista de livros favoritados com capa, título, faixa etária e estrela; abre o detalhe.
- Pull-to-refresh e estado vazio.

**Settings**
- Controle parental: se há PIN, a tela abre trancada com teclado numérico de 4 dígitos
  (dots, shake no erro), "Esqueci o PIN" (sai da conta para redefinir, ou desativa direto
  no modo offline). Ativar/alterar/remover PIN por modal de 2 passos (digitar e confirmar).
- Cartão do perfil ativo + botão "Trocar de personagem".
- Estatísticas do perfil: concluídos, em leitura, medalhas.
- Narração: abrir painel ao entrar (switch), narração contínua (switch), escolha da voz.
- Conta: nome, e-mail, selo do plano (oculto no modo offline).
- Botão do painel de administrador (só para `role = ADMIN`).
- Rever introdução, versão do app, sair da conta.

**Admin** (somente ADMIN)
- Estatísticas: usuários, premium, livros, perfis.
- Lista de usuários: alternar plano FREE/PREMIUM e papel USER/ADMIN (bloqueia alterar o
  próprio papel), contagem de filhos, atualização otimista com rollback em erro.
- Lista de livros: alternar Premium/Grátis.

### 1.3 Regras de negócio (backend e espelho offline)

- **Gating premium**: livro premium retorna 403 para conta FREE (leitura e progresso).
- **Filtro por idade**: `ageMin <= idade <= ageMax`.
- **Recompensa por livro**: concedida só na primeira conclusão, rótulo `Concluiu "Título"`.
- **Marcos**: 3 livros (🥉), 5 livros (🥈), 10 livros (🥇), concedidos uma única vez.
- **Streak**: registra o dia de leitura (idempotente) a cada salvamento de progresso; conta
  dias consecutivos terminando hoje ou ontem.
- **Progresso**: `lastChapterIndex` validado contra a quantidade de capítulos; guarda
  `positionPercent`; `completed` define/limpa `completedAt`.

### 1.4 Superfície da API consumida

```
POST /auth/register · POST /auth/login · POST /auth/dev · GET /auth/me
GET  /books?age=&premium=      GET /books/:id      POST /books/:id/audio
GET/POST/PATCH/DELETE /children[/:id]
GET  /children/:id/progress          GET/PUT /children/:id/progress/:bookId
GET  /children/:id/rewards           GET     /children/:id/streak
GET/POST/DELETE /children/:id/favorites[/:bookId]
GET  /admin/stats · /admin/users · /admin/books    PATCH /admin/users/:id · /admin/books/:id
Arquivos: /uploads/covers/*.png · /uploads/audio/*.mp3
```

### 1.5 Acervo atual

14 livros (13 com 5 a 6 capítulos, 1 em PDF), 11 capas, 198 MP3 (3 vozes por capítulo,
60 MB), `wordTimings` por capítulo para o karaokê.

---

## 2. Decisões de arquitetura

### 2.1 Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Build | Vite 7 + React 19 + TypeScript | Rápido, saída estática, mesmo React do app |
| Rotas | React Router 7 | Espelha o stack do React Navigation |
| Estilo | CSS Modules + variáveis CSS | Porta `theme.ts` 1:1 e viabiliza a personalização |
| Ícones | `react-icons/io5` (Ionicons 5) | Mesmos nomes usados no app, troca direta |
| Fonte | `@fontsource/fredoka` (500 e 700) | Fredoka local, sem CDN externo |
| Áudio | `<audio>` + hook próprio | API igual à do `expo-audio` para portar o leitor |
| Estado | Context API | Mesmos providers do app |
| Storage | `localStorage` com wrapper assíncrono | Assinaturas iguais às de `session.ts` |
| PWA | `vite-plugin-pwa` | Instalável, com cuidado para não pré-cachear 60 MB |

### 2.2 Modo App x Modo Web (o botão de alternância)

Um `LayoutModeProvider` guarda `'app' | 'web'` em `localStorage`, com padrão automático
(largura < 900 px entra em modo App, acima entra em modo Web) e um botão visível para trocar
a qualquer momento. O modo vira um atributo no elemento raiz (`data-mode="app"`), então o CSS
decide quase tudo sem duplicar lógica.

**Modo App**: coluna de 430 px centralizada com moldura suave no desktop, ordem de elementos,
espaçamentos, alvos de toque de 64 px e cabeçalho no estilo do stack nativo, tudo igual ao
celular. É o padrão no celular.

**Modo Web**: casca de desktop com barra lateral de navegação (Início, Favoritos, Recompensas,
Personalizar, Configurações, Admin), catálogo em grade de capas com hover, detalhe do livro em
duas colunas (capa à esquerda, informações e capítulos à direita), leitor com painel de
narração fixo no topo e coluna de texto de ~70 caracteres, estados de foco visíveis e atalhos
de teclado (espaço para play/pause, setas para trocar de capítulo, `+`/`-` para a fonte).

Para evitar dois apps, cada tela é dividida em um hook com toda a lógica (`useHomeData`,
`useReader`, etc.) e componentes de apresentação que só mudam onde a estrutura realmente
difere (lista x grade, cabeçalho x barra lateral).

### 2.3 Sem login (decisão de 28/07/2026)

A versão web não pede login nem senha. Quem abre o site cai direto na Home.

- Na primeira visita, o site cria localmente um usuário e um personagem com apelido genérico
  (`Leitor`, avatar 🧒), então já existe perfil ativo e a Home abre sem passo intermediário.
  Enquanto o apelido não for personalizado, a Home começa com o filtro "Todos" (não faz
  sentido filtrar por uma idade que o usuário não informou).
- A tela de Login não é portada. Nome, e-mail e ícone passam a ser editáveis num cartão
  "Sua conta" nas Configurações, junto com os personagens.
- No modo online, a identificação usa a rota `/auth/dev` do backend (que já existe fora de
  produção) com o e-mail guardado nas Configurações, sem tela de login. Isso mantém o painel
  admin funcionando: basta o e-mail ser o de uma conta com papel ADMIN (`admin@estante.local`).
- A estrutura fica preparada para reativar o login depois, sem retrabalho: a camada `api/auth`
  mantém `register`/`login` prontos e a rota `/entrar` só precisa ser religada.

### 2.4 Modo online x offline (mesma flag do app)

`VITE_OFFLINE=1` faz a camada `src/api/` despachar para `src/offline/`, exatamente como no
mobile. Offline: livros de `books.json`, mídia de `/uploads/` servida junto do site, estado
(perfis, progresso, recompensas, streak, favoritos) em `localStorage`, usuário local PREMIUM,
sem login e sem admin. Online: fala com a API Express, com login, gating premium e admin.

### 2.5 Equivalências técnicas

| App (React Native) | Web |
|---|---|
| `expo-audio` (`useAudioPlayer`) | `<audio>` + hook com a mesma forma (`playing`, `currentTime`, `duration`, `didJustFinish`) |
| `expo-speech` | Web Speech API (`speechSynthesis`) |
| `expo-secure-store` / AsyncStorage | `localStorage` |
| `expo-haptics` | `navigator.vibrate` (silencioso no desktop) |
| `Animated` + `useNativeDriver` | Transições e keyframes CSS |
| `Alert.alert` | Modal de confirmação próprio, no estilo do app |
| `RefreshControl` | Botão atualizar + pull-to-refresh no toque |
| `Modal` nativo | `<dialog>` com backdrop e trava de foco |
| `FlatList` | Lista/grade comum (14 itens, sem necessidade de virtualização) |

---

## 3. Estrutura de pastas

```
estante-encantada-web/
├─ public/
│  ├─ uploads/{covers,audio}/      # copiados do backend (versionados)
│  ├─ icons/                       # ícones do PWA
│  └─ manifest.webmanifest
├─ scripts/sync-assets.mjs         # copia uploads e books.json do app
├─ src/
│  ├─ api/                         # client, auth, books, children, progress,
│  │                               # rewards, favorites, streak, admin
│  ├─ offline/                     # db, store, index (regras espelhadas)
│  ├─ data/books.json              # acervo embutido
│  ├─ auth/ profiles/ onboarding/  # contexts (iguais aos do app)
│  ├─ layout/                      # LayoutModeContext, AppShell, WebShell, Header, Sidebar
│  ├─ appearance/                  # AppearanceContext (paletas, ícones, fundo)
│  ├─ components/                  # Icon, BookCover, ChapterImage, KaraokeText,
│  │                               # NarrationPanel, AudioPlayer, CelebrationModal,
│  │                               # PinPad, PinSetupModal, StreakChip, FadeInUp,
│  │                               # PressBounce, Loading, ErrorState, ConfirmDialog
│  ├─ screens/                     # Onboarding, Login, Profiles, Home, BookDetail,
│  │                               # Reader, Rewards, Favorites, Settings, Customize, Admin
│  ├─ hooks/                       # useAudioPlayer, useSpeech, useHomeData, useReader...
│  ├─ styles/                      # tokens.css, palettes.css, reset.css
│  ├─ config.ts  media.ts  session.ts  types.ts  utils/
│  └─ main.tsx  App.tsx  router.tsx
├─ .env.example  .gitignore  index.html  vite.config.ts  tsconfig.json
├─ vercel.json / netlify.toml
└─ README.md
```

---

## 4. Personalização (função nova, além da paridade)

Proposta concreta, salva **por perfil de criança** (o app muda de cara ao trocar de
personagem) e aplicada por variáveis CSS:

1. **Paleta de cores**: Roxo Mágico (padrão), Coral, Menta, Céu, Rosa e Sol. Troca a cor
   primária e as cores de apoio em todo o site.
2. **Claro / Escuro / Automático**: hoje só o leitor tem temas; passa a valer para o app todo.
3. **Fundo**: creme liso, gradiente roxo, céu estrelado, nuvens.
4. **Avatar e ícone do perfil**: grade ampliada, agrupada em pacotes (Pessoas, Animais,
   Fantasia, Espaço), mais a cor do ladrilho do avatar.
5. **Texto**: tamanho base do app (não só do leitor) e opção de fonte display arredondada
   (Fredoka) ou fonte do sistema, mais legível para quem está aprendendo.
6. **Cantos e sombra**: "arredondado" (padrão) ou "quadrado" (visual mais sóbrio para os pais).

Tela `Personalizar` com pré-visualização ao vivo e botão "voltar ao padrão".
Fica fora do PIN parental (é diversão da criança); o PIN continua guardando as Configurações.

> Ponto de decisão: o backend não tem campo para preferências, então a personalização fica no
> navegador. Se quiser que acompanhe a conta entre dispositivos, é preciso adicionar uma coluna
> `preferences` em `ChildProfile` no backend (migração Prisma). Posso deixar preparado.

---

## 5. Fases de execução

| Fase | Entrega | Verificação |
|---|---|---|
| 0 | `git init`, remote, Vite + TS, dependências, `.gitignore`, script `sync-assets`, cópia dos 65 MB de mídia e do `books.json` | `npm run dev` sobe |
| 1 | Núcleo: `types.ts`, `config.ts`, `session.ts` (localStorage), `media.ts`, camada `api/` + `offline/` com as regras (recompensas, marcos 3/5/10, streak) | `tsc --noEmit` |
| 2 | Design system: `tokens.css` a partir do `theme.ts`, `Icon`, `PressBounce`, `FadeInUp`, `BookCover`, `Loading`, `ErrorState`, `StreakChip`, `ConfirmDialog`, `Modal` | Página de amostra |
| 3 | Contexts (Auth, Child, Onboarding, LayoutMode, Appearance), roteamento com guardas, `AppShell` (modo App) e `WebShell` (modo Web), botão de alternância | Trocar de modo mantém a rota |
| 4 | Entrada: Onboarding (carrossel com snap, parallax, dots), criação automática do perfil genérico, Profiles (criar, editar, excluir, trocar). Sem tela de login | Primeira visita cai na Home |
| 5 | Home (saudação, streak, busca, filtro de idade, barra rápida, continuar lendo, lista/grade), BookDetail (pílulas, ação contextual, favoritar animado, capítulos, bloqueio premium), Favorites, Rewards | Comparação lado a lado com o app |
| 6 | Leitor: hook de áudio, karaokê por `wordTimings`, auto-scroll, temas de leitura, escala de fonte, painel de narração (vozes, velocidade, contínua, seek), índice de capítulos, salvar/restaurar posição, concluir + celebração, fallback de voz do navegador | Ler um livro do início ao fim, com áudio e recompensa |
| 7 | Settings (cartão "Sua conta" com nome, e-mail e ícone editáveis, PIN parental com teclado e shake, switches de narração, voz, estatísticas, rever intro) e Admin (stats, alternar plano/papel/premium) | Testar com `admin@estante.local` |
| 8 | Personalizar: paletas, claro/escuro, fundos, avatares, tipografia, cantos; por perfil | Trocar de perfil muda a cara |
| 9 | PWA (manifest, ícones, service worker sem pré-cache dos áudios), config de deploy, README, revisão de acessibilidade e responsividade, commit e push | `npm run build`, Lighthouse, site publicado |

Cada fase termina com `npx tsc --noEmit` e `npm run build` limpos, e um commit no repositório.

---

## 6. Pontos que precisam de você

Resolvido em 28/07/2026. Verificado na máquina: chave SSH do GitHub autenticando como `f-neves`,
repositório `estante-encantada-web` criado e vazio, PostgreSQL rodando com o banco semeado
(14 livros, 66 capítulos, 7 usuários, 1 admin, 7 perfis), IP local `192.168.100.60`.

| # | Assunto | Definição |
|---|---|---|
| 1 | **Login** | Não haverá login nem senha. Entrada direta com apelido genérico, editável nas Configurações (ver 2.3). |
| 2 | **Personalização** | Lista completa da seção 4, salva no navegador por perfil. Sem migração no backend por ora. |
| 3 | **Deploy** | Netlify. Deixo `netlify.toml` e as instruções prontos; a publicação em si depende de você conectar o repositório na conta Netlify. |
| 4 | **Ícone** | Reaproveitar `mobile/assets/icon.png` para favicon e ícones do PWA. |
| 5 | **Push** | Autorizado no `git@github.com:f-neves/estante-encantada-web.git`, commit ao fim de cada fase. |
| 6 | **Backend online** | Continua opcional e local (`http://192.168.100.60:3000/api`). O site publicado usa o modo local. Um backend hospedado em HTTPS só será necessário se você quiser contas de verdade e sincronismo entre dispositivos. |
| 7 | **Acervo** | Mesmo acervo atual (14 livros). Livros novos continuam sendo criados no backend (`db:seed` + `audio:generate`, única etapa que custa no Google TTS). |

---

## 7. Riscos e limites conhecidos

- **Autoplay**: navegadores bloqueiam áudio sem gesto do usuário. A narração contínua entre
  capítulos funciona porque houve um clique antes, mas o primeiro play sempre exige toque.
- **`preservesPitch`**: a velocidade 1,5x mantém o tom nos navegadores atuais; em versões
  antigas do Safari o tom pode subir um pouco.
- **Peso dos áudios**: o service worker não vai pré-cachear os 60 MB. Cada MP3 é cacheado sob
  demanda, com limite de tamanho, para não estourar a cota do navegador.
- **PIN parental**: no navegador fica em `localStorage` (é uma barreira contra a criança, não
  contra um adulto com acesso ao aparelho). Mesmo papel que no app, com menos garantia técnica.
- **Vibração**: só em Android/Chrome; ignorada no desktop e no iOS.
- **Modo offline**: sem login real, todo mundo entra como usuário local PREMIUM, igual ao APK
  offline. É o comportamento esperado, não um furo de segurança do modo online.
