import { useState, useMemo } from 'react';
import { useDevices, Device } from '@/hooks/useDevices';
import { conditionLabels, statusLabels } from '@/data/devices';
import { formatCurrency, formatDate } from '@/lib/format';
import { Search, Plus, Edit, ShoppingBag, Lock, X, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RegisterDeviceDrawer from '@/components/estoque/RegisterDeviceDrawer';
import ReviewPricingModal from '@/components/estoque/ReviewPricingModal';
import EditDeviceDrawer from '@/components/estoque/EditDeviceDrawer';
import SellDeviceModal from '@/components/estoque/SellDeviceModal';

type Tab = 'todos' | 'disponivel' | 'em_revisao' | 'vendido';

const tabs: { key: Tab; label: string; mobileLabel: string }[] = [
  { key: 'todos', label: 'Todos os Aparelhos', mobileLabel: 'Todos' },
  { key: 'disponivel', label: 'Disponíveis', mobileLabel: 'Disponíveis' },
  { key: 'em_revisao', label: 'Em Revisão', mobileLabel: 'Revisão' },
  { key: 'vendido', label: 'Vendidos', mobileLabel: 'Vendidos' },
];

const Estoque = () => {
  const { devices, isLoading, deleteDevice } = useDevices();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('todos');
  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [reviewDevice, setReviewDevice] = useState<Device | null>(null);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [sellDevice, setSellDevice] = useState<Device | null>(null);

  const reviewCount = devices.filter(d => d.status === 'em_revisao').length;

  const filtered = useMemo(() => {
    let list = devices;
    if (activeTab !== 'todos') {
      list = list.filter(d => d.status === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.modelo.toLowerCase().includes(q) ||
        d.cor.toLowerCase().includes(q) ||
        d.capacidade.toLowerCase().includes(q) ||
        d.imei.includes(q)
      );
    }
    return list;
  }, [devices, activeTab, search]);

  const conditionColor = (c: string) => {
    switch (c) {
      case 'novo_lacrado': return 'status-pill-green';
      case 'usado_a': return 'status-pill-blue';
      case 'usado_b': return 'status-pill-amber';
      case 'para_pecas': return 'status-pill-red';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg md:text-xl-apple font-display font-bold text-foreground">Estoque</h1>
        <button onClick={() => setShowRegister(true)} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-foreground text-background rounded-lg text-xs md:text-sm-apple font-medium hover:opacity-90 transition-opacity active:scale-[0.97]">
          <Plus size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">Cadastrar Aparelho</span>
          <span className="sm:hidden">Cadastrar</span>
        </button>
      </div>

      {reviewCount > 0 && (
        <div className="glass-card p-3 md:p-4 border-l-2 border-cf-gold flex items-center gap-3">
          <AlertTriangle size={18} strokeWidth={1.5} className="text-cf-gold flex-shrink-0" />
          <p className="text-xs md:text-sm-apple text-foreground">
            <span className="font-medium">{reviewCount} aparelho{reviewCount > 1 ? 's' : ''}</span> aguarda{reviewCount > 1 ? 'm' : ''} precificação
          </p>
        </div>
      )}

      <div className="flex items-center gap-0.5 md:gap-1 border-b border-[rgba(255,255,255,0.08)] overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm-apple font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden">{tab.mobileLabel}</span>
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Buscar modelo, cor, capacidade..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 md:pl-11 pr-9 md:pr-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((device, i) => (
          <div key={device.id} className="glass-card p-4 md:p-5 relative group animate-fade-in" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
            {device.status === 'em_revisao' && (
              <div className="absolute inset-0 bg-background/40 rounded-apple flex items-center justify-center z-10">
                <Lock size={24} strokeWidth={1.5} className="text-cf-gold" />
              </div>
            )}
            <div className="w-full aspect-[3/4] rounded-xl bg-[rgba(255,255,255,0.03)] mb-3 md:mb-4 flex items-center justify-center">
              <svg width="40" height="68" viewBox="0 0 48 80" fill="none" className="opacity-20">
                <rect x="2" y="2" width="44" height="76" rx="10" stroke="currentColor" strokeWidth="1.5" />
                <rect x="18" y="68" width="12" height="2" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="16" y="6" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-0.5 md:mb-1">{device.modelo}</h3>
            <p className="text-xs md:text-sm-apple text-muted-foreground mb-2">{device.capacidade} · {device.cor}</p>
            <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
              <span className={conditionColor(device.condicao)}>{conditionLabels[device.condicao as keyof typeof conditionLabels]}</span>
              {device.status === 'em_revisao' && <span className="status-pill-amber animate-pulse-review">Em Revisão</span>}
            </div>
            <p className="font-mono text-base md:text-lg-apple text-cf-gold">{device.preco_venda ? formatCurrency(device.preco_venda) : '—'}</p>
            <div className="mt-3 md:mt-0 md:absolute md:bottom-5 md:left-5 md:right-5 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 z-20">
              {device.status === 'em_revisao' ? (
                <button onClick={() => setReviewDevice(device)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-cf-gold/20 text-cf-gold rounded-lg text-xs font-medium hover:bg-cf-gold/30 transition-colors">
                  Definir Preço & Liberar
                </button>
              ) : device.status === 'disponivel' ? (
                <>
                  <button onClick={() => setEditDevice(device)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-[rgba(255,255,255,0.08)] text-foreground rounded-lg text-xs font-medium hover:bg-[rgba(255,255,255,0.12)] transition-colors">
                    <Edit size={13} strokeWidth={1.5} /> Editar
                  </button>
                  <button onClick={() => setSellDevice(device)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary/20 text-primary rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors">
                    <ShoppingBag size={13} strokeWidth={1.5} /> Vender
                  </button>
                </>
              ) : null}
              {device.status !== 'vendido' && (
                <button
                  onClick={() => {
                    if (deletingId === device.id) return;
                    if (window.confirm(`Deseja realmente excluir ${device.modelo}?`)) {
                      setDeletingId(device.id);
                      deleteDevice.mutate(device.id, {
                        onSuccess: () => {
                          toast.success('Aparelho excluído com sucesso');
                          setDeletingId(null);
                        },
                        onError: () => {
                          toast.error('Erro ao excluir aparelho');
                          setDeletingId(null);
                        },
                      });
                    }
                  }}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-destructive/20 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/30 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <p className="text-muted-foreground text-sm md:text-base-apple">Nenhum aparelho encontrado</p>
        </div>
      )}

      <RegisterDeviceDrawer open={showRegister} onClose={() => setShowRegister(false)} />
      {reviewDevice && <ReviewPricingModal device={reviewDevice} onClose={() => setReviewDevice(null)} />}
      {editDevice && <EditDeviceDrawer device={editDevice} onClose={() => setEditDevice(null)} />}
      {sellDevice && <SellDeviceModal device={sellDevice} onClose={() => setSellDevice(null)} />}
    </div>
  );
};

export default Estoque;
