import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqs = [
  {
    q: 'Preciso instalar algum aplicativo?',
    a: 'Não. O Cash Flow é 100% web. Acesse pelo celular ou computador, sem instalar nada.',
  },
  {
    q: 'Como funciona o registro por áudio?',
    a: 'Você envia um áudio explicando a venda. Nossa IA transcreve, interpreta os dados (modelo, valor, se foi troca) e registra tudo automaticamente no seu dashboard.',
  },
  {
    q: 'E se eu receber um iPhone em troca?',
    a: 'O aparelho entra automaticamente no seu estoque com status "Em Revisão". Você recebe um aviso e define o preço manualmente antes de colocar à venda.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Sem multa, sem aviso prévio. Basta acessar a área de plano e cancelar. Você mantém acesso até o fim do período pago.',
  },
  {
    q: 'O sistema funciona para mais de um vendedor na mesma loja?',
    a: 'No plano atual, o sistema é configurado por revendedor. Para uso em equipe, entre em contato — estamos desenvolvendo suporte multi-usuário.',
  },
  {
    q: 'Qual é o método de pagamento?',
    a: 'Cartão de Crédito — processado com segurança via Stripe.',
  },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="faq" ref={ref} className="py-20 md:py-28 px-5 scroll-mt-20">
      <div className="max-w-[680px] mx-auto">
        <h2 className="font-display font-bold text-2xl-apple md:text-3xl-apple text-foreground text-center mb-14">
          Perguntas frequentes
        </h2>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.05 }}
              className="border-b border-white/[0.06]"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="text-base-apple font-medium text-foreground pr-4">{faq.q}</span>
                {open === i ? (
                  <X size={18} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                ) : (
                  <Plus size={18} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm-apple text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
