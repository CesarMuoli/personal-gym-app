# PersonalGYM - Diretrizes do Projeto (GEMINI.md)

Este arquivo serve como base de conhecimento e regras de comportamento para a inteligência artificial (Gemini/Antigravity) ao atuar neste projeto. Sempre que for sugerir alterações, adicionar features ou refatorar o código, siga rigorosamente as instruções abaixo.

## 1. Visão Geral do Projeto
O **PersonalGYM** é uma aplicação web (SPA) focada na gestão de alto padrão para Personal Trainers. O objetivo é fornecer uma ferramenta completa para gestão de alunos, acompanhamento de cargas, avaliação física, humor pós-treino, agenda e controle financeiro.

## 2. Tech Stack e Bibliotecas
- **Core:** React (Vite)
- **Roteamento:** `react-router-dom` (BrowserRouter)
- **Backend/BaaS:** Supabase (Auth, Database e Storage)
- **Gráficos:** `recharts`
- **Ícones:** `lucide-react`
- **Notificações:** `react-hot-toast`
- **Estilização:** Vanilla CSS (Proibido o uso de TailwindCSS ou outras bibliotecas CSS).

## 3. Arquitetura e Padrões
- **State Management:** O estado global da aplicação e todas as chamadas de banco de dados (Supabase) são concentrados no `src/context/AppContext.jsx`. Componentes filhos não devem chamar o Supabase diretamente para buscar ou salvar dados globais; eles devem consumir os métodos expostos pelo `useAppContext()`.
- **Autenticação:** O acesso é bloqueado por uma tela de Login (`src/pages/Login.jsx`). O `App.jsx` verifica a existência da sessão do Supabase antes de renderizar as rotas protegidas.
- **Estrutura de Pastas:**
  - `src/pages/`: Telas principais (Dashboard, Financeiro, Perfil, etc).
  - `src/components/`: Componentes reutilizáveis (Sidebar, UI/Card, UI/Modal).
  - `src/lib/`: Configurações de serviços externos (Supabase).
  - `src/context/`: Contextos do React.

## 4. Banco de Dados (Supabase)
Tabelas ativas no projeto:
1. `students`: Cadastro de alunos, status, e campos financeiros (`monthly_fee`, `due_date`, `last_payment_date`). Também armazena links do Storage (`photo_before`, `photo_after`).
2. `calendar_events`: Eventos e aulas marcadas na agenda.
3. `load_progression`: Histórico de evolução de cargas por exercício.
4. `emotional_history`: Registro de humor/esforço pós-treino.
5. `financial_goals`: Tabela simples (ID 1) para metas financeiras (`monthly_goal`, `quarterly_goal`).
- **Storage:** Bucket `evaluations` (Public) utilizado para upload de fotos de avaliação física.

## 5. Diretrizes de Design e UI/UX (Aparência Tech Premium)
O design deve sempre manter um padrão "Premium/Tech". Se precisar criar novos componentes, siga estas regras de CSS:
- **Tema:** Dark Mode absoluto. Cores de fundo extremamente escuras (ex: `#0a0a0f`, `#12121a`).
- **Efeito de Vidro (Glassmorphism):** Utilize fundos semi-transparentes com `backdrop-filter: blur()`. As classes utilitárias no `UI.css` ou `index.css` (como `.glass-panel` e `.glow-card`) devem ser reutilizadas.
- **Acentos em Neon:** 
  - Cor primária (Cyan): `#00f0ff`
  - Cor secundária (Purple): `#8b5cf6`
  - Sombras brilhantes (Glow effects) devem ser usadas em botões primários e cards de destaque.
- **Animações:** Use transições suaves (`transition: all 0.3s ease`) em botões, links e modais. A classe `.fade-in-up` deve envolver a renderização de todas as páginas para manter a fluidez de navegação.

## 6. Regras de Comportamento do Agente
1. **Consistência Visual:** Nunca adicione componentes genéricos ou mal estilizados. Toda nova UI deve parecer pertencer a um software que custa milhares de dólares.
2. **Clean Code:** Mantenha os arquivos organizados. Se uma página (ex: `StudentProfile.jsx`) crescer muito, extraia seções para sub-componentes.
3. **Segurança de Dados:** Como este software lida com dados sensíveis de faturamento e fotos de alunos, garanta que as lógicas de auth estão ativas e não exponha dados acidentalmente no console ou interface.
