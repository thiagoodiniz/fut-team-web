# Changelog - FutTeam Web

Todas as modificaÃ§Ãµes relevantes deste projeto sÃ£o documentadas neste arquivo.
O formato Ã© baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o [Versionamento SemÃ¢ntico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [2.8.0] - 2026-09-30

### Adicionado
- **Visibilidade de Times:** Adicionado controle de visibilidade (Público, Membros, Admin) para times no painel de administração.
- **Painel de Admin Melhorado:** Reestruturação do painel de administração para usar abas e cards (melhor responsividade mobile), incluindo uma aba dedicada para acompanhar os últimos acessos dos usuários em tempo real.



### Adicionado
- **Rastreamento de Eventos (PostHog):** InclusÃ£o de rastreamento (tracking) em aÃ§Ãµes importantes no frontend. Agora sÃ£o capturados cliques nos botÃµes de salvar escalaÃ§Ã£o, limpar escalaÃ§Ã£o, confirmaÃ§Ã£o de exclusÃ£o de jogo, envio de formulÃ¡rio de jogador, alteraÃ§Ã£o de status ativo/inativo, resumo mensal de jogos, aÃ§Ãµes do cabeÃ§alho pÃºblico e do modal de detalhes da partida. Adicionado tambÃ©m o pageview tracker nas pÃ¡ginas pÃºblicas.

## [2.7.0] - 2026-09-24

### Adicionado
- **Agenda de Jogos:** Nova tela de partidas reorganizada com Abas ("Ãšltimos Jogos" e "Agenda"). O prÃ³ximo jogo futuro agora possui um destaque especial no topo com contagem regressiva para a data da partida.
- **Nome do Time no Placar:** O modal pÃºblico de detalhes da partida agora inclui o nome do seu time ao lado do placar.

### Corrigido
- **Ranking de AssistÃªncias PÃºblico:** Corrigida a rota 404 da API que impedia o ranking de assistÃªncias de ser carregado para visitantes.
- **Lista de Jogadores Inativos:** Jogadores inativos na pÃ¡gina do elenco agora nÃ£o sÃ£o separados por posiÃ§Ã£o, aparecendo de forma compacta no fim da lista.
- **Cards de Partida do Jogador:** Corrigida a visualizaÃ§Ã£o incorreta de placares sem os gols do time adversÃ¡rio no histÃ³rico de partidas do jogador. Modais de detalhes da partida tambÃ©m foram ativados nestas telas.

## [2.6.0] - 2026-09-23

### Adicionado
- **MÃºltiplas PosiÃ§Ãµes:** Jogadores agora podem atuar em mais de uma posiÃ§Ã£o (seleÃ§Ã£o mÃºltipla na criaÃ§Ã£o e ediÃ§Ã£o do jogador).
- **OrdenaÃ§Ã£o Inteligente:** Jogadores na listagem de Elenco e na aba de PresenÃ§as do jogo agora sÃ£o agrupados taticamente (Goleiros, Zagueiros, Laterais, Meio-campo, Atacantes) e ordenados alfabeticamente.
- **Badge de Gols e AssistÃªncias:** O campinho tÃ¡tico agora exibe bolinhas indicadoras (`âš½` e `ðŸ‘Ÿ`) em cima da foto do jogador caso ele tenha marcado gol ou dado assistÃªncia naquela partida especÃ­fica.
- **Modal de Detalhes da Partida:** 
  - Nova visualizaÃ§Ã£o compacta e moderna das partidas (aberta via listagem de Jogos ou cards da Home), acessÃ­vel para todos os jogadores.
  - Exibe o campinho da partida com a escalaÃ§Ã£o.
  - Lista os jogadores "no banco" (ausentes da escalaÃ§Ã£o, mas com presenÃ§a marcada) ou convidados/emprestados, devidamente organizados por posiÃ§Ã£o.
- **Gaveta GenÃ©rica (SelectionDrawer):** Novo componente base *bottom-sheet* criado para uniformizar seleÃ§Ãµes no mobile. Substituiu selects nativos complexos na escolha de posiÃ§Ãµes, autor do gol e autor da assistÃªncia.

### Modificado
- **Tela de Gerenciamento da Partida:** A antiga tela de detalhes do jogo (onde se registram presenÃ§as e gols) foi restrita exclusivamente para acesso de administradores.
- **Cards de Ãšltimos Jogos (Home):** Otimizados. Ao invÃ©s de navegar para a ediÃ§Ã£o, agora eles abrem o novo Modal PÃºblico de Detalhes. A lista de artilheiros explÃ­cita foi substituÃ­da por um design mais fluÃ­do focado na abertura do modal.
- **Limpar EscalaÃ§Ã£o:** BotÃ£o "Limpar" inserido nativamente na tela da prancheta tÃ¡tica sem *prompt* obstrutivo de JavaScript.
- Apelido do jogador agora Ã© opcional na API.

## [2.5.0] - 2026-09-22

### Adicionado
- **FormaÃ§Ã£o do Time:**
  - Nova tela de ediÃ§Ã£o de formaÃ§Ã£o tÃ¡tica na partida (`/matches/:id/lineup`).
  - Campo virtual interativo (*Football Pitch*) com suporte a 8 esquemas tÃ¡ticos (ex: 4-3-3, 4-4-2, 3-5-2).
  - Gaveta de seleÃ§Ã£o inteligente que sugere jogadores que atuam na posiÃ§Ã£o solicitada (ex: Zagueiros e Laterais na defesa).
  - Acesso pÃºblico para visualizar a escalaÃ§Ã£o sem necessidade de login.

## [2.4.0] - 2026-09-22

### Adicionado
- **Ranking de AssistÃªncias:** 
  - Nova tela de ranking dedicada para assistÃªncias.
  - ExibiÃ§Ã£o das assistÃªncias no card dos Ãºltimos jogos da Home (ex: âš½ Marcador (ðŸ‘Ÿ Assistente)).
  - Tela de detalhes dos jogos onde o jogador deu assistÃªncia.
- **CompetiÃ§Ã£o e Fase na Artilharia:** Os jogos no histÃ³rico de gols do jogador agora mostram o Ã­cone da competiÃ§Ã£o.
- **Painel de Administrador:** Acesso via cabeÃ§alho do onboarding para gerenciamento e aprovaÃ§Ã£o de novos times (Soft delete de times incluso).

### Corrigido
- **NavegaÃ§Ã£o de Times:** Corrigido redirecionamento forÃ§ado que impedia a troca de time ao tentar "ver outros times".
- **PermissÃ£o de Administrador:** Criadores do time agora ganham cargo de administrador imediatamente, sem precisar relogar.
- **RemoÃ§Ã£o de Gols e EdiÃ§Ã£o:** Corrigido bug onde o clique para remover um gol acionava simultaneamente o modal de ediÃ§Ã£o.
- **Jogos sem Placar:** Partidas que voltam a ter o placar limpo (`null x null`) sÃ£o retiradas dos Ãºltimos jogos e estastÃ­sticas corretamente.

## [2.3.0] - 2026-09-22

### Adicionado
- **Campos de CompetiÃ§Ã£o e Fase:** 
  - Adicionado "CompetiÃ§Ã£o" e "Fase competiÃ§Ã£o" na criaÃ§Ã£o e ediÃ§Ã£o de jogos.
  - Campos de autocompletar baseados no histÃ³rico para facilitar digitaÃ§Ã£o.
  - ExibiÃ§Ã£o da competiÃ§Ã£o e fase nos cards de listagem de jogos (tela de Jogos, InÃ­cio, FrequÃªncia e Artilharia).
  - Adicionado suporte a filtro por competiÃ§Ã£o na busca da tela de Jogos.

### Modificado
- **Placares NÃ£o Definidos (PrÃ³ximos Jogos):** 
  - Jogos futuros agora sÃ£o salvos com placar nulo ("-") ao invÃ©s de "0x0" para nÃ£o poluir as estatÃ­sticas.
  - Contadores de VitÃ³rias, Empates, Derrotas e Gols prÃ³/sofridos agora ignoram completamente os jogos com placares nulos.
  - Os placares nulos exibem crachÃ¡ informativo de "PrÃ³ximo jogo" na listagem.
- **Responsividade do Onboarding:**
  - Ajustado o layout da tela "Junte-se ao time" para o celular, exibindo o escudo acima do nome em modo coluna, evitando quebra visual.
- **Performance da Tela InÃ­cio (Dashboard):**
  - ImplementaÃ§Ã£o de chamadas paralelas para buscar informaÃ§Ãµes do dashboard de forma segmentada (Resumo, Ãšltimos Jogos, Artilharia, FrequÃªncia).
  - UtilizaÃ§Ã£o de `Skeleton` loaders dinÃ¢micos (efeito fantasma) para partes da tela que demoram mais para responder, eliminando o travamento completo inicial e dando uma resposta visual imediata ao usuÃ¡rio.
- **Interface e NavegaÃ§Ã£o:**
  - SubstituiÃ§Ã£o do tÃ­tulo "Home" no cabeÃ§alho pelo nome do time atual.
  - SubstituiÃ§Ã£o do quadrado com a letra inicial na Ã¡rea Hero pelo escudo do time (`TeamLogo`).
- **Loader Principal:**
  - RemoÃ§Ã£o da mensagem e modal "Acordando o servidor", simplificando a inicializaÃ§Ã£o com um spinner padrÃ£o.

### Corrigido
- **Contagem de Empates Incorreta:** 
  - CorreÃ§Ã£o do erro onde partidas sem placar (nulos) eram interpretadas como empates na soma do "Resumo do MÃªs" e "EstatÃ­sticas Gerais".
- **Foto do Jogador:** CorreÃ§Ã£o de bug onde a foto do jogador nÃ£o era carregada no modal de EdiÃ§Ã£o devido Ã  omissÃ£o da imagem na listagem da API (otimizaÃ§Ã£o de banda). Agora a foto Ã© carregada individualmente e cacheada ao abrir o modal.

## [2.2.0] - 2026-09-16

### Adicionado
- **Acesso PÃºblico por URL AmigÃ¡vel (`/:teamSlug`):**
  - VisualizaÃ§Ã£o completa de times sem necessidade de login prÃ©vio atravÃ©s de rotas pÃºblicas (`/:teamSlug`, `/:teamSlug/matches`, `/:teamSlug/players`, `/:teamSlug/team`).
  - Layout pÃºblico dedicado (`PublicAppShell`) exibindo escudo e nome do clube, botÃ£o "Outro time" para retorno fÃ¡cil Ã  busca e botÃ£o "Entrar".
  - Wrapper de rota pÃºblica (`PublicRoute`) gerenciando resoluÃ§Ã£o de slug, `TeamContext` e `SeasonProvider` sem necessidade de token de autenticaÃ§Ã£o.
  - ServiÃ§o de integraÃ§Ã£o pÃºblica (`public.service.ts`) com extraÃ§Ã£o segura de dados da API.
- **Auth Gate em AÃ§Ãµes de Detalhes (`AuthGateModal` & `useAuthGate`):**
  - Modal suave "Entre ou cadastre-se" exibido ao visitante anÃ´nimo ao tentar acessar detalhes de jogos, resumo do mÃªs, estatÃ­sticas completas e detalhes de jogadores.
- **Redirecionamento Inteligente na Raiz (`/`):**
  - Roteamento via `RootRedirect`: leva direto para a URL do time salvo no `localStorage` ou para a tela de Onboarding (`/onboarding`) caso seja um novo visitante.
- **Campo de URL Personalizada do Clube:**
  - ConfiguraÃ§Ã£o do slug do time em "ConfiguraÃ§Ãµes do Time" (`TeamSettingsPage.tsx`), com prefixo de domÃ­nio e validaÃ§Ã£o de formato.

### Modificado
- **PÃ¡gina de Onboarding (`JoinTeamPage.tsx`):**
  - Repaginada para atuar como pÃ¡gina de descoberta e busca de clubes para visitantes anÃ´nimos, com botÃ£o "Acessar Time" que redireciona diretamente para a pÃ¡gina pÃºblica do time.

### Corrigido
- **MÃ¡scara Escura Duplicada na Tela de Jogos:** Removida instÃ¢ncia redundante do `AuthGateModal` dentro do loop de partidas, restaurando a transparÃªncia padrÃ£o do modal.
- **DesserializaÃ§Ã£o de Listas PÃºblicas:** Tratamento dos arrays em `getPublicSeasons`, `getPublicMatches` e `getPublicPlayers` para evitar falha no `sort` e garantir carregamento das partidas e elenco em modo visitante.

## [2.1.0] - 2026-09-16

### Adicionado
- **Motor de Modo Noturno (Dark Mode):**
  - Paleta "Deep Slate" de trÃªs nÃ­veis de profundidade: `#0a0e17` (fundo do layout), `#121826` (containers e cards) e `#1a2235` (elementos elevados e modais).
  - Alternador dinÃ¢mico de tema (â˜€ï¸� / ðŸŒ™) no cabeÃ§alho da aplicaÃ§Ã£o (`AppHeader`), com persistÃªncia da preferÃªncia em `localStorage` (`fut_theme_mode`) e sincronizaÃ§Ã£o automÃ¡tica com o sistema operacional.
  - Algoritmo de contraste WCAG 2.1 AA (`colorUtils.ts`) para cÃ¡lculo matemÃ¡tico de luminÃ¢ncia relativa e adaptaÃ§Ã£o inteligente das cores do clube (`primaryColor` e `secondaryColor`).
  - Provedor global de tema (`ThemeProvider.tsx`) posicionado no nÃ­vel raiz da aplicaÃ§Ã£o, garantindo suporte pleno a todas as rotas (incluindo autenticaÃ§Ã£o e onboarding).
  - Hook seguro `useOptionalTeam()` para desacoplamento de contexto em pÃ¡ginas pÃºblicas ou antes do carregamento do time.

### Modificado
- **Tela InÃ­cio (`HomePage.tsx`):**
  - EliminaÃ§Ã£o completa do "verde sobre verde" em *Ãšltimos Jogos*, migrando para cards neutros com stripe lateral colorido de status (4px) e placar esportivo de alto contraste.
  - UniformizaÃ§Ã£o dos quatro cards de *Temporada* (Jogos, VitÃ³rias, Gols e Aproveitamento) em containers com mÃ©tricas destacadas em 28px bold, eliminando o padrÃ£o visual assimÃ©trico.
  - Redesenho do card *PrÃ³ximo Jogo* com bloco estilo calendÃ¡rio esportivo.
- **Tela Jogos (`MatchesPage.tsx` & `MatchDetailsPage.tsx`):**
  - SubstituiÃ§Ã£o da repetiÃ§Ã£o textual "ver detalhes" por placares esportivos estilizados acompanhados de chevron sutil.
  - Tags de resumo mensal com cores semÃ¢nticas de alto contraste.
  - Placar central "NÃ³s x Eles" com tokens dinÃ¢micos de vitÃ³ria, empate e derrota.
- **Telas de EstatÃ­sticas (`ScorersTotalPage.tsx` & `ScorerGoalsMatchesPage.tsx`):**
  - PÃ­lulas de conquistas (*Doblete*, *Hat-trick*, *Falta*, *PÃªnalti* e *SequÃªncia*) remodeladas com fundos translÃºcidos e tipografia contrastante, eliminando conflitos de cores em qualquer tema.
  - Card de histÃ³rico de sequÃªncia e listagem de partidas do artilheiro alinhados ao novo design system esportivo.
- **Telas de GestÃ£o e AutenticaÃ§Ã£o (`TeamMembersPage.tsx`, `JoinTeamPage.tsx`, `LoginPage.tsx`, `TeamPage.tsx`):**
  - RemoÃ§Ã£o de estilos `#fff` e bordas `#f0f0f0` fixas nos cards de atletas e solicitaÃ§Ãµes.
  - Tela de login com gradientes, superfÃ­cies glassmorphism e inputs adaptativos para modo claro e escuro.
  - Adicionado gradiente protetor no Hero do clube com text-shadow nas tipografias, garantindo legibilidade do nome e escudo mesmo se forem escolhidas cores claras como amarelo ou branco.

### Corrigido
- **Contraste de Empates (WCAG AA):** SubstituiÃ§Ã£o do tom amarelo `#eab308` (contraste de 1.96:1) pelo tom Ã¢mbar certificado `#b45309` no modo claro (5.2:1) e `#facc15` no modo escuro (10.5:1).
- **Medalhas de Ranking:** Bronze atualizado para `#b45309` com texto branco `#ffffff` (4.9:1) e Ouro com tipografia escura `#1a1a1a`.
- **Fundo do Layout no Modo Noturno:** RefatoraÃ§Ã£o da hierarquia do `AppShellLayout` dentro do `ThemeProvider`, assegurando que `token.colorBgLayout` (`#0a0e17`) preencha toda a tela sem deixar o fundo claro remanescente.
- **Erro ao realizar Logout:** ResoluÃ§Ã£o de erro `useAppTheme deve ser usado dentro de um ThemeProvider` ao desconectar e redirecionar para a tela de login.

