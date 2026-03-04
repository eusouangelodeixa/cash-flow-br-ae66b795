export type DeviceCondition = 'novo_lacrado' | 'usado_a' | 'usado_b' | 'para_pecas';
export type DeviceStatus = 'disponivel' | 'em_revisao' | 'vendido' | 'reservado';

export interface Device {
  id: string;
  modelo: string;
  capacidade: string;
  cor: string;
  corHex: string;
  condicao: DeviceCondition;
  status: DeviceStatus;
  imei: string;
  precoCusto: number;
  precoVenda: number | null;
  notas: string;
  dataCadastro: string;
  origemTroca?: string; // sale ID if came from trade
  historico: { data: string; evento: string }[];
}

export const conditionLabels: Record<DeviceCondition, string> = {
  novo_lacrado: 'Novo Lacrado',
  usado_a: 'Usado Grade A',
  usado_b: 'Usado Grade B',
  para_pecas: 'Para Peças',
};

export const statusLabels: Record<DeviceStatus, string> = {
  disponivel: 'Disponível',
  em_revisao: 'Em Revisão',
  vendido: 'Vendido',
  reservado: 'Reservado',
};

export const iPhoneModels = [
  'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
  'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
  'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
  'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
  'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
  'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
];

export const capacidades = ['64GB', '128GB', '256GB', '512GB', '1TB'];

export const cores = [
  { nome: 'Preto', hex: '#1C1C1E' },
  { nome: 'Branco', hex: '#F5F5F7' },
  { nome: 'Azul', hex: '#A1C6EA' },
  { nome: 'Vermelho', hex: '#BF0013' },
  { nome: 'Dourado', hex: '#F4E0C7' },
  { nome: 'Prateado', hex: '#E3E4E6' },
  { nome: 'Roxo', hex: '#C8A2D0' },
  { nome: 'Verde', hex: '#394F3B' },
  { nome: 'Rosa', hex: '#F9C0C7' },
  { nome: 'Titânio Natural', hex: '#A8A49E' },
  { nome: 'Titânio Azul', hex: '#3E4650' },
  { nome: 'Titânio Preto', hex: '#2E2C2D' },
  { nome: 'Titânio Branco', hex: '#F2F1ED' },
];

export const mockDevices: Device[] = [
  { id: 'd1', modelo: 'iPhone 16 Pro Max', capacidade: '256GB', cor: 'Titânio Natural', corHex: '#A8A49E', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012345', precoCusto: 8200, precoVenda: 9800, notas: '', dataCadastro: '2026-02-28', historico: [{ data: '2026-02-28', evento: 'Cadastrado no estoque' }] },
  { id: 'd2', modelo: 'iPhone 16 Pro', capacidade: '128GB', cor: 'Titânio Azul', corHex: '#3E4650', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012346', precoCusto: 7500, precoVenda: 8900, notas: '', dataCadastro: '2026-02-27', historico: [{ data: '2026-02-27', evento: 'Cadastrado no estoque' }] },
  { id: 'd3', modelo: 'iPhone 15 Pro Max', capacidade: '256GB', cor: 'Titânio Preto', corHex: '#2E2C2D', condicao: 'usado_a', status: 'disponivel', imei: '353456789012347', precoCusto: 5800, precoVenda: 7200, notas: 'Sem marcas de uso', dataCadastro: '2026-02-25', historico: [{ data: '2026-02-25', evento: 'Cadastrado no estoque' }] },
  { id: 'd4', modelo: 'iPhone 15 Pro', capacidade: '128GB', cor: 'Titânio Branco', corHex: '#F2F1ED', condicao: 'usado_a', status: 'disponivel', imei: '353456789012348', precoCusto: 4900, precoVenda: 6200, notas: '', dataCadastro: '2026-02-24', historico: [{ data: '2026-02-24', evento: 'Cadastrado no estoque' }] },
  { id: 'd5', modelo: 'iPhone 15', capacidade: '128GB', cor: 'Azul', corHex: '#A1C6EA', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012349', precoCusto: 4200, precoVenda: 5100, notas: '', dataCadastro: '2026-02-23', historico: [{ data: '2026-02-23', evento: 'Cadastrado no estoque' }] },
  { id: 'd6', modelo: 'iPhone 14 Pro Max', capacidade: '256GB', cor: 'Roxo', corHex: '#C8A2D0', condicao: 'usado_a', status: 'disponivel', imei: '353456789012350', precoCusto: 4500, precoVenda: 5600, notas: 'Bateria 92%', dataCadastro: '2026-02-22', historico: [{ data: '2026-02-22', evento: 'Cadastrado no estoque' }] },
  { id: 'd7', modelo: 'iPhone 14 Pro', capacidade: '128GB', cor: 'Dourado', corHex: '#F4E0C7', condicao: 'usado_b', status: 'disponivel', imei: '353456789012351', precoCusto: 3200, precoVenda: 4100, notas: 'Pequeno risco na tela', dataCadastro: '2026-02-21', historico: [{ data: '2026-02-21', evento: 'Cadastrado no estoque' }] },
  { id: 'd8', modelo: 'iPhone 14', capacidade: '128GB', cor: 'Vermelho', corHex: '#BF0013', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012352', precoCusto: 3500, precoVenda: 4300, notas: '', dataCadastro: '2026-02-20', historico: [{ data: '2026-02-20', evento: 'Cadastrado no estoque' }] },
  { id: 'd9', modelo: 'iPhone 13 Pro Max', capacidade: '256GB', cor: 'Verde', corHex: '#394F3B', condicao: 'usado_a', status: 'vendido', imei: '353456789012353', precoCusto: 3800, precoVenda: 4700, notas: '', dataCadastro: '2026-02-15', historico: [{ data: '2026-02-15', evento: 'Cadastrado no estoque' }, { data: '2026-02-20', evento: 'Vendido' }] },
  { id: 'd10', modelo: 'iPhone 13 Pro', capacidade: '128GB', cor: 'Prateado', corHex: '#E3E4E6', condicao: 'usado_b', status: 'vendido', imei: '353456789012354', precoCusto: 2800, precoVenda: 3500, notas: '', dataCadastro: '2026-02-10', historico: [{ data: '2026-02-10', evento: 'Cadastrado no estoque' }, { data: '2026-02-18', evento: 'Vendido' }] },
  { id: 'd11', modelo: 'iPhone 13', capacidade: '128GB', cor: 'Rosa', corHex: '#F9C0C7', condicao: 'usado_a', status: 'vendido', imei: '353456789012355', precoCusto: 2400, precoVenda: 3100, notas: '', dataCadastro: '2026-02-08', historico: [{ data: '2026-02-08', evento: 'Cadastrado' }, { data: '2026-02-16', evento: 'Vendido' }] },
  { id: 'd12', modelo: 'iPhone 16 Pro Max', capacidade: '512GB', cor: 'Titânio Preto', corHex: '#2E2C2D', condicao: 'usado_a', status: 'em_revisao', imei: '353456789012356', precoCusto: 6500, precoVenda: null, notas: 'Recebido em troca', dataCadastro: '2026-03-01', origemTroca: 's45', historico: [{ data: '2026-03-01', evento: 'Recebido em troca (Venda #45)' }] },
  { id: 'd13', modelo: 'iPhone 15 Plus', capacidade: '256GB', cor: 'Azul', corHex: '#A1C6EA', condicao: 'usado_b', status: 'em_revisao', imei: '353456789012357', precoCusto: 3800, precoVenda: null, notas: 'Tela com marca leve', dataCadastro: '2026-03-02', origemTroca: 's48', historico: [{ data: '2026-03-02', evento: 'Recebido em troca (Venda #48)' }] },
  { id: 'd14', modelo: 'iPhone 12 Pro', capacidade: '128GB', cor: 'Dourado', corHex: '#F4E0C7', condicao: 'usado_b', status: 'vendido', imei: '353456789012358', precoCusto: 2100, precoVenda: 2800, notas: '', dataCadastro: '2026-01-20', historico: [{ data: '2026-01-20', evento: 'Cadastrado' }, { data: '2026-02-05', evento: 'Vendido' }] },
  { id: 'd15', modelo: 'iPhone 12', capacidade: '64GB', cor: 'Branco', corHex: '#F5F5F7', condicao: 'usado_a', status: 'vendido', imei: '353456789012359', precoCusto: 1600, precoVenda: 2200, notas: '', dataCadastro: '2026-01-15', historico: [{ data: '2026-01-15', evento: 'Cadastrado' }, { data: '2026-01-28', evento: 'Vendido' }] },
  { id: 'd16', modelo: 'iPhone 16', capacidade: '128GB', cor: 'Preto', corHex: '#1C1C1E', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012360', precoCusto: 5200, precoVenda: 6300, notas: '', dataCadastro: '2026-03-01', historico: [{ data: '2026-03-01', evento: 'Cadastrado no estoque' }] },
  { id: 'd17', modelo: 'iPhone 16 Plus', capacidade: '256GB', cor: 'Rosa', corHex: '#F9C0C7', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012361', precoCusto: 6000, precoVenda: 7200, notas: '', dataCadastro: '2026-03-02', historico: [{ data: '2026-03-02', evento: 'Cadastrado no estoque' }] },
  { id: 'd18', modelo: 'iPhone 14 Plus', capacidade: '128GB', cor: 'Branco', corHex: '#F5F5F7', condicao: 'usado_a', status: 'disponivel', imei: '353456789012362', precoCusto: 3000, precoVenda: 3900, notas: 'Bateria 95%', dataCadastro: '2026-02-26', historico: [{ data: '2026-02-26', evento: 'Cadastrado no estoque' }] },
  { id: 'd19', modelo: 'iPhone 11 Pro', capacidade: '64GB', cor: 'Verde', corHex: '#394F3B', condicao: 'usado_b', status: 'vendido', imei: '353456789012363', precoCusto: 1200, precoVenda: 1800, notas: '', dataCadastro: '2026-01-10', historico: [{ data: '2026-01-10', evento: 'Cadastrado' }, { data: '2026-01-25', evento: 'Vendido' }] },
  { id: 'd20', modelo: 'iPhone 13 Mini', capacidade: '128GB', cor: 'Vermelho', corHex: '#BF0013', condicao: 'usado_a', status: 'disponivel', imei: '353456789012364', precoCusto: 2000, precoVenda: 2700, notas: '', dataCadastro: '2026-02-28', historico: [{ data: '2026-02-28', evento: 'Cadastrado no estoque' }] },
  { id: 'd21', modelo: 'iPhone 15 Pro', capacidade: '512GB', cor: 'Titânio Natural', corHex: '#A8A49E', condicao: 'novo_lacrado', status: 'disponivel', imei: '353456789012365', precoCusto: 7000, precoVenda: 8500, notas: '', dataCadastro: '2026-03-03', historico: [{ data: '2026-03-03', evento: 'Cadastrado no estoque' }] },
  { id: 'd22', modelo: 'iPhone 16 Pro', capacidade: '256GB', cor: 'Titânio Branco', corHex: '#F2F1ED', condicao: 'usado_a', status: 'disponivel', imei: '353456789012366', precoCusto: 7200, precoVenda: 8600, notas: 'Bateria 98%', dataCadastro: '2026-03-03', historico: [{ data: '2026-03-03', evento: 'Cadastrado no estoque' }] },
];
