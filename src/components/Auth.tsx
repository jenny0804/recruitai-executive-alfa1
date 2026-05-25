import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  Lock as LockIcon,
  User as UserIcon, 
  Building,
  Briefcase, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  Users,
  ArrowUp,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Phone,
  Quote,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from './Hero';
import DeveloperCard from './DeveloperCard';
import ProductCard from './ProductCard';

type AuthMode = 'login' | 'register';
type UserRole = 'reclutador' | 'candidato';

const NAV_LINKS = [
  { id: 'quienes-somos', label: 'Nuestro equipo' },
  { id: 'productos', label: '¿Qué necesitas hacer hoy?' },
  { id: 'conclusion', label: 'Conclusión' },
  { id: 'recomendaciones', label: 'Recomendaciones' },
] as const;

const PAGE_MAX = 'max-w-[1280px] mx-auto px-4 sm:px-6';

export const Auth: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    role: UserRole;
    title: string;
    description: string;
    features: string[];
    icon: React.ComponentType<{ size?: number; className?: string }>;
  } | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidato');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validatePassword = (pass: string) => {
    return {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
  };

  const passwordRules = validatePassword(password);
  const isPasswordValid = Object.values(passwordRules).every(rule => rule);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'register') {
        const { data: signUpData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              full_name: fullName,
              company_name: companyName,
            }
          }
        });

        if (authError) throw authError;

        if (signUpData.user && !signUpData.session) {
          setMessage('Registro exitoso. Por favor, confirma tu correo electrónico para poder ingresar.');
        } else {
          setMessage('Registro exitoso. Redirigiendo...');
          setTimeout(() => {
            setMode('login');
            setMessage(null);
          }, 2000);
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales incorrectas.');
          }
          throw loginError;
        }
        setIsAuthModalOpen(false);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (selectedMode: AuthMode, selectedRole?: UserRole) => {
    setMode(selectedMode);
    if (selectedRole) setRole(selectedRole);
    setError(null);
    setMessage(null);
    setIsAuthModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans">
      {/* Header sticky — barra superior + navegación */}
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <header>
          <div className={`${PAGE_MAX} flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4`}>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex min-w-0 shrink items-center gap-2.5 rounded-lg outline-none ring-indigo-500 transition-opacity hover:opacity-90 focus-visible:ring-2 cursor-pointer sm:gap-3"
              aria-label="Ir al inicio"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 shadow-md shadow-slate-200 sm:h-10 sm:w-10">
                <Zap className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" />
              </div>
              <span className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                RecruitAI{' '}
                <span className="font-medium text-slate-500">Executive</span>
              </span>
            </button>

            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Navegación principal"
            >
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-md shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98] sm:px-4 sm:text-sm"
              >
                Crear cuenta
              </button>
            </div>
          </div>

          {/* Navegación móvil/tablet — misma funcionalidad, desplazamiento horizontal */}
          <nav
            className="border-t border-slate-100 lg:hidden"
            aria-label="Navegación principal"
          >
            <div
              className={`${PAGE_MAX} flex gap-2 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
            >
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="shrink-0 cursor-pointer whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </nav>
        </header>
      </div>

      <main>
        <Hero 
          videoSrc="/hero-video.mp4"
          mobileVideoSrc="/hero-video-mobile.mp4"
          posterSrc="/hero_recruitment_humans.png"
          onPrimaryClick={() => openAuthModal('register')}
        />

        {/* Quienes somos */}
        <section
          id="quienes-somos"
          className="relative scroll-mt-36 overflow-hidden border-b border-indigo-200/50 bg-gradient-to-b from-slate-100 via-indigo-50/50 to-indigo-100/30 py-20 lg:scroll-mt-24 lg:py-28"
          aria-labelledby="quienes-somos-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-300/15 blur-3xl"
            aria-hidden
          />

          <div className={`${PAGE_MAX} relative`}>
            <div className="mb-14 text-center sm:mb-16">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-indigo-700 shadow-sm backdrop-blur-sm">
                <Users size={14} className="shrink-0" aria-hidden />
                Nuestro Equipo
              </p>
              <h2
                id="quienes-somos-heading"
                className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
              >
                Quienes somos
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-600 sm:text-lg">
                Desarrolladores apasionados por la integración de la inteligencia artificial en procesos humanos de alto impacto.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              <DeveloperCard
                name="Carlos C."
                role="Arquitecto de Producto"
                bio="Full Stack Developer enfocado en arquitectura de producto y experiencias impulsadas por IA, especialista en sistemas escalables y flujos end to end. Transformo necesidades complejas en soluciones eficientes, usables y preparadas para crecer"
                accent="indigo"
              />
              <DeveloperCard
                name="Jennifer C."
                role="BackEnd Development & Artificial Intelligence"
                bio="Desarrolladora backend especialista en construir la lógica detrás de cada producto. Combina el desarrollo backend con técnicas de IA para crear sistemas eficientes, inteligentes y escalables."
                accent="violet"
              />
              <DeveloperCard
  name="Rosember A."
  role="Cybersecurity & Artificial Intelligence"
  bio="Apasionado por la ciberseguridad, la inteligencia artificial y el desarrollo de soluciones tecnológicas. Enfocado en crear sistemas inteligentes, automatización y experiencias digitales modernas con enfoque analítico, innovación y seguridad."
  accent="teal"
/>
            </div>
          </div>
        </section>

        {/* Productos — selector de rol (GoDaddy: “¿Qué necesitas?”) */}
        <section
          id="productos"
          className="scroll-mt-36 border-b border-slate-100 bg-gradient-to-b from-white via-indigo-50/20 to-white py-16 lg:scroll-mt-24 lg:py-20"
        >
          <div className={PAGE_MAX}>
            <div className="mb-12 text-center">
              <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                ¿Qué necesitas hacer hoy?
              </h2>
              <p className="mx-auto max-w-xl text-sm font-medium text-slate-600">
                Dos experiencias, un mismo ecosistema ético respaldado por el mismo motor de IA.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:gap-10">
              <ProductCard
                role="Reclutador"
                icon={Briefcase}
                title="Analizar currículums"
                onShowDetails={() => setSelectedProduct({
                  role: 'reclutador',
                  icon: Briefcase,
                  title: "Analizar currículums",
                  description: "Carga múltiples CV en PDF, define el perfil maestro del puesto y obtén un scorecard comparativo con match semántico automatizado mediante IA de última generación.",
                  features: ['Análisis PDF', 'Scorecard JSON', 'Match Semántico', 'Filtro IA']
                })}
                features={['Análisis PDF', 'Scorecard JSON', 'Match Semántico', 'Filtro IA']}
              />
              <ProductCard
                role="Candidato"
                icon={UserIcon}
                title="Practicar entrevistas"
                onShowDetails={() => setSelectedProduct({
                  role: 'candidato',
                  icon: UserIcon,
                  title: "Practicar entrevistas",
                  description: "Pega la descripción de la vacante y practica con un entrevistador virtual que adapta preguntas técnicas y teóricas a tu perfil profesional y experiencia declarada.",
                  features: ['Entrenador Virtual', 'Feedback IA', 'Casos Reales', 'Soft Skills']
                })}
                features={['Entrenador Virtual', 'Feedback IA', 'Casos Reales', 'Soft Skills']}
              />
            </div>
          </div>
        </section>

        {/* Conclusión */}
        <section
          id="conclusion"
          className="relative scroll-mt-36 overflow-hidden border-b border-slate-800 py-16 text-white sm:py-20 lg:scroll-mt-24 lg:py-24"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[url('/conclusion-neural-brain.png')] bg-cover bg-center bg-no-repeat"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/85"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.55)_100%)]"
            aria-hidden
          />

          <div className={`relative ${PAGE_MAX} max-w-4xl`}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/35 px-6 py-10 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div
                className="pointer-events-none absolute -right-6 -top-6 text-indigo-400/20"
                aria-hidden
              >
                <Quote size={120} strokeWidth={1} />
              </div>

              <div className="relative space-y-8">
                <figure className="relative">
                  <div
                    className="absolute left-0 top-0 hidden h-full w-1 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500 sm:block"
                    aria-hidden
                  />
                  <blockquote className="text-left text-base font-medium leading-[1.75] text-slate-50 drop-shadow-sm sm:pl-6 sm:text-lg sm:leading-[1.8] lg:text-xl">
                    "La implementación del sistema interactivo asistido por inteligencia artificial propuesto constituye una solución viable y ética para optimizar la preparación de postulantes para entrevistas y mejorar la eficiencia operativa en la preselección de talento humano en organizaciones salvadoreñas. La automatización basada en IA debe complementar, no sustituir, el juicio humano."
                  </blockquote>
                </figure>

                <figcaption className="flex justify-end border-t border-white/15 pt-6">
                  <p className="text-right text-xs font-semibold tracking-wide text-slate-200 sm:text-sm">
                    Investigación RecruitAI Executive vBeta1.0
                  </p>
                </figcaption>
              </div>
            </div>
          </div>
        </section>

        {/* Recomendaciones — Estilo Proceso/Timeline interactivo */}
        <section id="recomendaciones" className="scroll-mt-36 py-24 border-b border-slate-100 bg-white overflow-hidden lg:scroll-mt-24">
          <div className={PAGE_MAX}>
            <div className="text-center mb-24">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">
                Siguientes pasos
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                Recomendaciones para futuras investigaciones
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-6 max-w-2xl mx-auto font-medium">
                Avenidas sugeridas para profundizar en la integración de la inteligencia artificial en el área de talento humano salvadoreño.
              </p>
            </div>

            <div className="relative">
              {/* Línea conectora central (Desktop) */}
              <div 
                className="absolute top-[116px] left-0 w-full h-1 bg-slate-100 hidden md:block" 
                aria-hidden 
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative z-10">
                {[
                  {
                    n: '1',
                    title: 'Calidad de contratación',
                    body: 'Realizar una validación empírica para medir el impacto de la herramienta en el rendimiento y la tasa de retención a largo plazo de los empleados contratados.',
                    icon: BarChart3,
                    color: 'bg-indigo-600',
                    lightColor: 'bg-indigo-50',
                    textColor: 'text-indigo-600',
                    hoverShadow: 'hover:shadow-indigo-100'
                  },
                  {
                    n: '2',
                    title: 'Aceptación tecnológica',
                    body: 'Llevar a cabo un análisis de usabilidad y aceptación tecnológica por parte de los profesionales de Recursos Humanos mediante modelos como TAM.',
                    icon: Users,
                    color: 'bg-violet-600',
                    lightColor: 'bg-violet-50',
                    textColor: 'text-violet-600',
                    hoverShadow: 'hover:shadow-violet-100'
                  },
                  {
                    n: '3',
                    title: 'Gobernanza ética',
                    body: 'Desarrollar y normar frameworks éticos y legales en organizaciones que garanticen la auditoría, transparencia y explicabilidad de los modelos de IA.',
                    icon: ShieldCheck,
                    color: 'bg-teal-600',
                    lightColor: 'bg-teal-50',
                    textColor: 'text-teal-600',
                    hoverShadow: 'hover:shadow-teal-100'
                  },
                ].map((item) => (
                  <motion.div 
                    key={item.n}
                    whileHover={{ y: -12 }}
                    className="flex flex-col items-center text-center group"
                  >
                    {/* Icono superior — Estilo ilustrativo */}
                    <div className={`mb-10 p-8 rounded-[2.5rem] ${item.lightColor} ${item.textColor} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm relative`}>
                      <item.icon size={48} strokeWidth={1.5} />
                      <div className={`absolute -right-2 -bottom-2 w-8 h-8 rounded-full ${item.color} opacity-20 animate-pulse`} />
                    </div>

                    {/* Círculo numerado con línea de flujo */}
                    <div className="relative mb-10 flex items-center justify-center">
                      <div className={`w-14 h-14 rounded-full ${item.color} text-white flex items-center justify-center font-black text-xl shadow-xl ring-[12px] ring-white z-20 transition-transform duration-500 group-hover:scale-110`}>
                        {item.n}
                      </div>
                    </div>

                    {/* Texto informativo — Estilo Card Limpia */}
                    <div className={`p-8 rounded-[2rem] bg-white border border-slate-100 transition-all duration-500 group-hover:border-transparent group-hover:shadow-2xl ${item.hoverShadow} flex-1 flex flex-col`}>
                      <h3 className="text-xl font-bold text-slate-950 mb-4 tracking-tight">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium flex-1">{item.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 pt-16 pb-12 relative overflow-hidden">
        <div className={PAGE_MAX}>
          {/* Main Footer Area (White Card) */}
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
              
              {/* Brand Column */}
              <div className="space-y-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-black text-slate-950 tracking-tight">
                    RecruitAI <span className="font-normal text-slate-500">Executive</span>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tecnologías</h4>
                <ul className="space-y-4">
                  {['Gemini 2.5 Flash', 'Supabase Auth', 'React 19 & Vite 6', 'Tailwind CSS v4'].map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Contacto</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Phone size={14} />
                    </div>
                    +503 2200-0000
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Mail size={14} />
                    </div>
                    soporte@recruitai.com
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 px-8 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <p>© {new Date().getFullYear()} RecruitAI Executive. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* 8. AUTHENTICATION MODAL (Overlay Popover/Drawer) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-default"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                    <selectedProduct.icon size={32} />
                  </div>
                  <div>
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-widest">
                      {selectedProduct.role}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedProduct.title}</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm leading-relaxed text-slate-600 font-medium italic border-l-4 border-indigo-500 pl-4">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Capacidades incluidas</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                          <Zap size={12} className="text-[#FFB800]" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const role = selectedProduct.role;
                      setSelectedProduct(null);
                      openAuthModal('login', role);
                    }}
                    className="w-full py-4 bg-[#FFB800] text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#F0A900] transition-all shadow-lg shadow-yellow-100 active:scale-[0.98] cursor-pointer mt-4"
                  >
                    Ingresar al Panel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            {/* Modal Backdrop Click handler */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsAuthModalOpen(false)}
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {mode === 'login' ? 'Iniciar Sesión' : 'Crea tu Cuenta'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    {mode === 'login' ? 'Accede a tu panel de RecruitAI' : 'Regístrate para comenzar a usar la IA'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-red-600 text-xs animate-shake">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-600 text-xs">
                      <AlertCircle size={15} className="text-emerald-500" />
                      <span>{message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs text-slate-700"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider ml-1">Contraseña</label>
                    <div className="relative">
                      <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs text-slate-700"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    {mode === 'register' && (
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <PasswordRule label="8+ caracteres" met={passwordRules.length} />
                        <PasswordRule label="Mayúscula" met={passwordRules.upper} />
                        <PasswordRule label="Minúscula" met={passwordRules.lower} />
                        <PasswordRule label="Número" met={passwordRules.number} />
                        <PasswordRule label="Especial" met={passwordRules.special} />
                      </div>
                    )}
                  </div>

                  {mode === 'register' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2 border-t border-slate-100"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider ml-1">Tipo de Usuario</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                          >
                            <option value="candidato">Candidato</option>
                            <option value="reclutador">Reclutador</option>
                          </select>
                        </div>
                      </div>

                      {role === 'candidato' ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider ml-1">Nombre Completo</label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-xs text-slate-700"
                              placeholder="Juan Pérez"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider ml-1">Empresa</label>
                          <div className="relative">
                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-xs text-slate-700"
                              placeholder="Tech Solutions S.A."
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading || (mode === 'register' && !isPasswordValid)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loading ? 'Procesando...' : 
                     mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    <ArrowRight size={14} />
                  </button>
                </form>

                <div className="mt-6 text-center border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-indigo-600 font-bold text-xs hover:underline cursor-pointer"
                  >
                    {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Botón Volver Arriba */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90 cursor-pointer border border-white/10"
            title="Volver arriba"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const PasswordRule = ({ label, met }: { label: string; met: boolean }) => (
  <div className={`flex items-center gap-1.5 text-[9px] ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
    <div className={`w-1 h-1 rounded-full ${met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
    <span>{label}</span>
  </div>
);