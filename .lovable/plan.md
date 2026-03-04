

# Cash Flow — Plano de Implementação

## Visão Geral

Construir um ecossistema web premium de gestão financeira para revendedores de iPhone, com design inspirado na Apple: tema dark, glassmorphism, tipografia SF Pro, e micro-interações refinadas. São 5 módulos principais com dados mockados.

---

## Fase 1: Design System & Infraestrutura

**Tailwind Config** — Reescrever `tailwind.config.ts` com:
- Cores customizadas: `cf-bg-primary (#0A0A0A)`, `cf-accent-red`, `cf-accent-gold`, `cf-accent-blue`, `cf-accent-green`, `cf-text-primary/secondary/tertiary`
- Escala tipográfica Apple (11/13/15/17/22/28/34/44px)
- Keyframes: fade-in, scale-in, slide-in-right, pulse-review, number-roll, skeleton-shimmer
- Border-radius e sombras nos 3 níveis de elevação

**CSS Global** (`index.css`) — Tema dark-only com CSS variables, font-face para SF Pro/SF Mono (com fallback system-ui), classes utilitárias `.glass-card`, `.hover-scale`, `.status-pill`

**Dados Mockados** — Criar `src/data/`:
- `devices.ts` — 20+ iPhones com modelo, capacidade, cor, condição, IMEI, preços, status, histórico
- `sales.ts` — 50+ vendas históricas com datas, tipo (venda/troca), status
- `conversations.ts` — 3 conversas WhatsApp com mensagens (texto + áudio)
- `user.ts` — Perfil do usuário com plano atual

**Utilitários** — `src/lib/format.ts` com `formatCurrency()` (Intl.NumberFormat pt-BR), `formatDate()` (date-fns pt-BR)

**Estado Global** — Context API com `useStore` hook, persistência localStorage para filtros e preferências

---

## Fase 2: Layout & Navegação

**AppLayout** (`src/components/layout/AppLayout.tsx`):
- Sidebar fixa 240px à esquerda (colapsável para 48px icon-only em tablet, hidden em mobile)
- Bottom navigation bar no mobile (<768px)
- Área de conteúdo flex-grow com max-width 1280px

**Sidebar** (`src/components/layout/Sidebar.tsx`):
- Logo "Cash Flow" SVG no topo
- 5 itens: Dashboard, Estoque, WhatsApp, Perfil, Plano — ícones Lucide thin (strokeWidth 1.5)
- Item ativo: borda esquerda azul + fundo glass
- Rodapé: avatar + nome + badge do plano

**Roteamento** (`App.tsx`):
- `/` → Dashboard
- `/estoque` → Estoque
- `/whatsapp` → WhatsApp
- `/perfil` → Perfil
- `/plano` → Plano

---

## Fase 3: Dashboard

**KPI Cards** (4 cards glassmorphism com animação staggered):
1. Unidades em Estoque — valor grande SF Mono + variação semanal
2. Equivalente em Caixa — valor dourado
3. Vendas no Período — com filtro temporal (pills)
4. Faturamento — valor verde + lucro estimado

**Filtro Temporal Global** — Pills horizontais (Hoje/Semana/Mês/Ano/Custom) com date-range picker dark

**Gráfico de Faturamento** — Recharts AreaChart, gradiente azul, tooltip glassmorphism, 8 colunas

**Gráfico de Volume** — Recharts BarChart vertical, 4 colunas

**Tabela de Últimas Vendas** — Sem bordas pesadas, status pills coloridas, hover sutil, paginação minimalista

---

## Fase 4: Estoque

**Sub-tabs** — Todos/Disponíveis/Em Revisão/Vendidos com underline animada

**Grid de Aparelhos** — Cards 4 colunas (responsivo) com imagem placeholder SVG, modelo, specs, badge condição, preço SF Mono dourado, ações no hover

**Filtros** — Barra de busca + filtros colapsáveis (modelo, capacidade, cor, condição, faixa de preço) + pills removíveis

**Drawer de Cadastro** — Sheet lateral direita, formulário 3 steps:
1. Identificação (modelo select, capacidade pills, cor swatches, IMEI)
2. Condição & Preço (radio cards visuais, inputs monetários com máscara)
3. Revisão & confirmação

**Lógica de Troca** — Aparelhos de troca entram como "Em Revisão" (badge pulsante), bloqueados para venda, com banner de alerta e fluxo de desbloqueio (definir preço + condição)

---

## Fase 5: WhatsApp

**Layout split** — Lista de conversas (240px) + área de chat (flex)

**Lista** — Avatar, nome, última mensagem truncada, timestamp, badge não lidas, busca

**Chat** — Balões glassmorphism (azul enviadas, glass recebidas), suporte a mensagens de áudio com waveform visual e player inline, input expansível com ícones de microfone/anexo/enviar

**Gravação de áudio** — Modo de gravação com waveform animada, timer SF Mono vermelho, botões cancelar/enviar

---

## Fase 6: Perfil

Layout centralizado 600px max-width, seções separadas por divisores:
- Avatar com upload/crop, nome, loja, badge plano
- Contatos: WhatsApp, email, Instagram
- Segurança: alterar senha (3 campos), botão salvar com dirty state
- Zona de perigo: exportar dados, excluir conta com modal de confirmação

---

## Fase 7: Gestão de Plano

**Card do plano atual** — Badge dourado, data renovação, features com checkmarks

**Fluxo de Renovação** — Modal com resumo + confirmação + animação checkmark

**Fluxo de Cancelamento** — Multi-step dissuasivo: confirmação → motivo → oferta desconto → digitação "CANCELAR"

---

## Estrutura de Arquivos

```text
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── BottomNav.tsx
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── SalesVolumeChart.tsx
│   │   ├── RecentSalesTable.tsx
│   │   └── TimeFilter.tsx
│   ├── estoque/
│   │   ├── DeviceCard.tsx
│   │   ├── DeviceGrid.tsx
│   │   ├── DeviceFilters.tsx
│   │   ├── RegisterDeviceDrawer.tsx
│   │   └── ReviewPricingModal.tsx
│   ├── whatsapp/
│   │   ├── ConversationList.tsx
│   │   ├── ChatArea.tsx
│   │   ├── MessageBubble.tsx
│   │   └── AudioPlayer.tsx
│   ├── perfil/
│   │   └── ProfileForm.tsx
│   └── plano/
│       ├── PlanCard.tsx
│       ├── RenewModal.tsx
│       └── CancelFlow.tsx
├── data/
│   ├── devices.ts
│   ├── sales.ts
│   ├── conversations.ts
│   └── user.ts
├── hooks/
│   └── useStore.ts
├── lib/
│   └── format.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Estoque.tsx
│   ├── WhatsApp.tsx
│   ├── Perfil.tsx
│   └── Plano.tsx
└── index.css
```

## Observações Técnicas

- Framer Motion **não está disponível** na stack — usaremos CSS animations e transitions (keyframes no Tailwind) para todas as micro-interações
- Recharts já está instalado e será usado para os gráficos
- Lucide React já está instalado (strokeWidth 1.5 em todo o projeto)
- date-fns já está instalado — configurar locale pt-BR
- Tema será dark-only (sem toggle light/dark)
- Todos os valores monetários em `font-family: 'SF Mono', ui-monospace, monospace`

