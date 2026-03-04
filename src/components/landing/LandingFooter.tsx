import logoImg from '@/assets/logo-cashflow.png';

const LandingFooter = () => {
  const handleScroll = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.06] pt-12 pb-8 px-5">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logoImg} alt="Cash Flow" className="w-4 h-4 brightness-0 invert" />
            <span className="font-display font-semibold text-base-apple text-foreground">Cash Flow</span>
          </div>
          <p className="text-sm-apple text-muted-foreground leading-relaxed mb-4">
            Gestão premium para revendedores de iPhone.
          </p>
          <p className="text-xs-apple text-[#48484A]">© 2025 Cash Flow. Todos os direitos reservados.</p>
        </div>

        {/* Produto */}
        <div>
          <h4 className="label-uppercase mb-4">Produto</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Funcionalidades', href: '#funcionalidades' },
              { label: 'Preço', href: '#preco' },
              { label: 'FAQ', href: '#faq' },
              { label: 'Entrar no sistema', href: '/auth' },
            ].map(l => (
              <li key={l.label}>
                <button onClick={() => l.href.startsWith('#') ? handleScroll(l.href) : (window.location.href = l.href)} className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Suporte */}
        <div>
          <h4 className="label-uppercase mb-4">Suporte</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors">Contato</a></li>
            <li><a href="#" className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors">Email</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="label-uppercase mb-4">Legal</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors">Termos de uso</a></li>
            <li><a href="#" className="text-sm-apple text-muted-foreground hover:text-foreground transition-colors">Política de privacidade</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
