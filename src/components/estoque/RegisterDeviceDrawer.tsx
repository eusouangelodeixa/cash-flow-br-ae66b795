import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDevices } from '@/hooks/useDevices';
import { useAuth } from '@/contexts/AuthContext';
import { iPhoneModels, capacidades, cores, DeviceCondition } from '@/data/devices';
import { formatCurrency } from '@/lib/format';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

const conditions: { value: DeviceCondition; label: string; desc: string; icon: string }[] = [
  { value: 'novo_lacrado', label: 'Novo Lacrado', desc: 'Embalagem original selada', icon: '📦' },
  { value: 'usado_a', label: 'Usado Grade A', desc: 'Sem marcas visíveis de uso', icon: '✨' },
  { value: 'usado_b', label: 'Usado Grade B', desc: 'Marcas leves de uso', icon: '👍' },
  { value: 'para_pecas', label: 'Para Peças', desc: 'Defeito ou dano significativo', icon: '🔧' },
];

const RegisterDeviceDrawer = ({ open, onClose }: Props) => {
  const { addDevice } = useDevices();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [cor, setCor] = useState('');
  const [corHex, setCorHex] = useState('');
  const [imei, setImei] = useState('');
  const [condicao, setCondicao] = useState<DeviceCondition | ''>('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStep(1); setModelo(''); setCapacidade(''); setCor(''); setCorHex('');
    setImei(''); setCondicao(''); setPrecoCusto(''); setPrecoVenda(''); setNotas('');
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addDevice.mutateAsync({
        modelo, capacidade, cor, cor_hex: corHex,
        condicao: condicao as DeviceCondition,
        status: 'disponivel',
        imei,
        preco_custo: parseFloat(precoCusto) || 0,
        preco_venda: parseFloat(precoVenda) || null,
        notas,
        origem_troca: null,
      });
      toast({ title: 'Aparelho cadastrado', description: `${modelo} adicionado ao estoque.` });
      reset();
      onClose();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const canNext1 = modelo && capacidade && cor;
  const canNext2 = condicao && precoCusto;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <SheetContent className="w-full sm:max-w-[480px] bg-card border-l border-[rgba(255,255,255,0.08)] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle className="text-foreground font-display">Cadastrar Aparelho</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 my-4 md:my-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-colors ${s <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {s < step ? <Check size={14} strokeWidth={2} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-px ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 md:space-y-5 animate-fade-in">
            <div>
              <label className="label-uppercase block mb-2">Modelo</label>
              <select value={modelo} onChange={e => setModelo(e.target.value)} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground focus:outline-none appearance-none">
                <option value="">Selecione o modelo</option>
                {iPhoneModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-uppercase block mb-2">Capacidade</label>
              <div className="flex flex-wrap gap-2">
                {capacidades.map(c => (
                  <button key={c} onClick={() => setCapacidade(c)} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm-apple font-medium transition-all ${capacidade === c ? 'bg-primary text-white' : 'bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:text-foreground border border-[rgba(255,255,255,0.08)]'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-uppercase block mb-2">Cor</label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {cores.map(c => (
                  <button key={c.nome} onClick={() => { setCor(c.nome); setCorHex(c.hex); }} className={`group flex flex-col items-center gap-1 transition-all ${cor === c.nome ? 'scale-110' : 'hover:scale-105'}`} title={c.nome}>
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-colors ${cor === c.nome ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: c.hex }} />
                    <span className="text-[9px] md:text-[10px] text-muted-foreground">{c.nome}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-uppercase block mb-2">IMEI / Número de série</label>
              <input value={imei} onChange={e => setImei(e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="000000000000000" maxLength={15} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              {imei && imei.length < 15 && <p className="text-[10px] md:text-xs text-cf-red mt-1">IMEI deve ter 15 dígitos</p>}
            </div>
            <button onClick={() => setStep(2)} disabled={!canNext1} className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 bg-foreground text-background rounded-xl text-xs md:text-sm-apple font-medium disabled:opacity-30 hover:opacity-90 active:scale-[0.97] transition-all">
              Próximo <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 md:space-y-5 animate-fade-in">
            <div>
              <label className="label-uppercase block mb-3">Condição</label>
              <div className="space-y-2">
                {conditions.map(c => (
                  <button key={c.value} onClick={() => setCondicao(c.value)} className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all ${condicao === c.value ? 'border-primary bg-primary/10' : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]'}`}>
                    <span className="text-xl md:text-2xl">{c.icon}</span>
                    <div className="text-left">
                      <p className="text-xs md:text-sm-apple font-medium text-foreground">{c.label}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                    {condicao === c.value && <Check size={16} strokeWidth={2} className="text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-uppercase block mb-2">Preço de custo</label>
              <div className="relative">
                <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xs md:text-sm-apple text-muted-foreground">R$</span>
                <input type="number" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} placeholder="0,00" className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div>
              <label className="label-uppercase block mb-2">Preço de venda</label>
              <div className="relative">
                <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xs md:text-sm-apple text-muted-foreground">R$</span>
                <input type="number" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} placeholder="0,00" className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl font-mono text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div>
              <label className="label-uppercase block mb-2">Observações (opcional)</label>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Notas sobre o aparelho..." className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm-apple text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft size={14} strokeWidth={1.5} /> Voltar
              </button>
              <button onClick={() => setStep(3)} disabled={!canNext2} className="flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 bg-foreground text-background rounded-xl text-xs md:text-sm-apple font-medium disabled:opacity-30 hover:opacity-90 active:scale-[0.97] transition-all">
                Revisar <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 md:space-y-5 animate-fade-in">
            <div className="glass-card p-4 md:p-5">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-14 md:w-16 aspect-[3/4] rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="34" viewBox="0 0 48 80" fill="none" className="opacity-20"><rect x="2" y="2" width="44" height="76" rx="10" stroke="currentColor" strokeWidth="1.5" /></svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm md:text-base-apple font-display font-semibold text-foreground">{modelo}</h4>
                  <p className="text-xs md:text-sm-apple text-muted-foreground">{capacidade} · {cor}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: corHex }} />
                    <span className="text-[10px] md:text-xs text-muted-foreground">{condicao ? conditions.find(c => c.value === condicao)?.label : ''}</span>
                  </div>
                  {imei && <p className="font-mono text-[10px] md:text-xs text-muted-foreground mt-1">IMEI: {imei}</p>}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex justify-between">
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Custo</p>
                  <p className="font-mono text-xs md:text-sm-apple text-foreground">{formatCurrency(parseFloat(precoCusto) || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] md:text-xs text-muted-foreground">Venda</p>
                  <p className="font-mono text-base md:text-lg-apple text-cf-gold">{formatCurrency(parseFloat(precoVenda) || 0)}</p>
                </div>
              </div>
              {notas && <p className="mt-3 text-[10px] md:text-xs text-muted-foreground italic">"{notas}"</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm-apple text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft size={14} strokeWidth={1.5} /> Voltar
              </button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 bg-cf-green text-background rounded-xl text-xs md:text-sm-apple font-semibold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Confirmar e Adicionar ao Estoque
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default RegisterDeviceDrawer;
