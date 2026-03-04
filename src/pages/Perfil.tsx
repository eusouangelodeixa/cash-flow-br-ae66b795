import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Download, Loader2, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const Perfil = () => {
  const { user, subscription } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [form, setForm] = useState<{ nome: string; loja: string; whatsapp: string; instagram: string } | null>(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  // WhatsApp verification state
  const [verifyStep, setVerifyStep] = useState<'idle' | 'sending' | 'code' | 'verifying'>('idle');
  const [otpCode, setOtpCode] = useState('');

  const formData = form ?? {
    nome: profile?.nome || '',
    loja: profile?.loja || '',
    whatsapp: profile?.whatsapp || '',
    instagram: profile?.instagram || '',
  };

  const isDirty = profile && (
    formData.nome !== profile.nome ||
    formData.loja !== profile.loja ||
    formData.whatsapp !== profile.whatsapp ||
    formData.instagram !== profile.instagram
  );

  const passwordsValid = passwords.new && passwords.new === passwords.confirm && passwords.new.length >= 6;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync(formData);
      setForm(null);
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordsValid) return;
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setPasswords({ current: '', new: '', confirm: '' });
      toast({ title: 'Senha alterada', description: 'Sua senha foi atualizada com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleExport = async () => {
    const { data: devices } = await supabase.from('devices').select('*');
    const { data: sales } = await supabase.from('sales').select('*');
    const data = { profile, devices, sales };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cashflow-dados.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Dados exportados', description: 'Arquivo JSON baixado com sucesso.' });
  };

  const handleSendCode = async () => {
    const phone = formData.whatsapp;
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast({ title: 'Erro', description: 'Insira um número de WhatsApp válido antes de verificar.', variant: 'destructive' });
      return;
    }

    // Save the phone first if changed
    if (isDirty) {
      await updateProfile.mutateAsync(formData);
      setForm(null);
    }

    setVerifyStep('sending');
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: { action: 'send-code', phone: formData.whatsapp },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setVerifyStep('code');
      setOtpCode('');
      toast({ title: 'Código enviado!', description: 'Verifique seu WhatsApp.' });
    } catch (err: any) {
      setVerifyStep('idle');
      toast({ title: 'Erro ao enviar código', description: err.message, variant: 'destructive' });
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) return;
    setVerifyStep('verifying');
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: { action: 'verify-code', phone: formData.whatsapp, code: otpCode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setVerifyStep('idle');
      setOtpCode('');
      toast({ title: 'Número verificado!', description: 'Seu WhatsApp foi vinculado com sucesso.' });
      // Refresh profile
      await updateProfile.mutateAsync({});
    } catch (err: any) {
      setVerifyStep('code');
      toast({ title: 'Código inválido', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const displayName = formData.nome || user?.email?.split('@')[0] || '';
  const isWhatsappVerified = profile?.whatsapp_verified === true;

  return (
    <div className="max-w-[600px] mx-auto space-y-6 md:space-y-8">
      <h1 className="text-lg md:text-xl-apple font-display font-bold text-foreground">Perfil</h1>

      <div className="glass-card p-4 md:p-6 animate-fade-in">
        <div className="flex items-center gap-4 md:gap-5 mb-5 md:mb-6">
          <div className="relative group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center text-xl md:text-2xl font-display font-semibold text-muted-foreground">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-base md:text-lg-apple font-display font-semibold text-foreground truncate">{displayName}</h2>
            <p className="text-xs md:text-sm-apple text-muted-foreground truncate">{formData.loja || user?.email}</p>
            {subscription.subscribed && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] md:text-xs font-medium text-cf-gold">Cash Flow ✦</span>
            )}
          </div>
        </div>
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Nome completo</label>
            <input value={formData.nome} onChange={e => setForm({ ...formData, nome: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Nome da loja</label>
            <input value={formData.loja} onChange={e => setForm({ ...formData, loja: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
      </div>

      {/* WhatsApp Verification Card */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground">WhatsApp</h3>
          {isWhatsappVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-emerald-400">
              <ShieldCheck size={14} /> Verificado
            </span>
          )}
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Número</label>
            <input
              value={formData.whatsapp}
              onChange={e => {
                setForm({ ...formData, whatsapp: e.target.value });
                // If number changes and was verified, reset
              }}
              placeholder="+5534999999999"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Verification flow */}
          {verifyStep === 'code' || verifyStep === 'verifying' ? (
            <div className="space-y-3 p-3 md:p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs md:text-sm-apple text-muted-foreground">
                Digite o código de 6 dígitos enviado para seu WhatsApp:
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setVerifyStep('idle'); setOtpCode(''); }}
                  className="flex-1 py-2 rounded-xl text-xs md:text-sm-apple font-medium bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={otpCode.length !== 6 || verifyStep === 'verifying'}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm-apple font-medium transition-all ${otpCode.length === 6 ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                  {verifyStep === 'verifying' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Confirmar
                </button>
              </div>
              <button
                onClick={handleSendCode}
                className="w-full text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reenviar código
              </button>
            </div>
          ) : (
            !isWhatsappVerified && (
              <button
                onClick={handleSendCode}
                disabled={verifyStep === 'sending' || !formData.whatsapp}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm-apple font-medium transition-all ${formData.whatsapp ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              >
                {verifyStep === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                {verifyStep === 'sending' ? 'Enviando...' : 'Verificar número'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Contacts */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '120ms' }}>
        <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-3 md:mb-4">Contatos</h3>
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl text-xs md:text-sm-apple text-muted-foreground" />
          </div>
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Instagram</label>
            <input value={formData.instagram} onChange={e => setForm({ ...formData, instagram: e.target.value })} placeholder="@handle" className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '160ms' }}>
        <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-3 md:mb-4">Segurança</h3>
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Nova senha</label>
            <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="label-uppercase block mb-1.5 md:mb-2">Confirmar nova senha</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs md:text-sm-apple text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
            <p className="text-xs text-cf-red">As senhas não coincidem</p>
          )}
          <button onClick={handlePasswordChange} disabled={!passwordsValid} className={`w-full py-2.5 rounded-xl text-xs md:text-sm-apple font-medium transition-all ${passwordsValid ? 'bg-primary text-white hover:opacity-90 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
            Alterar senha
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={!isDirty || saving} className={`w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl text-xs md:text-sm-apple font-medium transition-all ${isDirty ? 'bg-primary text-white hover:opacity-90 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={1.5} />}
        Salvar alterações
      </button>

      <div className="glass-card p-4 md:p-6 border border-cf-red/20 animate-fade-in" style={{ animationDelay: '240ms' }}>
        <h3 className="text-sm md:text-base-apple font-display font-semibold text-cf-red mb-3 md:mb-4">Zona de perigo</h3>
        <div className="space-y-3">
          <button onClick={handleExport} className="flex items-center gap-2 text-xs md:text-sm-apple text-muted-foreground hover:text-foreground transition-colors">
            <Download size={16} strokeWidth={1.5} />
            Exportar meus dados (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
