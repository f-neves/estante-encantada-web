# Estante Encantada · versão web

Versão para navegador do aplicativo [Estante Encantada](../estante-encantada-app): histórias
infantis (4 a 12 anos) narradas em português, com destaque palavra a palavra no ritmo da
leitura, medalhas por livro concluído e sequência de dias de leitura.

Tudo funciona com mouse no computador e com o dedo no celular. O site tem **duas
apresentações**, alternáveis por um botão:

- **Versão app**: coluna estreita, igual ao aplicativo de celular (com moldura de aparelho
  quando aberta no desktop).
- **Versão desktop**: navegação lateral fixa, catálogo em grade de capas, detalhe em duas
  colunas, foco visível e atalhos de teclado.

A escolha fica guardada no navegador. Sem escolha, o site decide pela largura da tela
(abaixo de 900 px abre na versão app).

## Começando

```bash
npm install
npm run sync:assets   # copia capas, áudios e o catálogo do app mobile
npm run dev           # http://localhost:5173
```

`sync:assets` procura o repositório do aplicativo em `../estante-encantada-app`. Para apontar
outro caminho:

```bash
npm run sync:assets -- C:/caminho/do/estante-encantada-app
```

O script copia `backend/uploads/{covers,audio}` para `public/uploads`, gera miniaturas webp das
capas (a estante carregaria 4,4 MB de imagem sem elas, e carrega 364 KB com elas) e atualiza
`src/data/books.json`.

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento, acessível também pelo IP da rede local |
| `npm run build` | Checagem de tipos + build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` para conferir o resultado do build |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run sync:assets` | Sincroniza o acervo com o app mobile |

## Os dois modos de dados

Espelham a arquitetura do aplicativo: a camada `src/api/` decide, função por função, entre
falar com o backend ou usar a implementação local em `src/offline/`.

**Modo local (padrão, `VITE_OFFLINE=1`)**: o site não fala com servidor nenhum. Os livros vêm
de `src/data/books.json`, a mídia de `/uploads` e o estado (personagens, progresso, medalhas,
sequência, favoritos) fica no `localStorage`. As regras de negócio são as mesmas do backend:
recompensa na primeira conclusão, marcos de 3, 5 e 10 livros e contagem de dias seguidos. É o
modo publicado.

**Modo online (`VITE_OFFLINE=0` + `VITE_API_URL`)**: consome a API Express do repositório do
aplicativo, com contas de verdade, bloqueio de livros premium e painel de administração.

```bash
# .env
VITE_OFFLINE=0
VITE_API_URL=http://192.168.100.60:3000/api
VITE_DEV_EMAIL=admin@estante.local
```

Um site servido por HTTPS não consegue chamar uma API em HTTP, então o modo online só vale
para uso local enquanto o backend não estiver hospedado com certificado.

## Sem login

O site não pede cadastro nem senha. Na primeira visita ele cria um personagem genérico e abre
direto na estante. Nome, e-mail e ícone ficam editáveis em **Configurações › Sua conta**, e os
personagens (com idade, que alimenta o filtro "Para mim") em **Quem vai ler hoje?**.

No modo online a identificação usa a rota `/auth/dev` do backend com o e-mail guardado, sem
tela de login. Use o e-mail de uma conta ADMIN (`admin@estante.local`) para enxergar o painel
de administração.

## Personalizar

Em **Personalizar**, cada personagem escolhe: paleta de cor (6 opções), claro/escuro/automático,
fundo (liso, gradiente, estrelinhas, nuvens), ícone e cor do ladrilho, tamanho do texto, fonte
dos títulos e cantos arredondados ou retos. Tudo é aplicado na hora e guardado por personagem,
então trocar de personagem muda a cara do site.

O leitor mantém os temas próprios de leitura (claro, sépia e escuro), independentes disso.

## Publicar (Netlify)

O `netlify.toml` já traz o comando de build, o redirecionamento de página única e os cabeçalhos
de cache. No painel da Netlify: **Add new site › Import an existing project**, escolha o
repositório `f-neves/estante-encantada-web` e confirme. Não é preciso configurar nada além
disso; para o modo online, adicione `VITE_OFFLINE=0` e `VITE_API_URL` nas variáveis de ambiente
do site.

O site é instalável (PWA): manifesto, ícones e service worker. Os 60 MB de narração **não**
entram no pré-cache; cada MP3 é guardado sob demanda, com limite de 60 arquivos e 30 dias.

## Estrutura

```
public/uploads/     capas, miniaturas e narrações (versionados)
scripts/            sync-assets.mjs
src/api/            camada de API, com despacho local x servidor
src/offline/        catálogo embutido e regras espelhadas do backend
src/appearance/     personalização por personagem
src/auth/ profiles/ onboarding/   contexts
src/layout/         AppShell (versão app), WebShell (desktop), cabeçalho, alternância
src/components/     design system e peças reutilizáveis
src/screens/        as telas
src/hooks/          áudio e voz do navegador
src/styles/         tokens, utilitários e reset
```

## Limites conhecidos

- **Autoplay**: navegadores exigem um toque antes de tocar áudio. A narração contínua entre
  capítulos funciona porque houve um clique antes; o primeiro play sempre parte do usuário.
- **PIN parental**: fica no `localStorage`, em texto. É uma barreira contra a criança (mesmo
  papel que no aplicativo), não contra um adulto com acesso ao computador.
- **Vibração**: só em Android/Chrome; ignorada no desktop e no iOS.
- **Modo local**: sem contas, todo mundo entra como usuário local PREMIUM, igual ao APK
  offline do aplicativo.
- **Acervo**: novos livros continuam sendo criados no backend do aplicativo
  (`npm run db:seed` e `npm run audio:generate`); depois é só rodar `npm run sync:assets` aqui.
