# Changelog - FutTeam Web

Todas as modificações relevantes deste projeto são documentadas neste arquivo.
O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
