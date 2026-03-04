import { Star } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Carlos M.',
    city: 'São Paulo, SP',
    initials: 'CM',
    text: 'Antes eu usava Excel pra tudo. Hoje fecho uma venda, registro e pronto. O sistema já atualizou. Não tem como voltar atrás.',
  },
  {
    name: 'Ana P.',
    city: 'Belo Horizonte, MG',
    initials: 'AP',
    text: 'O controle de trocas salvou minha vida. Eu nunca sabia o preço certo de um aparelho que recebi. Agora fica em revisão até eu definir. Simples assim.',
  },
  {
    name: 'Rafael T.',
    city: 'Curitiba, PR',
    initials: 'RT',
    text: 'Estou usando há 2 meses e já vi exatamente quanto lucrei. Isso era impossível antes. Recomendo pra qualquer revendedor sério.',
  },
];

const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 md:py-28 px-5">
      <div className="max-w-[1100px] mx-auto">
        <h2 className="font-display font-bold text-2xl-apple md:text-3xl-apple text-foreground text-center mb-14">
          Revendedores que pararam de usar planilha
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm-apple text-muted-foreground font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm-apple font-medium text-foreground">{t.name}</p>
                  <p className="text-xs-apple text-muted-foreground">{t.city}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={12} fill="hsl(var(--cf-gold))" strokeWidth={0} />
                ))}
              </div>
              <p className="text-sm-apple text-muted-foreground leading-relaxed italic">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
