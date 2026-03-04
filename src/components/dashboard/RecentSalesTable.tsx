import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/format';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sale } from '@/hooks/useSales';

const PAGE_SIZE = 8;

interface Props {
  sales: Sale[];
}

const RecentSalesTable = ({ sales }: Props) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(sales.length / PAGE_SIZE);
  const paginated = sales.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusPill = (status: string) => {
    switch (status) {
      case 'concluida': return 'status-pill-green';
      case 'em_revisao': return 'status-pill-amber';
      case 'cancelada': return 'status-pill-red';
      default: return 'status-pill-blue';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'em_revisao': return 'Em Revisão';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  if (sales.length === 0) {
    return (
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '360ms' }}>
        <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-4 md:mb-6">Últimas Vendas</h3>
        <p className="text-center text-muted-foreground text-sm py-8">Nenhuma venda registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '360ms' }}>
      <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-4 md:mb-6">Últimas Vendas</h3>
      
      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
        {paginated.map(sale => (
          <div key={sale.id} className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">{sale.modelo}</p>
                <p className="text-xs text-muted-foreground">{sale.capacidade} · {sale.cor}</p>
              </div>
              <span className={statusPill(sale.status)}>{statusLabel(sale.status)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">{formatDate(sale.created_at)}</span>
              <span className="font-mono text-sm text-foreground">{formatCurrency(sale.preco_venda)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="label-uppercase pb-3 pr-4">Data</th>
              <th className="label-uppercase pb-3 pr-4">Modelo</th>
              <th className="label-uppercase pb-3 pr-4 hidden lg:table-cell">Cap.</th>
              <th className="label-uppercase pb-3 pr-4 hidden lg:table-cell">Cor</th>
              <th className="label-uppercase pb-3 pr-4 hidden xl:table-cell">Condição</th>
              <th className="label-uppercase pb-3 pr-4">Preço</th>
              <th className="label-uppercase pb-3 pr-4 hidden lg:table-cell">Tipo</th>
              <th className="label-uppercase pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(sale => (
              <tr key={sale.id} className="border-t border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-100">
                <td className="py-3 pr-4 font-mono text-sm-apple text-muted-foreground">{formatDate(sale.created_at)}</td>
                <td className="py-3 pr-4 text-sm-apple text-foreground font-medium">{sale.modelo}</td>
                <td className="py-3 pr-4 text-sm-apple text-muted-foreground hidden lg:table-cell">{sale.capacidade}</td>
                <td className="py-3 pr-4 text-sm-apple text-muted-foreground hidden lg:table-cell">{sale.cor}</td>
                <td className="py-3 pr-4 text-sm-apple text-muted-foreground hidden xl:table-cell">{sale.condicao}</td>
                <td className="py-3 pr-4 font-mono text-sm-apple text-foreground">{formatCurrency(sale.preco_venda)}</td>
                <td className="py-3 pr-4 text-sm-apple hidden lg:table-cell">
                  <span className={sale.tipo === 'troca' ? 'status-pill-amber' : 'status-pill-blue'}>
                    {sale.tipo === 'troca' ? 'Troca' : 'Venda'}
                  </span>
                </td>
                <td className="py-3"><span className={statusPill(sale.status)}>{statusLabel(sale.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 md:gap-2 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-[rgba(255,255,255,0.04)]">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm-apple font-medium transition-colors ${page === i ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
              {i + 1}
            </button>
          ))}
          {totalPages > 5 && <span className="text-muted-foreground text-xs">...</span>}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentSalesTable;
