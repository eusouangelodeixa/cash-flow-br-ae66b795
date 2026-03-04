import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useDevices, Device } from '@/hooks/useDevices';
import { useSales } from '@/hooks/useSales';
import { conditionLabels } from '@/data/devices';
import { formatCurrency } from '@/lib/format';
import { ShoppingBag, ArrowLeftRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  device: Device;
  onClose: () => void;
}

const SellDeviceModal = ({ device, onClose }: Props) => {
  const { updateDevice, addDevice } = useDevices();
  const { addSale } = useSales();
  const { toast } = useToast();
  const [cliente, setCliente] = useState('');
  const [precoFinal, setPrecoFinal] = useState(String(device.preco_venda || ''));
  const [tipo, setTipo] = useState<'venda' | 'troca'>('venda');
  const [tradeModelo, setTradeModelo] = useState('');
  const [tradeCusto, setTradeCusto] = useState('');
  const [saving, setSaving] = useState(false);

  const condicaoLabel = conditionLabels[device.condicao as keyof typeof conditionLabels] || device.condicao;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      // Create sale
      await addSale.mutateAsync({
        device_id: device.id,
        modelo: device.modelo,
        capacidade: device.capacidade,
        cor: device.cor,
        condicao: condicaoLabel,
        tipo,
        status: 'concluida',
        preco_venda: parseFloat(precoFinal) || 0,
        preco_custo: device.preco_custo,
        cliente,
        aparelho_troca_id: null,
      });

      // Mark device as sold
      await updateDevice.mutateAsync({
        id: device.id,
        updates: { status: 'vendido' },
      });

      // If trade, add the traded device
      if (tipo === 'troca' && tradeModelo) {
        await addDevice.mutateAsync({
          modelo: tradeModelo,
          capacidade: '128GB',
          cor: 'Preto',
          cor_hex: '#1C1C1E',
          condicao: 'usado_b',
          status: 'em_revisao',
          imei: '',
          preco_custo: parseFloat(tradeCusto) || 0,
          preco_venda: null,
          notas: 'Recebido em troca',
          origem_troca: null,
        });
      }

      toast({
        title: tipo === 'troca' ? 'Troca registrada!' : 'Venda registrada!',
        description: `${device.modelo} vendido para ${cliente}.`,
      });
      onClose();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="glass-card bg-card max-w-md mx-4 md:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShoppingBag size={20} strokeWidth={1.5} className="text-primary" />
            Registrar Venda
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
            <p className="text-sm font-medium text-foreground">{device.modelo}</p>
            <p className="text-xs text-muted-foreground">{device.capacidade} · {device.cor}</p>
            <p className="font-mono text-sm text-cf-gold mt-1">{device.preco_venda ? formatCurrency(device.preco_venda) : '—'}</p>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Tipo</label>
            <div className="flex gap-2">
              <button onClick={() => setTipo('venda')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all ${tipo === 'venda' ? 'bg-primary text-white' : 'bg-[rgba(255,255,255,0.04)] text-muted-foreground border border-[rgba(255,255,255,0.08)]'}`}>
                <ShoppingBag size={14} strokeWidth={1.5} /> Venda
              </button>
              <button onClick={() => setTipo('troca')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all ${tipo === 'troca' ? 'bg-cf-gold text-background' : 'bg-[rgba(255,255,255,0.04)] text-muted-foreground border border-[rgba(255,255,255,0.08)]'}`}>
                <ArrowLeftRight size={14} strokeWidth={1.5} /> Troca
              </button>
            </div>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Cliente</label>
            <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="label-uppercase block mb-2">Preço final</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm-apple text-muted-foreground">R$</span>
              <input type="number" value={precoFinal} onChange={e => setPrecoFinal(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          {tipo === 'troca' && (
            <div className="space-y-3 p-3 rounded-xl border border-cf-gold/20 bg-cf-gold/5">
              <p className="text-xs font-medium text-cf-gold">Aparelho recebido em troca</p>
              <input value={tradeModelo} onChange={e => setTradeModelo(e.target.value)} placeholder="Modelo (ex: iPhone 13)" className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm-apple text-muted-foreground">R$</span>
                <input type="number" value={tradeCusto} onChange={e => setTradeCusto(e.target.value)} placeholder="Valor estimado" className="w-full pl-12 pr-4 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none" />
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm-apple text-muted-foreground hover:text-foreground">Cancelar</button>
          <button onClick={handleConfirm} disabled={!cliente || !precoFinal || saving} className="px-6 py-2 bg-cf-green text-background rounded-lg text-sm-apple font-medium disabled:opacity-30 hover:opacity-90 active:scale-[0.97] transition-all">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Venda'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellDeviceModal;
