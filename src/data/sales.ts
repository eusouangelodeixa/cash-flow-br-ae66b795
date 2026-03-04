export type SaleType = 'venda' | 'troca';
export type SaleStatus = 'concluida' | 'em_revisao' | 'cancelada';

export interface Sale {
  id: string;
  deviceId: string;
  modelo: string;
  capacidade: string;
  cor: string;
  condicao: string;
  tipo: SaleType;
  status: SaleStatus;
  precoVenda: number;
  precoCusto: number;
  data: string;
  cliente: string;
  aparelhoTrocaId?: string;
}

export const saleStatusLabels: Record<SaleStatus, string> = {
  concluida: 'Concluída',
  em_revisao: 'Em Revisão',
  cancelada: 'Cancelada',
};

const generateSales = (): Sale[] => {
  const modelos = [
    { m: 'iPhone 16 Pro Max', cap: '256GB', cor: 'Titânio Natural', cond: 'Novo Lacrado', custo: 8200, venda: 9800 },
    { m: 'iPhone 16 Pro', cap: '128GB', cor: 'Titânio Azul', cond: 'Novo Lacrado', custo: 7500, venda: 8900 },
    { m: 'iPhone 15 Pro Max', cap: '256GB', cor: 'Titânio Preto', cond: 'Usado Grade A', custo: 5800, venda: 7200 },
    { m: 'iPhone 15 Pro', cap: '128GB', cor: 'Titânio Branco', cond: 'Usado Grade A', custo: 4900, venda: 6200 },
    { m: 'iPhone 15', cap: '128GB', cor: 'Azul', cond: 'Novo Lacrado', custo: 4200, venda: 5100 },
    { m: 'iPhone 14 Pro Max', cap: '256GB', cor: 'Roxo', cond: 'Usado Grade A', custo: 4500, venda: 5600 },
    { m: 'iPhone 14 Pro', cap: '128GB', cor: 'Dourado', cond: 'Usado Grade B', custo: 3200, venda: 4100 },
    { m: 'iPhone 14', cap: '128GB', cor: 'Vermelho', cond: 'Novo Lacrado', custo: 3500, venda: 4300 },
    { m: 'iPhone 13 Pro Max', cap: '256GB', cor: 'Verde', cond: 'Usado Grade A', custo: 3800, venda: 4700 },
    { m: 'iPhone 13 Pro', cap: '128GB', cor: 'Prateado', cond: 'Usado Grade B', custo: 2800, venda: 3500 },
    { m: 'iPhone 13', cap: '128GB', cor: 'Rosa', cond: 'Usado Grade A', custo: 2400, venda: 3100 },
    { m: 'iPhone 12 Pro', cap: '128GB', cor: 'Dourado', cond: 'Usado Grade B', custo: 2100, venda: 2800 },
  ];

  const clientes = ['Lucas Mendes', 'Ana Clara', 'Pedro Santos', 'Maria Silva', 'João Oliveira', 'Carla Souza', 'Rafael Lima', 'Juliana Costa', 'Bruno Ferreira', 'Amanda Alves', 'Thiago Ribeiro', 'Fernanda Gomes', 'Gustavo Pereira', 'Camila Martins', 'Diego Nascimento'];

  const sales: Sale[] = [];
  
  for (let i = 0; i < 50; i++) {
    const m = modelos[i % modelos.length];
    const day = Math.max(1, 28 - i);
    const month = i < 28 ? 2 : 1;
    const isTrade = i % 7 === 0;
    const isCanceled = i === 15 || i === 32;
    
    sales.push({
      id: `s${i + 1}`,
      deviceId: `d${(i % 22) + 1}`,
      modelo: m.m,
      capacidade: m.cap,
      cor: m.cor,
      condicao: m.cond,
      tipo: isTrade ? 'troca' : 'venda',
      status: isCanceled ? 'cancelada' : isTrade && i < 5 ? 'em_revisao' : 'concluida',
      precoVenda: m.venda + Math.round((Math.random() - 0.5) * 400),
      precoCusto: m.custo,
      data: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      cliente: clientes[i % clientes.length],
      aparelhoTrocaId: isTrade ? `d${12 + (i % 3)}` : undefined,
    });
  }

  return sales.sort((a, b) => b.data.localeCompare(a.data));
};

export const mockSales = generateSales();

// Revenue data for charts
export const revenueData = [
  { date: '01/02', revenue: 18500, sales: 3 },
  { date: '03/02', revenue: 12800, sales: 2 },
  { date: '05/02', revenue: 24300, sales: 4 },
  { date: '07/02', revenue: 9200, sales: 1 },
  { date: '09/02', revenue: 31500, sales: 5 },
  { date: '11/02', revenue: 15700, sales: 2 },
  { date: '13/02', revenue: 28900, sales: 4 },
  { date: '15/02', revenue: 22100, sales: 3 },
  { date: '17/02', revenue: 35600, sales: 6 },
  { date: '19/02', revenue: 19400, sales: 3 },
  { date: '21/02', revenue: 27800, sales: 4 },
  { date: '23/02', revenue: 41200, sales: 7 },
  { date: '25/02', revenue: 33500, sales: 5 },
  { date: '27/02', revenue: 26700, sales: 4 },
  { date: '01/03', revenue: 38900, sales: 6 },
  { date: '03/03', revenue: 29100, sales: 4 },
];
