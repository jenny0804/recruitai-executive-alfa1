import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FaqItemProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({
  id,
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        isOpen
          ? 'border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-[0_8px_30px_rgba(79,70,229,0.08)] ring-1 ring-indigo-100/80'
          : 'border-slate-100 bg-white shadow-sm hover:border-indigo-50 hover:shadow-md'
      }`}
    >
      <button
        type="button"
        id={`faq-${id}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="flex items-center gap-4 text-sm font-semibold text-slate-900 sm:text-base">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <Icon size={18} />
          </span>
          {title}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}
          aria-hidden
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <div className="border-t border-indigo-100/80 px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
              <div className="space-y-3 border-l-2 border-indigo-300/80 pl-4 text-sm leading-relaxed text-slate-600">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaqItem;
