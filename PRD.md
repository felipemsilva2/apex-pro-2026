# ApexPro - Product Requirements Document (PRD)

## 1. Visão Geral do Produto

**ApexPro** é uma plataforma SaaS whitelabel para profissionais de fitness (personal trainers, coaches e nutricionistas) gerenciarem seus clientes de forma profissional e escalável.

### Proposta de Valor
- **Para Coaches:** Dashboard completo para gerenciar protocolos de treino, planos alimentares e acompanhamento de alunos
- **Para Alunos:** App móvel com visualização de treinos, check-ins e comunicação direta com o coach
- **Diferencial:** Personalização de marca (whitelabel) para cada profissional

---

## 2. Público-Alvo

| Persona | Descrição | Necessidades |
|---------|-----------|--------------|
| **Coach/Personal Trainer** | Profissional com 10-100 alunos | Escalar atendimento, manter qualidade, profissionalizar marca |
| **Nutricionista** | Especialista em alimentação | Criar planos alimentares, acompanhar evolução nutricional |
| **Aluno/Cliente** | Pessoa buscando resultados fitness | Acesso fácil aos treinos, comunicação com coach, acompanhamento de progresso |
| **Admin HQ** | Operador da plataforma | Gerenciar tenants, usuários, métricas globais |

---

## 3. Arquitetura Multi-Tenant

```
ApexPro Platform
├── HQ (Admin Global) - /hq
│   ├── Dashboard de métricas globais
│   ├── Gestão de Tenants (coaches)
│   ├── Gestão de Usuários
│   └── Configurações do sistema
│
├── Portal do Coach - /dashboard
│   ├── Dashboard com métricas
│   ├── Gestão de Clientes
│   ├── Editor de Protocolos de Treino
│   ├── Editor de Planos Alimentares
│   ├── Agenda de Consultas
│   ├── Mensagens
│   ├── Relatórios
│   └── Configurações do Perfil
│
└── App Mobile (Aluno) - App Nativo
    ├── Visualização de treinos
    ├── Check-in de exercícios
    ├── Plano alimentar
    └── Chat com coach
```

---

## 4. Funcionalidades Implementadas

### 4.1 Painel do Coach (Portal Web)

| Feature | Status | Descrição |
|---------|--------|-----------|
| Dashboard Home | ✅ | Métricas, gráficos de evolução, visão geral |
| Lista de Clientes | ✅ | Visualização, busca, filtros por status |
| Detalhe do Cliente | ✅ | Perfil completo, histórico, métricas individuais |
| Editor de Protocolos | ✅ | Criação de treinos com exercícios, séries, GIFs |
| Editor de Planos Alimentares | ✅ | Criação de dietas por refeição |
| Agenda | ✅ | Agendamento de consultas, videoconferência |
| Mensagens | ✅ | Chat com alunos |
| Relatórios | ✅ | Análises e exportação de dados |
| Configurações | ✅ | Perfil, branding, preferências |
| Convite de Alunos | ✅ | Sistema de convites por link único |

### 4.2 Painel Admin HQ (Backoffice)

| Feature | Status | Descrição |
|---------|--------|-----------|
| Dashboard Admin | ✅ | Métricas globais da plataforma |
| Lista de Tenants | ✅ | Gestão de coaches/empresas |
| Lista de Usuários | ✅ | CRUD completo de usuários |
| Criar Usuário | ✅ | Formulário de criação de coach/aluno |
| Editar Usuário | ✅ | Atualização de dados |
| Resetar Senha | ✅ | Edge Function para reset |
| Deletar Usuário | ✅ | Remoção com confirmação |
| Estender Plano | ✅ | Adicionar dias bônus ao plano |
| Métricas | ✅ | Analytics avançadas |

### 4.3 Sistema de Autenticação

| Feature | Status | Descrição |
|---------|--------|-----------|
| Login por Email | ✅ | Supabase Auth |
| Login por Username | ✅ | Managed accounts (@managed.nutripro.pro) |
| Remember Me | ✅ | Persistência de login |
| Password Toggle | ✅ | Visualizar/ocultar senha |
| Redirect por Role | ✅ | Admin → /hq, Coach → /dashboard |
| Onboarding | ✅ | Fluxo de primeiro acesso |

---

## 5. Stack Tecnológica

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **State:** TanStack Query (React Query)
- **Routing:** React Router v6

### Backend
- **Platform:** Supabase
- **Database:** PostgreSQL
- **Auth:** Supabase Auth
- **Edge Functions:** Deno (admin-reset-password, admin-delete-user)
- **Storage:** Supabase Storage

### Design System
- **Fonts:** Plus Jakarta Sans, Syne
- **Primary Color:** Electric Lime (#D4FF00)
- **Theme:** Dark-first, athletic/kinetic aesthetic

---

## 6. Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários (id, email, full_name, role, tenant_id) |
| `clients` | Alunos vinculados a coaches (bonus_days, status) |
| `tenants` | Empresas/Coaches com branding próprio |
| `protocols` | Protocolos de treino |
| `exercises` | Exercícios dentro de protocolos |
| `meal_plans` | Planos alimentares |
| `meals` | Refeições dentro de planos |
| `appointments` | Agenda de consultas |
| `messages` | Chat entre coach e aluno |
| `assessments` | Avaliações físicas |
| `invitations` | Convites pendentes |

---

## 7. Roadmap

### Fase 1 - MVP (Concluída) ✅
- [x] Sistema de autenticação
- [x] Dashboard do coach
- [x] CRUD de clientes
- [x] Editor de protocolos
- [x] Editor de planos alimentares
- [x] Sistema de convites
- [x] HQ Admin básico

### Fase 2 - Admin Avançado (Em Progresso) 🔄
- [x] CRUD completo de usuários no HQ
- [x] Reset de senha via Edge Function
- [x] Extensão de planos
- [ ] Logs de auditoria
- [ ] Relatórios financeiros

### Fase 3 - Integrações
- [ ] Pagamentos (Stripe/PagSeguro)
- [ ] WhatsApp Business API
- [ ] Google Calendar Sync
- [ ] Export PDF de protocolos

### Fase 4 - App Mobile
- [ ] App React Native para alunos
- [ ] Push notifications
- [ ] Offline-first para treinos
- [ ] Check-in de exercícios

---

## 8. Métricas de Sucesso

| KPI | Meta | Atual |
|-----|------|-------|
| Coaches ativos | 100 | - |
| Alunos por coach (média) | 30 | - |
| Taxa de retenção mensal | 90% | - |
| NPS | > 50 | - |

---

## 9. Requisitos Não-Funcionais

- **Performance:** LCP < 2.5s
- **Disponibilidade:** 99.9% uptime
- **Segurança:** Row Level Security (RLS) no Supabase
- **Escalabilidade:** Suportar 10k+ usuários simultâneos
- **Responsividade:** Mobile-first design

---

## 10. Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin Master | `master.admin@managed.nutripro.pro` | `ApexHQ2026!` |

---

*Documento atualizado em: Fevereiro 2026*
