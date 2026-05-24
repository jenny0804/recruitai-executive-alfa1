import React from 'react';

interface EvidenceCardProps {
  title: string;
  metric: string;
  watermark: string;
  description: string;
  tags: string[];
  blobGradient: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onMoreInfo: () => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({
  title,
  metric,
  watermark,
  description,
  tags,
  blobGradient,
  icon: Icon,
  onMoreInfo,
}) => {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] border border-slate-100">
      <div className="flex flex-col md:flex-row md:min-h-[18rem]">
        {/* Contenido Izquierdo */}
        <div className="flex flex-1 flex-col justify-between p-8 sm:p-10 md:max-w-[55%]">
          <div>
            {/* Pseudo-tabs al estilo de la imagen */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              {tags.map((tag, index) => (
                <span
                  key={tag}
                  className={`text-xs font-bold tracking-wide ${
                    index === 0 
                      ? 'rounded-lg bg-slate-950 px-3 py-1.5 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 transition-colors cursor-default'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h3 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl tracking-tight">
              {title}
            </h3>
            <p className="mt-6 text-sm leading-relaxed text-slate-500 font-medium max-w-md">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onMoreInfo}
            className="mt-10 self-start rounded-full bg-slate-950 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 cursor-pointer"
          >
            Más información
          </button>
        </div>

        {/* Visual Derecho — Clonando el estilo de la imagen */}
        <div className="relative min-h-[18rem] flex-1 md:min-h-0 overflow-hidden bg-slate-50/30">
          {/* El Blob orgánico de fondo con animación fluida */}
          <div className="absolute inset-0 flex items-center justify-center translate-x-12">
            <div
              className={`h-[150%] w-[130%] opacity-95 ${blobGradient} animate-blob-slow`}
              style={{ 
                borderRadius: '45% 55% 63% 37% / 41% 51% 49% 59%',
              }}
            />
          </div>

          {/* Marca de agua en la esquina superior derecha */}
          <span
            className="pointer-events-none absolute right-10 top-10 z-10 select-none text-5xl font-black uppercase tracking-tighter text-white/25"
            aria-hidden
          >
            {watermark}
          </span>

          {/* El Símbolo central (Sustituyendo a la fruta) */}
          <div className="relative z-20 flex h-full items-center justify-center p-12">
            <div className="flex items-center justify-center rounded-[2.5rem] bg-white/15 backdrop-blur-xl p-10 shadow-2xl ring-1 ring-white/30 transform hover:scale-110 hover:rotate-3 transition-all duration-700">
              <Icon size={90} className="text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes blob-slow {
              0%, 100% { border-radius: 45% 55% 63% 37% / 41% 51% 49% 59%; transform: rotate(0deg) scale(1); }
              33% { border-radius: 55% 45% 37% 63% / 51% 41% 59% 49%; transform: rotate(2deg) scale(1.05); }
              66% { border-radius: 40% 60% 50% 50% / 60% 40% 40% 60%; transform: rotate(-2deg) scale(0.95); }
            }
            .animate-blob-slow {
              animation: blob-slow 15s ease-in-out infinite;
            }
          `}} />
        </div>
      </div>
    </article>
  );
};

export default EvidenceCard;
