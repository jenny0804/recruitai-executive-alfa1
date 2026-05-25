import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Send, 
  User, 
  Bot, 
  Sparkles,
  FileText,
  Trash2,
  HelpCircle,
  LogOut,
  Download
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
      const history = [...messages, userMessage].map(m => ({
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

  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');
  };

  const exportChatHistory = () => {
    if (messages.length <= 1) {
      alert("No hay historial de conversación para exportar");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); 
      doc.text('Preparación de Entrevista - RecruitAI', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Candidato: ${profile?.full_name || 'Usuario'}`, 14, 30);
      doc.text(`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, 35);

      const chatData = messages.map(msg => [
        msg.role === 'user' ? 'CANDIDATO' : 'ENTREVISTADOR AI',
        cleanMarkdown(msg.text),
        new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Remitente', 'Mensaje', 'Hora']],
        body: chatData,
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 20, halign: 'center' }
        },
        margin: { top: 40 }
      });

      doc.save(`entrenamiento_entrevista_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting chat:", error);
      alert("Hubo un error al generar el PDF del chat.");
    }
  };

  const openManual = () => {
    window.open('/Documentacion/Manual_de_uso_RecruitAI_Executive_vBeta1_0.pdf', '_blank');
  };

  return (
    <div className="flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-[#F8F9FA]">
      <header className="z-10 min-h-16 flex-shrink-0 border-b border-slate-200 bg-white px-3 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">RecruitAI <span className="font-normal text-slate-500">Candidate</span></h1>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="group ml-2 flex min-w-0 cursor-pointer items-center gap-2"
          >
            <div className="flex min-w-0 flex-col items-end">
              <span className="max-w-[110px] truncate text-[11px] font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                {profile?.full_name || 'Usuario'}
              </span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-indigo-500">
                Candidato
              </span>
            </div>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition-all group-hover:border-indigo-200">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.avatar_seed || profile?.id}`}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between sm:hidden">
          <span className="inline-flex rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Modo Entrenamiento
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={14} />
              Salir
            </button>
            <button
              onClick={openManual}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              <HelpCircle size={14} />
              Guía
            </button>
          </div>
        </div>

        <div className="hidden min-w-0 items-center justify-between gap-3 sm:flex">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">RecruitAI <span className="font-normal text-slate-500">Candidate</span></h1>
            <div className="mx-2 h-4 w-[1px] bg-slate-200"></div>
            <span className="inline-flex rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">Modo Entrenamiento</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
            <button
              onClick={openManual}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              <HelpCircle size={16} />
              <span>Guía</span>
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="group flex cursor-pointer items-center gap-2"
            >
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                  {profile?.full_name || 'Usuario'}
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-indigo-500">
                  Candidato
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition-all group-hover:border-indigo-200">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.avatar_seed || profile?.id}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        profile={profile} 
        onUpdate={(newProfile) => setProfile(newProfile)} 
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-[260px] min-w-0 flex-col border-b border-slate-200 bg-white p-4 sm:p-6 lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r lg:p-8">
          <div className="mb-4 sm:mb-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                <FileText size={18} />
              </div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Vacante / Oferta Laboral</h2>
            </div>
            <p className="text-sm text-slate-500">Pega aquí la descripción del puesto para el que deseas practicar.</p>
          </div>
          
          <div className="relative min-h-0 flex-1">
            <textarea
              className="h-full w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 sm:p-5 lg:p-6"
              placeholder="Ejemplo: Requerimos un desarrollador frontend con 3 años de experiencia en React, Tailwind CSS y consumo de APIs térmicas..."
              value={jobOffer}
              onChange={(e) => setJobOffer(e.target.value)}
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white p-3 sm:px-4">
            <h2 className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:px-3 sm:text-xs">Simulador de Entrevista</h2>
            <div className="flex gap-1 sm:gap-2">
              <button 
                onClick={exportChatHistory}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 sm:px-3"
              >
                <Download size={12} />
                Exportar
              </button>
              <button 
                onClick={() => setMessages([messages[0]])}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 sm:px-3"
              >
                <Trash2 size={12} />
                Limpiar
              </button>
            </div>
          </div>

          <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-5 lg:space-y-6 lg:p-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[95%] gap-2 sm:max-w-[90%] sm:gap-3 lg:max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      message.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600'
                    }`}>
                      {message.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-white" />}
                    </div>
                    <div className="min-w-0">
                      <div className={message.role === 'user' ? 'chat-bubble-user-indigo' : 'chat-bubble-ai-white'}>
                        <div className="text-sm leading-relaxed markdown-body">
                          <Markdown>{message.text}</Markdown>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block px-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

          <div className="border-t border-slate-100 bg-white p-4 sm:p-5 lg:p-6">
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
                className="min-h-[56px] max-h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/5 sm:px-5 sm:py-4"
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
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
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
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 sm:text-right">
                Interview Prep AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
