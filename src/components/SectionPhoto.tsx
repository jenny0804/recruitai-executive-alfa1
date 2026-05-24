import React from 'react';

interface SectionPhotoProps {
  src: string;
  alt: string;
  className?: string;
}

const SectionPhoto: React.FC<SectionPhotoProps> = ({ src, alt, className = '' }) => {
  return (
    <figure className={className}>
      <div className="group overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>
    </figure>
  );
};

export default SectionPhoto;
