// Admin mock data

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  loja: string;
  plano: 'cashflow';
  status: 'ativo' | 'cancelado' | 'inadimplente';
  dataCadastro: string;
  dataRenovacao: string;
  ultimoPagamento: string;
  valorPago: number;
}

export const mockAdminUsers: AdminUser[] = [
  { id: '1', nome: 'Ricardo Almeida', email: 'ricardo@raiphones.com.br', loja: 'RA iPhones Premium', plano: 'cashflow', status: 'ativo', dataCadastro: '2025-06-01', dataRenovacao: '2026-04-15', ultimoPagamento: '2026-03-01', valorPago: 89 },
  { id: '2', nome: 'Mariana Costa', email: 'mariana@mcell.com.br', loja: 'M Cell', plano: 'cashflow', status: 'ativo', dataCadastro: '2025-07-10', dataRenovacao: '2026-04-10', ultimoPagamento: '2026-03-10', valorPago: 89 },
  { id: '3', nome: 'Felipe Santos', email: 'felipe@fsphones.com', loja: 'FS Phones', plano: 'cashflow', status: 'inadimplente', dataCadastro: '2025-08-20', dataRenovacao: '2026-02-20', ultimoPagamento: '2026-01-20', valorPago: 89 },
  { id: '4', nome: 'Ana Oliveira', email: 'ana@appleland.com', loja: 'Apple Land', plano: 'cashflow', status: 'ativo', dataCadastro: '2025-09-05', dataRenovacao: '2026-04-05', ultimoPagamento: '2026-03-05', valorPago: 89 },
  { id: '5', nome: 'Lucas Ferreira', email: 'lucas@iphonestore.com', loja: 'iPhone Store BR', plano: 'cashflow', status: 'cancelado', dataCadastro: '2025-05-15', dataRenovacao: '2026-01-15', ultimoPagamento: '2025-12-15', valorPago: 89 },
  { id: '6', nome: 'Juliana Mendes', email: 'juliana@jmcell.com', loja: 'JM Cell Premium', plano: 'cashflow', status: 'ativo', dataCadastro: '2025-10-01', dataRenovacao: '2026-04-01', ultimoPagamento: '2026-03-01', valorPago: 89 },
  { id: '7', nome: 'Pedro Henrique', email: 'pedro@phphones.com', loja: 'PH Phones', plano: 'cashflow', status: 'ativo', dataCadastro: '2025-11-12', dataRenovacao: '2026-04-12', ultimoPagamento: '2026-03-12', valorPago: 89 },
  { id: '8', nome: 'Camila Rodrigues', email: 'camila@crcell.com', loja: 'CR Cell', plano: 'cashflow', status: 'inadimplente', dataCadastro: '2025-12-01', dataRenovacao: '2026-03-01', ultimoPagamento: '2026-01-01', valorPago: 89 },
  { id: '9', nome: 'Thiago Lima', email: 'thiago@tlphones.com', loja: 'TL Phones', plano: 'cashflow', status: 'ativo', dataCadastro: '2026-01-08', dataRenovacao: '2026-04-08', ultimoPagamento: '2026-03-08', valorPago: 89 },
  { id: '10', nome: 'Beatriz Souza', email: 'beatriz@bscell.com', loja: 'BS Cell', plano: 'cashflow', status: 'cancelado', dataCadastro: '2025-04-20', dataRenovacao: '2025-11-20', ultimoPagamento: '2025-10-20', valorPago: 89 },
  { id: '11', nome: 'Gabriel Nunes', email: 'gabriel@gnphones.com', loja: 'GN Phones', plano: 'cashflow', status: 'ativo', dataCadastro: '2026-02-01', dataRenovacao: '2026-05-01', ultimoPagamento: '2026-03-01', valorPago: 89 },
  { id: '12', nome: 'Isabela Martins', email: 'isabela@imcell.com', loja: 'IM Cell', plano: 'cashflow', status: 'ativo', dataCadastro: '2026-01-15', dataRenovacao: '2026-04-15', ultimoPagamento: '2026-03-15', valorPago: 89 },
];

export interface BillingRecord {
  id: string;
  userId: string;
  userName: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente' | 'falhou';
  metodo: 'PIX' | 'Cartão' | 'Boleto';
}

export const mockBillingHistory: BillingRecord[] = [
  { id: 'b1', userId: '1', userName: 'Ricardo Almeida', valor: 89, data: '2026-03-01', status: 'pago', metodo: 'PIX' },
  { id: 'b2', userId: '2', userName: 'Mariana Costa', valor: 89, data: '2026-03-10', status: 'pago', metodo: 'Cartão' },
  { id: 'b3', userId: '3', userName: 'Felipe Santos', valor: 89, data: '2026-02-20', status: 'falhou', metodo: 'Cartão' },
  { id: 'b4', userId: '4', userName: 'Ana Oliveira', valor: 89, data: '2026-03-05', status: 'pago', metodo: 'PIX' },
  { id: 'b5', userId: '6', userName: 'Juliana Mendes', valor: 89, data: '2026-03-01', status: 'pago', metodo: 'PIX' },
  { id: 'b6', userId: '7', userName: 'Pedro Henrique', valor: 89, data: '2026-03-12', status: 'pago', metodo: 'Cartão' },
  { id: 'b7', userId: '8', userName: 'Camila Rodrigues', valor: 89, data: '2026-03-01', status: 'falhou', metodo: 'Boleto' },
  { id: 'b8', userId: '9', userName: 'Thiago Lima', valor: 89, data: '2026-03-08', status: 'pago', metodo: 'PIX' },
  { id: 'b9', userId: '11', userName: 'Gabriel Nunes', valor: 89, data: '2026-03-01', status: 'pago', metodo: 'PIX' },
  { id: 'b10', userId: '12', userName: 'Isabela Martins', valor: 89, data: '2026-03-15', status: 'pendente', metodo: 'Cartão' },
  { id: 'b11', userId: '1', userName: 'Ricardo Almeida', valor: 89, data: '2026-02-01', status: 'pago', metodo: 'PIX' },
  { id: 'b12', userId: '2', userName: 'Mariana Costa', valor: 89, data: '2026-02-10', status: 'pago', metodo: 'Cartão' },
  { id: 'b13', userId: '4', userName: 'Ana Oliveira', valor: 89, data: '2026-02-05', status: 'pago', metodo: 'PIX' },
  { id: 'b14', userId: '5', userName: 'Lucas Ferreira', valor: 89, data: '2025-12-15', status: 'pago', metodo: 'Boleto' },
];

export interface Integration {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'transcricao' | 'ia' | 'pagamentos';
  status: 'conectado' | 'desconectado' | 'erro';
  apiKeyConfigured: boolean;
  ultimaVerificacao: string;
  icon: string;
}

export const mockIntegrations: Integration[] = [
  {
    id: 'whisper',
    nome: 'API de Transcrição',
    descricao: 'Whisper API para transcrição automática de áudios recebidos',
    categoria: 'transcricao',
    status: 'conectado',
    apiKeyConfigured: true,
    ultimaVerificacao: '2026-03-04T10:30:00',
    icon: 'Mic',
  },
  {
    id: 'openai',
    nome: 'OpenAI GPT',
    descricao: 'Interpretação inteligente de texto transcrito para registro automático de vendas',
    categoria: 'ia',
    status: 'conectado',
    apiKeyConfigured: true,
    ultimaVerificacao: '2026-03-04T10:30:00',
    icon: 'Brain',
  },
  {
    id: 'abacatepay',
    nome: 'AbacatePay',
    descricao: 'Processamento de cobranças e assinaturas dos planos Cash Flow',
    categoria: 'pagamentos',
    status: 'conectado',
    apiKeyConfigured: true,
    ultimaVerificacao: '2026-03-04T08:00:00',
    icon: 'CreditCard',
  },
  {
    id: 'stripe',
    nome: 'Stripe',
    descricao: 'Gateway de pagamento para assinaturas recorrentes via cartão de crédito',
    categoria: 'pagamentos',
    status: 'desconectado',
    apiKeyConfigured: false,
    ultimaVerificacao: '2026-03-04T08:00:00',
    icon: 'CreditCard',
  },
];
