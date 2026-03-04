export interface UserProfile {
  nome: string;
  loja: string;
  email: string;
  whatsapp: string;
  instagram: string;
  avatar: string;
  plano: 'cashflow';
  planoNome: string;
  dataRenovacao: string;
  dataCadastro: string;
}

export const mockUser: UserProfile = {
  nome: 'Ricardo Almeida',
  loja: 'RA iPhones Premium',
  email: 'ricardo@raiphones.com.br',
  whatsapp: '+55 11 99876-5432',
  instagram: '@raiphones',
  avatar: '',
  plano: 'cashflow',
  planoNome: 'Cash Flow',
  dataRenovacao: '2026-04-15',
  dataCadastro: '2025-06-01',
};

export interface Plan {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  features: string[];
  destaque: boolean;
  badge?: string;
}

export const plans: Plan[] = [
  {
    id: 'cashflow',
    nome: 'Cash Flow',
    preco: 89,
    periodo: '/mês',
    features: [
      'Aparelhos ilimitados no estoque',
      'Dashboard completo com gráficos',
      'Registro de vendas por áudio via WhatsApp',
      'Relatórios de faturamento',
      'Suporte prioritário',
      'Exportação de dados',
    ],
    destaque: true,
    badge: '✦ Plano Único',
  },
];
