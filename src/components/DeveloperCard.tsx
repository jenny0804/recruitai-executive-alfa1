import React from 'react';
import { 
  User as UserIcon, 
  Linkedin, 
  Twitter, 
  Mail, 
  BadgeCheck 
} from 'lucide-react';

// Importación de imágenes de perfil
// Nota: Las imágenes se procesan aquí internamente
const TEAM_IMAGES: Record<string, string> = {
  'Rosember A.': '/rosember.png',
  'Jennifer C.': '/jennifer.png',
  'Carlos C.': '/carlos.png',
};

interface DeveloperCardProps {
  name: string;
  role: string;
  bio: string;
  image?: string;
  accent?: 'indigo' | 'violet' | 'teal';
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  name,
  role,
  bio,
  image,
  accent = 'indigo',
}) => {
  // Lógica para consumir la imagen adecuadamente según el miembro
  const finalImage = TEAM_IMAGES[name] || image;

  const accentStyles = {
    indigo: {
      ring: 'ring-indigo-100',
      badge: 'bg-indigo-600 text-white ring-indigo-100',
      role: 'text-indigo-600',
      glow: 'bg-indigo-400/20',
    },
    violet: {
      ring: 'ring-violet-100',
      badge: 'bg-violet-600 text-white ring-violet-100',
      role: 'text-violet-600',
      glow: 'bg-violet-400/20',
    },
    teal: {
      ring: 'ring-teal-100',
      badge: 'bg-teal-600 text-white ring-teal-100',
      role: 'text-teal-600',
      glow: 'bg-teal-400/20',
    },
  }[accent];

  const socialLinks = [
    {
      Icon: Linkedin,
      label: 'LinkedIn',
      className:
        'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:shadow-[#0A66C2]/30',
    },
    {
      Icon: Twitter,
      label: 'Twitter',
      className:
        'bg-sky-500/10 text-sky-600 hover:bg-sky-500 hover:text-white hover:shadow-sky-500/30',
    },
    {
      Icon: Mail,
      label: 'Correo',
      className:
        'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white hover:shadow-rose-500/30',
    },
  ] as const;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/[0.04] transition-all duration-500 hover:-translate-y-1.5 hover:border-indigo-200/80 hover:shadow-[0_28px_60px_rgba(79,70,229,0.15)]">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600"
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60 ${accentStyles.glow}`}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col items-center px-7 pb-7 pt-12 text-center sm:px-8 sm:pb-8 sm:pt-14">
        <div className="relative mb-7">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-indigo-50/80 p-1 shadow-[0_8px_24px_rgba(79,70,229,0.12)] ring-4 ${accentStyles.ring} transition-transform duration-500 group-hover:scale-[1.03] sm:h-32 sm:w-32`}
          >
            {finalImage ? (
              <img
                src={finalImage}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-indigo-400">
                <UserIcon size={44} strokeWidth={1.25} />
              </div>
            )}
          </div>
          <span
            className={`absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-4 ring-white ${accentStyles.badge}`}
            title="Miembro del equipo"
          >
            <BadgeCheck size={18} strokeWidth={2.5} />
          </span>
        </div>

        <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-[1.35rem]">
          {name}
        </h3>
        <p className={`mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] ${accentStyles.role}`}>
          {role}
        </p>
        <p className="mt-4 max-w-[16rem] text-sm font-medium leading-relaxed text-slate-500">
          {bio}
        </p>

        <div className="mt-auto w-full border-t border-slate-100 pt-6">
          <p className="mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Conectar
          </p>
          <div className="flex justify-center gap-3">
            {socialLinks.map(({ Icon, label, className }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default DeveloperCard;
