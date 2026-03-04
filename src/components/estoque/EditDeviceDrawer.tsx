import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDevices, Device } from '@/hooks/useDevices';
import { iPhoneModels, capacidades, cores, DeviceCondition, conditionLabels } from '@/data/devices';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

interface Props {
  device: Device;
  onClose: () => void;
}

const EditDeviceDrawer = ({ device, onClose }: Props) => {
  const { updateDevice } = useDevices();
  const { toast } = useToast();
  const [modelo, setModelo] = useState(device.modelo);
  const [capacidade, setCapacidade] = useState(device.capacidade);
  const [cor, setCor] = useState(device.cor);
  const [corHex, setCorHex] = useState(device.cor_hex);
  const [condicao, setCondicao] = useState<DeviceCondition>(device.condicao as DeviceCondition);
  const [precoCusto, setPrecoCusto] = useState(String(device.preco_custo));
  const [precoVenda, setPrecoVenda] = useState(String(device.preco_venda || ''));
  const [notas, setNotas] = useState(device.notas);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDevice.mutateAsync({
        id: device.id,
        updates: {
          modelo, capacidade, cor, cor_hex: corHex, condicao,
          preco_custo: parseFloat(precoCusto) || 0,
          preco_venda: parseFloat(precoVenda) || null,
          notas,
        },
      });
      toast({ title: 'Aparelho atualizado', description: `${modelo} foi atualizado com sucesso.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] bg-card border-l border-[rgba(255,255,255,0.08)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground font-display">Editar Aparelho</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <label className="label-uppercase block mb-2">Modelo</label>
            <select value={modelo} onChange={e => setModelo(e.target.value)} className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm-apple text-foreground focus:outline-none appearance-none">
              {iPhoneModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Capacidade</label>
            <div className="flex flex-wrap gap-2">
              {capacidades.map(c => (
                <button key={c} onClick={() => setCapacidade(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${capacidade === c ? 'bg-primary text-white' : 'bg-[rgba(255,255,255,0.04)] text-muted-foreground border border-[rgba(255,255,255,0.08)]'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Cor</label>
            <div className="flex flex-wrap gap-2">
              {cores.map(c => (
                <button key={c.nome} onClick={() => { setCor(c.nome); setCorHex(c.hex); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${cor === c.nome ? 'bg-primary/20 border-primary' : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]'} border`}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Condição</label>
            <select value={condicao} onChange={e => setCondicao(e.target.value as DeviceCondition)} className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm-apple text-foreground focus:outline-none appearance-none">
              {Object.entries(conditionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Preço de custo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm-apple text-muted-foreground">R$</span>
              <input type="number" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Preço de venda</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm-apple text-muted-foreground">R$</span>
              <input type="number" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="label-uppercase block mb-2">Observações</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} className="w-full px-4 py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm-apple text-foreground focus:outline-none resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm-apple font-medium hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={1.5} />}
            Salvar Alterações
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditDeviceDrawer;
