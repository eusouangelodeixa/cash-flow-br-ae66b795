import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useDevices, Device } from '@/hooks/useDevices';
import { useSales } from '@/hooks/useSales';
import { conditionLabels } from '@/data/devices';
import { formatCurrency } from '@/lib/format';
import { Unlock, Loader2 } from 'lucide-react';
import { DeviceCondition } from '@/data/devices';

interface Props {
  device: Device;
  onClose: () => void;
}

const ReviewPricingModal = ({ device, onClose }: Props) => {
  const { updateDevice } = useDevices();
  const [precoVenda, setPrecoVenda] = useState('');
  const [condicao, setCondicao] = useState<DeviceCondition>(device.condicao as DeviceCondition);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await updateDevice.mutateAsync({
        id: device.id,
        updates: {
          preco_venda: parseFloat(precoVenda) || 0,
          condicao,
          status: 'disponivel',
        },
      });
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="glass-card bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Unlock size={20} strokeWidth={1.5} className="text-cf-gold" />
            Definir Preço & Liberar
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-base-apple font-display font-semibold text-foreground">{device.modelo}</p>
            <p className="text-sm-apple text-muted-foreground">{device.capacidade} · {device.cor}</p>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Condição</label>
            <select value={condicao} onChange={e => setCondicao(e.target.value as DeviceCondition)} className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm-apple text-foreground focus:outline-none appearance-none">
              {Object.entries(conditionLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Preço de venda</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm-apple text-muted-foreground">R$</span>
              <input type="number" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} placeholder="0,00" className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" autoFocus />
            </div>
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 text-sm-apple text-muted-foreground hover:text-foreground">Cancelar</button>
          <button onClick={handleConfirm} disabled={!precoVenda || saving} className="px-6 py-2 bg-cf-green text-background rounded-lg text-sm-apple font-medium disabled:opacity-30 hover:opacity-90 active:scale-[0.97] transition-all">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Liberar para Venda'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPricingModal;
