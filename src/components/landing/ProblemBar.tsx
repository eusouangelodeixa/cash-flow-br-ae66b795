import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const ProblemBar = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-10 px-5 bg-[#0F0F0F]">
      <motion.p
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center text-[17px] md:text-[19px] text-muted-foreground max-w-[640px] mx-auto leading-relaxed"
      >
        Você vende iPhones, mas controla tudo em planilha, caderno e chute. Existe algo{' '}
        <em className="text-foreground not-italic font-medium italic">melhor</em>.
      </motion.p>
    </section>
  );
};

export default ProblemBar;
