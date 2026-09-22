# Changelog - FutTeam Web

Todas as modificações relevantes deste projeto são documentadas neste arquivo.
O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [2.4.0] - 2026-09-22

### Adicionado
- **Ranking de Assistências:** 
  - Nova tela de ranking dedicada para assistências.
  - Exibição das assistências no card dos últimos jogos da Home (ex: ⚽ Marcador (👟 Assistente)).
  - Tela de detalhes dos jogos onde o jogador deu assistência.
- **Competição e Fase na Artilharia:** Os jogos no histórico de gols do jogador agora mostram o ícone da competição.
- **Painel de Administrador:** Acesso via cabeçalho do onboarding para gerenciamento e aprovação de novos times (Soft delete de times incluso).

### Corrigido
- **Navegação de Times:** Corrigido redirecionamento forçado que impedia a troca de time ao tentar "ver outros times".
- **Permissão de Administrador:** Criadores do time agora ganham cargo de administrador imediatamente, sem precisar relogar.
- **Remoção de Gols e Edição:** Corrigido bug onde o clique para remover um gol acionava simultaneamente o modal de edição.
- **Jogos sem Placar:** Partidas que voltam a ter o placar limpo (`null x null`) são retiradas dos últimos jogos e estastísticas corretamente.

## [2.3.0] - 2026-09-22

### Adicionado
- **Campos de Competição e Fase:** 
  - Adicionado "Competição" e "Fase competição" na criação e edição de jogos.
  - Campos de autocompletar baseados no histórico para facilitar digitação.
  - Exibição da competição e fase nos cards de listagem de jogos (tela de Jogos, Início, Frequência e Artilharia).
  - Adicionado suporte a filtro por competição na busca da tela de Jogos.

### Modificado
- **Placares Não Definidos (Próximos Jogos):** 
  - Jogos futuros agora são salvos com placar nulo ("-") ao invés de "0x0" para não poluir as estatísticas.
  - Contadores de Vitórias, Empates, Derrotas e Gols pró/sofridos agora ignoram completamente os jogos com placares nulos.
  - Os placares nulos exibem crachá informativo de "Próximo jogo" na listagem.
- **Responsividade do Onboarding:**
  - Ajustado o layout da tela "Junte-se ao time" para o celular, exibindo o escudo acima do nome em modo coluna, evitando quebra visual.
- **Performance da Tela Início (Dashboard):**
  - Implementação de chamadas paralelas para buscar informações do dashboard de forma segmentada (Resumo, Últimos Jogos, Artilharia, Frequência).
  - Utilização de `Skeleton` loaders dinâmicos (efeito fantasma) para partes da tela que demoram mais para responder, eliminando o travamento completo inicial e dando uma resposta visual imediata ao usuário.
- **Interface e Navegação:**
  - Substituição do título "Home" no cabeçalho pelo nome do time atual.
  - Substituição do quadrado com a letra inicial na área Hero pelo escudo do time (`TeamLogo`).
- **Loader Principal:**
  - Remoção da mensagem e modal "Acordando o servidor", simplificando a inicialização com um spinner padrão.

### Corrigido
- **Contagem de Empates Incorreta:** 
  - Correção do erro onde partidas sem placar (nulos) eram interpretadas como empates na soma do "Resumo do Mês" e "Estatísticas Gerais".
- **Foto do Jogador:** Correção de bug onde a foto do jogador não era carregada no modal de Edição devido à omissão da imagem na listagem da API (otimização de banda). Agora a foto é carregada individualmente e cacheada ao abrir o modal.

## [2.2.0] - 2026-09-16

### Adicionado
- **Acesso Público por URL Amigável (`/:teamSlug`):**
  - Visualização completa de times sem necessidade de login prévio através de rotas públicas (`/:teamSlug`, `/:teamSlug/matches`, `/:teamSlug/players`, `/:teamSlug/team`).
  - Layout público dedicado (`PublicAppShell`) exibindo escudo e nome do clube, botão "Outro time" para retorno fácil à busca e botão "Entrar".
  - Wrapper de rota pública (`PublicRoute`) gerenciando resolução de slug, `TeamContext` e `SeasonProvider` sem necessidade de token de autenticação.
  - Serviço de integração pública (`public.service.ts`) com extração segura de dados da API.
- **Auth Gate em Ações de Detalhes (`AuthGateModal` & `useAuthGate`):**
  - Modal suave "Entre ou cadastre-se" exibido ao visitante anônimo ao tentar acessar detalhes de jogos, resumo do mês, estatísticas completas e detalhes de jogadores.
- **Redirecionamento Inteligente na Raiz (`/`):**
  - Roteamento via `RootRedirect`: leva direto para a URL do time salvo no `localStorage` ou para a tela de Onboarding (`/onboarding`) caso seja um novo visitante.
- **Campo de URL Personalizada do Clube:**
  - Configuração do slug do time em "Configurações do Time" (`TeamSettingsPage.tsx`), com prefixo de domínio e validação de formato.

### Modificado
- **Página de Onboarding (`JoinTeamPage.tsx`):**
  - Repaginada para atuar como página de descoberta e busca de clubes para visitantes anônimos, com botão "Acessar Time" que redireciona diretamente para a página pública do time.

### Corrigido
- **Máscara Escura Duplicada na Tela de Jogos:** Removida instância redundante do `AuthGateModal` dentro do loop de partidas, restaurando a transparência padrão do modal.
- **Desserialização de Listas Públicas:** Tratamento dos arrays em `getPublicSeasons`, `getPublicMatches` e `getPublicPlayers` para evitar falha no `sort` e garantir carregamento das partidas e elenco em modo visitante.

## [2.1.0] - 2026-09-16

### Adicionado
- **Motor de Modo Noturno (Dark Mode):**
  - Paleta "Deep Slate" de três níveis de profundidade: `#0a0e17` (fundo do layout), `#121826` (containers e cards) e `#1a2235` (elementos elevados e modais).
  - Alternador dinâmico de tema (☀️ / 🌙) no cabeçalho da aplicação (`AppHeader`), com persistência da preferência em `localStorage` (`fut_theme_mode`) e sincronização automática com o sistema operacional.
  - Algoritmo de contraste WCAG 2.1 AA (`colorUtils.ts`) para cálculo matemático de luminância relativa e adaptação inteligente das cores do clube (`primaryColor` e `secondaryColor`).
  - Provedor global de tema (`ThemeProvider.tsx`) posicionado no nível raiz da aplicação, garantindo suporte pleno a todas as rotas (incluindo autenticação e onboarding).
  - Hook seguro `useOptionalTeam()` para desacoplamento de contexto em páginas públicas ou antes do carregamento do time.

### Modificado
- **Tela Início (`HomePage.tsx`):**
  - Eliminação completa do "verde sobre verde" em *Últimos Jogos*, migrando para cards neutros com stripe lateral colorido de status (4px) e placar esportivo de alto contraste.
  - Uniformização dos quatro cards de *Temporada* (Jogos, Vitórias, Gols e Aproveitamento) em containers com métricas destacadas em 28px bold, eliminando o padrão visual assimétrico.
  - Redesenho do card *Próximo Jogo* com bloco estilo calendário esportivo.
- **Tela Jogos (`MatchesPage.tsx` & `MatchDetailsPage.tsx`):**
  - Substituição da repetição textual "ver detalhes" por placares esportivos estilizados acompanhados de chevron sutil.
  - Tags de resumo mensal com cores semânticas de alto contraste.
  - Placar central "Nós x Eles" com tokens dinâmicos de vitória, empate e derrota.
- **Telas de Estatísticas (`ScorersTotalPage.tsx` & `ScorerGoalsMatchesPage.tsx`):**
  - Pílulas de conquistas (*Doblete*, *Hat-trick*, *Falta*, *Pênalti* e *Sequência*) remodeladas com fundos translúcidos e tipografia contrastante, eliminando conflitos de cores em qualquer tema.
  - Card de histórico de sequência e listagem de partidas do artilheiro alinhados ao novo design system esportivo.
- **Telas de Gestão e Autenticação (`TeamMembersPage.tsx`, `JoinTeamPage.tsx`, `LoginPage.tsx`, `TeamPage.tsx`):**
  - Remoção de estilos `#fff` e bordas `#f0f0f0` fixas nos cards de atletas e solicitações.
  - Tela de login com gradientes, superfícies glassmorphism e inputs adaptativos para modo claro e escuro.
  - Adicionado gradiente protetor no Hero do clube com text-shadow nas tipografias, garantindo legibilidade do nome e escudo mesmo se forem escolhidas cores claras como amarelo ou branco.

### Corrigido
- **Contraste de Empates (WCAG AA):** Substituição do tom amarelo `#eab308` (contraste de 1.96:1) pelo tom âmbar certificado `#b45309` no modo claro (5.2:1) e `#facc15` no modo escuro (10.5:1).
- **Medalhas de Ranking:** Bronze atualizado para `#b45309` com texto branco `#ffffff` (4.9:1) e Ouro com tipografia escura `#1a1a1a`.
- **Fundo do Layout no Modo Noturno:** Refatoração da hierarquia do `AppShellLayout` dentro do `ThemeProvider`, assegurando que `token.colorBgLayout` (`#0a0e17`) preencha toda a tela sem deixar o fundo claro remanescente.
- **Erro ao realizar Logout:** Resolução de erro `useAppTheme deve ser usado dentro de um ThemeProvider` ao desconectar e redirecionar para a tela de login.
