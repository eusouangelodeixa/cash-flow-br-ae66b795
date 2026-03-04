import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Loader2 } from 'lucide-react';
import logoImg from '@/assets/logo-cashflow.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Preço', href: '#preco' },
  { label: 'FAQ', href: '#faq' },
];

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setMobileOpen(false);
    if (!user) { navigate('/auth'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao iniciar checkout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img src={logoImg} alt="Cash Flow" className="w-5 h-5 brightness-0 invert" />
            <span className="font-display font-semibold text-lg-apple text-foreground">Cash Flow</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <button
                key={l.href}
                onClick={() => handleClick(l.href)}
                className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/auth')} className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-pill px-4 py-2">
              Entrar
            </button>
            <button onClick={handleCheckout} disabled={loading} className="text-sm-apple font-semibold bg-foreground text-background rounded-[20px] px-5 py-2 hover:scale-[1.02] active:scale-[0.97] transition-transform disabled:opacity-60 inline-flex items-center gap-1.5">
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Processando...' : 'Começar agora'}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-foreground">
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[61] w-72 bg-[#111] border-l border-border/50 p-6 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="self-end p-2 text-muted-foreground">
                <X size={20} strokeWidth={1.5} />
              </button>
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map(l => (
                  <button
                    key={l.href}
                    onClick={() => handleClick(l.href)}
                    className="text-lg-apple text-foreground text-left"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-3">
                <button onClick={() => { setMobileOpen(false); navigate('/auth'); }} className="text-center text-sm-apple text-muted-foreground border border-border/50 rounded-pill py-3">
                  Entrar
                </button>
                <button onClick={handleCheckout} disabled={loading} className="text-center text-sm-apple font-semibold bg-foreground text-background rounded-[20px] py-3 disabled:opacity-60 inline-flex items-center justify-center gap-1.5">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loading ? 'Processando...' : 'Começar agora'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
