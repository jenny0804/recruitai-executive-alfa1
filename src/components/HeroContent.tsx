import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface HeroContentProps {
  isVisible?: boolean;
  onPrimaryClick?: () => void;
}

const HeroContent: React.FC<HeroContentProps> = ({
  isVisible = false,
  onPrimaryClick,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <div
      className={`relative z-20 h-full w-full ${!isVisible ? 'pointer-events-none' : ''}`}
      aria-hidden={!isVisible}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className="relative mx-auto flex h-full w-full max-w-5xl flex-col max-md:grid max-md:grid-rows-[auto_minmax(42vh,1fr)_auto] max-md:px-5 max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-md:pt-3 md:items-center md:justify-center md:gap-10 md:px-8 md:py-16 md:text-center lg:px-8"
      >
        {/* Superior (móvil): badge + titular legible */}
        <header className="max-md:pointer-events-auto max-md:space-y-4 max-md:bg-gradient-to-b max-md:from-black/55 max-md:via-black/25 max-md:to-transparent max-md:pb-4 max-md:pt-1 md:space-y-6">
          <motion.div variants={itemVariants}>
            <span className="inline-block rounded-full border border-white/35 bg-black/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md md:px-4 md:py-1.5 md:text-xs md:tracking-[0.2em]">
              Transformación Digital Empresarial
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-4xl text-[1.3rem] font-bold leading-[1.38] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] sm:text-[1.45rem] md:text-5xl md:font-black md:leading-[1.15] md:drop-shadow-none lg:text-6xl"
          >
            La automatización basada en IA debe complementar, no sustituir, el juicio humano.
          </motion.h1>
        </header>

        {/* Centro libre: sujeto principal del video */}
        <div className="max-md:block md:hidden" aria-hidden />

        {/* Inferior (móvil): CTAs — usa el ancho sin tapar el centro */}
        <motion.div
          variants={itemVariants}
          className="max-md:pointer-events-auto max-md:bg-gradient-to-t max-md:from-black/65 max-md:via-black/35 max-md:to-transparent max-md:pt-5 md:mt-2"
        >
          <div className="flex w-full justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPrimaryClick}
              aria-label="Comenzar"
              className="w-full max-w-xs cursor-pointer rounded-xl bg-[#FFB800] px-3 py-3.5 text-xs font-black uppercase leading-tight tracking-wide text-slate-900 shadow-lg shadow-black/20 transition-all hover:bg-[#F0A900] md:rounded-lg md:px-8 md:py-4 md:text-sm md:tracking-widest md:shadow-xl md:shadow-yellow-500/20"
            >
              Comenzar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: isVisible ? 0.9 : 0, duration: 0.7 }}
        className="absolute left-1/2 z-30 -translate-x-1/2 max-md:bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-white/80"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.28em] md:text-[10px] md:tracking-[0.3em]">
            Continúa
          </span>
          <ChevronDown size={18} className="md:h-5 md:w-5" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroContent;
