import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Sparkles,
  FileText,
  Trash2,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Message } from '../types';
import { generateResponse } from '../services/gemini';
import { UserProfileModal } from './UserProfileModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CandidateDashboardProps {
  session: any;
  profile: any;
  setProfile: (profile: any) => void;
  handleLogout: () => void;
}

export function CandidateDashboard({ session, profile, setProfile, handleLogout }: CandidateDashboardProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [jobOffer, setJobOffer] = useLocalStorage(`job_offer_${profile?.id}`, '');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useLocalStorage<Message[]>(`chat_candidate_${profile?.id}`, [
    {
      id: '1',
      role: 'model',
      text: `¡Hola ${profile?.full_name || 'Candidato'}! Soy tu asistente de entrenamiento. Pega a la izquierda la plaza a la que deseas aplicar y te ayudaré a prepararte con preguntas técnicas, teóricas y casos de estudio reales.`,
      timestamp: new Date(),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const systemPrompt = `Actúa como un reclutador experto y entrevistador técnico. Tu objetivo es ayudar al candidato a prepararse para la siguiente vacante.
      
      DATOS DEL CANDIDATO (USUARIO ACTUAL):
      - Nombre: ${profile?.full_name || 'No especificado'}
      - Años de Experiencia: ${profile?.experience_years || '0'}
      - Habilidades Declaradas: ${profile?.skills?.join(', ') || 'Ninguna especificada'}

      CONTENIDO DE LA VACANTE:
      ${jobOffer}
      
      Instrucciones:
      1. Genera preguntas realistas basadas en los requisitos de la vacante y el perfil del candidato.
      2. Evalúa las respuestas del candidato y brinda feedback constructivo.
      3. Plantea casos técnicos o teóricos según sea necesario.
      4. Mantén un tono profesional pero alentador.`;

      const aiResponseText = await generateResponse(
        input, 
        history, 
        undefined,
        systemPrompt
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Error al procesar la respuesta. Intenta de nuevo.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openManual = () => {
    window.open('/Documentacion/Manual_de_uso_RecruitAI_Executive_vAlfa1_0.pdf', '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">RecruitAI <span className="font-normal text-slate-500">Candidate</span></h1>
          <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded tracking-wider">Modo Entrenamiento</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-semibold"
          >
            <LogOut size={16} />
            Salir
          </button>
          <button 
            onClick={openManual}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold"
          >
            <HelpCircle size={16} />
            Guía
          </button>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 group cursor-pointer mr-4"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {profile?.full_name || 'Usuario'}
              </span>
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 text-[8px] font-bold uppercase rounded tracking-wider">
                Candidato
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-indigo-200 transition-all shadow-sm">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.avatar_seed || profile?.id}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>
        </div>
      </header>

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        profile={profile} 
        onUpdate={(newProfile) => setProfile(newProfile)} 
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-white border-r border-slate-200 flex flex-col p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Vacante / Oferta Laboral</h2>
            </div>
            <p className="text-sm text-slate-500">Pega aquí la descripción del puesto para el que deseas practicar.</p>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all resize-none leading-relaxed"
              placeholder="Ejemplo: Requerimos un desarrollador frontend con 3 años de experiencia en React, Tailwind CSS y consumo de APIs térmicas..."
              value={jobOffer}
              onChange={(e) => setJobOffer(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3">Simulador de Entrevista</h2>
            <button 
              onClick={() => setMessages(prev => [prev[0]])}
              className="flex items-center gap-1.5 px-3 py-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-[10px] font-bold uppercase"
            >
              <Trash2 size={12} />
              Limpiar chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      message.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600'
                    }`}>
                      {message.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-white" />}
                    </div>
                    <div>
                      <div className={message.role === 'user' ? 'chat-bubble-user-indigo' : 'chat-bubble-ai-white'}>
                        <div className="text-sm leading-relaxed markdown-body">
                          <Markdown>{message.text}</Markdown>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="chat-bubble-ai-white flex items-center gap-1 py-4">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={jobOffer ? "Escribe tu respuesta o pide preguntas..." : "Primero pega la vacante a la izquierda..."}
                disabled={!jobOffer.trim()}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/5 transition-all resize-none min-h-[56px] max-h-[150px] disabled:opacity-50"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !jobOffer.trim()}
                className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all ${
                  input.trim() && !isLoading && jobOffer.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => setInput("Genera 3 preguntas técnicas complejas sobre esta vacante.")}
                  disabled={!jobOffer.trim()}
                  className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-600 uppercase tracking-tight hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-40"
                >
                  Dime preguntas
                </button>
                <button 
                  onClick={() => setInput("Ayúdame a practicar mi presentación personal (Elevator Pitch) para este puesto.")}
                  disabled={!jobOffer.trim()}
                  className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-600 uppercase tracking-tight hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-40"
                >
                  Practicar Pitch
                </button>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Interview Prep AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}