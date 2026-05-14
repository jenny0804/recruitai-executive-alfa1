import React, { useState } from 'react';
import { X, User, Camera, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onUpdate: (newProfile: any) => void;
}

export function UserProfileModal({ isOpen, onClose, profile, onUpdate }: UserProfileModalProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [position, setPosition] = useState(profile?.position || '');
  const [experienceYears, setExperienceYears] = useState(profile?.experience_years?.toString() || '');
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');
  const [avatarSeed, setAvatarSeed] = useState(profile?.avatar_seed || profile?.id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const isRecruiter = profile.role === 'reclutador';
      const table = isRecruiter ? 'recruiters' : 'candidates';
      
      const updateData: any = {
        full_name: fullName,
      };

      if (isRecruiter) {
        updateData.company_name = companyName;
        updateData.position = position;
      } else {
        updateData.experience_years = parseInt(experienceYears) || 0;
        updateData.skills = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
      }

      // Update specific table
      const { data: specificData, error: specificError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (specificError) throw specificError;

      // Update profile avatar seed
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_seed: avatarSeed, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (profileError) throw profileError;
      
      onUpdate({ ...profile, ...specificData, ...profileData });
      setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
    } finally {
      setIsUpdating(false);
    }
  };

  const regenerateAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            Configuración de Cuenta
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleUpdateProfile} className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={regenerateAvatar}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-all"
                  title="Cambiar avatar"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-slate-900">{profile?.full_name || 'Sin nombre'}</p>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    profile?.role === 'reclutador' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {profile?.role === 'reclutador' ? 'Reclutador' : 'Candidato'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Escribe tu nombre"
                  />
                </div>
              </div>

              {profile.role === 'reclutador' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Empresa</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cargo / Posición</label>
                    <input 
                      type="text" 
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                      placeholder="Tu cargo actual"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Años de Experiencia</label>
                    <input 
                      type="number" 
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                      placeholder="Ej: 5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Habilidades (separadas por coma)</label>
                    <textarea 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium min-h-[80px]"
                      placeholder="React, TypeScript, UI Design..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={profile?.email || ''} 
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isUpdating}
                className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? 'Guardando...' : 'Actualizar Perfil'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}