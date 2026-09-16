# Changelog - FutTeam Web

Todas as modificações relevantes deste projeto são documentadas neste arquivo.
O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
