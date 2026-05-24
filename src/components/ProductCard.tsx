import React from 'react';

interface ProductCardProps {
  role: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  features: string[];
  onShowDetails: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  role,
  title,
  icon: Icon,
  features,
  onShowDetails,
}) => {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-100/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-indigo-100 hover:shadow-[0_24px_48px_rgba(79,70,229,0.12)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-violet-500 to-indigo-600" aria-hidden />
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-70"
        aria-hidden
      />

      <div className="relative flex flex-col items-center px-8 pb-8 pt-14 text-center">
        <div className="absolute left-6 top-6 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-100">
          {role}
        </div>

        <div className="relative mb-8 mt-2">
          <div className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-1 shadow-sm ring-1 ring-indigo-100/80 transition-transform duration-500 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-white text-indigo-600">
              <Icon size={36} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h3 className="mb-8 text-xl font-bold tracking-tight text-slate-900">{title}</h3>

        <button
          type="button"
          onClick={onShowDetails}
          className="mb-8 w-full rounded-xl bg-[#FFB800] py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-yellow-100/80 transition-all hover:bg-[#F0A900] hover:shadow-xl active:scale-[0.98] cursor-pointer"
        >
          Ver Detalles
        </button>

        <div className="w-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 text-left ring-1 ring-slate-100">
          <p className="mb-4 text-[9px] font-black uppercase tracking-widest text-indigo-600">
            CAPACIDADES IA
          </p>
          <div className="flex flex-wrap gap-2">
            {features.map((f) => (
              <span
                key={f}
                className="rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-tight text-slate-600 shadow-sm ring-1 ring-slate-200/80"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
