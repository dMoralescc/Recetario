import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Search, PlusCircle, Bookmark, Share2, Timer, Flame, ChevronRight, Play, X, Check, Heart, Send, Sparkles, Youtube, Instagram, Music2, ArrowLeft, Camera, Image as ImageIcon, Trash2, Pause, RotateCcw, Edit3 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// Global styles for mobile feel
const GlobalStyles = () => (
  <style>{`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }
  `}</style>
);

// Types
type Difficulty = 'Fácil' | 'Media' | 'Difícil';

interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: Difficulty;
  image: string;
  category: string;
  author?: {
    name: string;
    avatar: string;
  };
  likes?: number;
  liked?: boolean;
  saved?: boolean;
  ingredients: string[];
  steps: {
    text: string;
    duration?: number; // in seconds
  }[];
}

// Mock Data
const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Pasta al Pomodoro Premium',
    time: '25 min',
    difficulty: 'Fácil',
    category: 'Rápidas',
    image: 'https://images.unsplash.com/photo-1763841018058-1e4383f9bcc3',
    ingredients: ['200g Pasta', '4 Tomates frescos', 'Albahaca', 'Aceite de oliva extra virgen', 'Queso Parmesano'],
    steps: [
      { text: 'Hervir agua con abundante sal.', duration: 600 },
      { text: 'Picar los tomates y saltearlos con aceite y albahaca.', duration: 300 },
      { text: 'Mezclar la pasta con la salsa y servir con queso.' }
    ]
  },
  {
    id: '2',
    title: 'Ensalada Mediterránea',
    time: '15 min',
    difficulty: 'Fácil',
    category: 'Saludables',
    image: 'https://images.unsplash.com/photo-1764397514746-e58523d0eaff',
    ingredients: ['Pepino', 'Tomate cherry', 'Aceitunas negras', 'Queso feta', 'Vinagreta de limón'],
    steps: [
      { text: 'Cortar todos los vegetales en cubos pequeños.' },
      { text: 'Mezclar en un bowl con la vinagreta.' }
    ]
  }
];

const EXPLORE_RECIPES_INITIAL: Recipe[] = [
  {
    id: '3',
    title: 'Healthy Breakfast Bowl',
    time: '10 min',
    difficulty: 'Fácil',
    category: 'Saludables',
    image: 'https://images.unsplash.com/photo-1767105267943-0d34ab68d2a1',
    author: { name: 'Elena Cocina', avatar: 'https://images.unsplash.com/photo-1678626667639-de9c676e8222' },
    likes: 1240,
    liked: false,
    saved: false,
    ingredients: ['Yogur griego', 'Arándanos', 'Granola casera', 'Miel'],
    steps: [{ text: 'Montar las capas en un bowl transparente.' }]
  },
  {
    id: '4',
    title: 'Volcán de Chocolate',
    time: '45 min',
    difficulty: 'Media',
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1767335911106-b96c1cc33099',
    author: { name: 'Chef Mario', avatar: 'https://images.unsplash.com/photo-1678626667639-de9c676e8222' },
    likes: 3500,
    liked: true,
    saved: true,
    ingredients: ['Chocolate 70%', 'Mantequilla', 'Huevos', 'Harina', 'Azúcar glass'],
    steps: [
      { text: 'Derretir chocolate con mantequilla al baño maría.', duration: 180 },
      { text: 'Mezclar con huevos y azúcar.' },
      { text: 'Hornear a 200°C por exactamente 12 minutos.', duration: 720 }
    ]
  }
];

// Components
const MobileFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans text-[#2D2D2D]">
    <div className="relative w-full max-w-[393px] h-[852px] bg-[#FFFDF9] rounded-[50px] shadow-[0_0_0_10px_#1a1a1a,0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-[8px] border-[#1a1a1a]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-[#1a1a1a] rounded-b-[20px] z-[60] flex items-center justify-center">
         <div className="w-[12px] h-[12px] bg-[#1a1a1a] absolute -left-[12px] top-0 rounded-tr-[12px] shadow-[4px_-4px_0_0_#1a1a1a]"></div>
         <div className="w-[12px] h-[12px] bg-[#1a1a1a] absolute -right-[12px] top-0 rounded-tl-[12px] shadow-[-4px_-4px_0_0_#1a1a1a]"></div>
      </div>
      <div className="h-full w-full overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  </div>
);

const BottomNav = ({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) => {
  const tabs = [
    { id: 'recipes', label: 'Mis Recetas', icon: ChefHat },
    { id: 'explore', label: 'Explorar', icon: Search },
    { id: 'create', label: 'Crear', icon: PlusCircle },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 pt-3 pb-8 flex justify-between items-center z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#FF8A5B]' : 'text-gray-400'}`}
          >
            <motion.div whileTap={{ scale: 0.9 }} animate={isActive ? { y: -2 } : { y: 0 }}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const FloatingTimer = ({ duration, onComplete, onClose }: { duration: number, onComplete: () => void, onClose: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      onComplete();
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / duration) * 100;
  const circumference = 2 * Math.PI * 20;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-32 left-4 right-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-orange-50 p-4 z-[70] flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="#F5F0E8" strokeWidth="4" fill="transparent" />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="#FF8A5B"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-[#FF8A5B]">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div>
          <h4 className="text-sm font-bold">Temporizador</h4>
          <p className="text-[10px] text-gray-400 font-medium">Cocción en curso...</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsActive(!isActive)} className="p-2.5 bg-[#F5F0E8] text-[#A0522D] rounded-full active:scale-90 transition-transform">
          {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <button onClick={onClose} className="p-2.5 bg-gray-50 text-gray-400 rounded-full active:scale-90 transition-transform">
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const RecipeDetail = ({ recipe, onBack }: { recipe: Recipe, onBack: () => void }) => {
  const [activeTimer, setActiveTimer] = useState<{ duration: number } | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const startTimer = (duration: number) => {
    setActiveTimer({ duration });
  };

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients(prev => ({ ...prev, [ing]: !prev[ing] }));
  };

  return (
    <div className="absolute inset-0 bg-white z-[55] overflow-y-auto pb-48 no-scrollbar">
      <div className="relative h-[300px] w-full">
        <ImageWithFallback src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button onClick={onBack} className="absolute top-12 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{recipe.title}</h2>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider">
              <Timer size={14} /> {recipe.time}
            </span>
            <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider">
              <Flame size={14} /> {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#FF8A5B] rounded-full" />
            Ingredientes
          </h3>
          <div className="space-y-4">
            {recipe.ingredients.map((ing, i) => (
              <label key={i} className="flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-transform">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${checkedIngredients[ing] ? 'bg-[#FF8A5B] border-[#FF8A5B]' : 'border-gray-200'}`}>
                  {checkedIngredients[ing] && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <input type="checkbox" className="hidden" onChange={() => toggleIngredient(ing)} />
                <span className={`text-base font-medium transition-all duration-300 ${checkedIngredients[ing] ? 'text-gray-300 line-through' : 'text-gray-700'}`}>{ing}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#A0522D] rounded-full" />
            Preparación
          </h3>
          <div className="space-y-6">
            {recipe.steps.map((step, i) => (
              <div key={i} className="relative pl-10 border-l border-orange-50 pb-2">
                <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-[#FF8A5B] border-4 border-[#FFFDF9] shadow-sm" />
                <div className="bg-[#F5F0E8]/50 p-5 rounded-[24px] border border-orange-50/50">
                  <span className="block text-[10px] font-black text-[#FF8A5B] mb-2 uppercase tracking-[0.2em]">Paso {i + 1}</span>
                  <p className="text-[#4A4A4A] leading-relaxed mb-4 text-sm font-medium">{step.text}</p>
                  {step.duration && (
                    <button 
                      onClick={() => startTimer(step.duration!)}
                      className="flex items-center gap-2 bg-white text-[#FF8A5B] px-5 py-2.5 rounded-full text-xs font-black shadow-sm border border-orange-100 active:scale-95 transition-transform"
                    >
                      <Timer size={16} /> INICIAR ({Math.floor(step.duration / 60)} MIN)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full px-6 flex justify-center">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
             if (navigator.share) {
               navigator.share({ title: recipe.title, text: '¡Mira esta receta!', url: window.location.href });
             } else {
               toast.info('Link copiado al portapapeles');
             }
          }}
          className="flex items-center justify-center gap-3 bg-[#A0522D] text-white w-full max-w-xs py-5 rounded-full font-bold shadow-2xl shadow-orange-900/30 border-b-4 border-orange-900/20"
        >
          <Share2 size={20} /> Compartir receta
        </motion.button>
      </div>

      <AnimatePresence>
        {activeTimer && (
          <FloatingTimer 
            key="active-floating-timer"
            duration={activeTimer.duration} 
            onClose={() => setActiveTimer(null)}
            onComplete={() => {
              toast.success('¡Tiempo completado!', { icon: '🔔' });
              setActiveTimer(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterBar = ({ activeFilter, setFilter, categories }: { activeFilter: string, setFilter: (f: string) => void, categories: string[] }) => (
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 pt-1 px-1">
    {categories.map((f) => (
      <button 
        key={f} 
        onClick={() => setFilter(f)} 
        className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest border ${
          activeFilter === f 
          ? 'bg-[#FF8A5B] text-white border-[#FF8A5B] shadow-lg shadow-orange-200' 
          : 'bg-[#F5F0E8] text-[#A0522D] border-orange-50 active:bg-orange-100'
        }`}
      >
        {f}
      </button>
    ))}
  </div>
);

const CreateView = ({ onSave }: { onSave: (r: Recipe) => void }) => {
  const [mode, setMode] = useState<'selection' | 'manual' | 'ai'>('selection');
  const [analyzing, setAnalyzing] = useState(false);
  const [showImageSource, setShowImageSource] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Fácil');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<{ text: string, duration: string }[]>([{ text: '', duration: '' }]);

  const addIngredient = () => setIngredients([...ingredients, '']);
  const updateIngredient = (index: number, val: string) => {
    const newIngs = [...ingredients];
    newIngs[index] = val;
    setIngredients(newIngs);
  };
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const addStep = () => setSteps([...steps, { text: '', duration: '' }]);
  const updateStep = (index: number, field: 'text' | 'duration', val: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: val };
    setSteps(newSteps);
  };
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!title.trim()) return toast.error('El título es obligatorio');
    const newRecipe: Recipe = {
      id: Math.random().toString(),
      title,
      difficulty,
      category: 'Rápidas', // Default for now
      time: steps.some(s => s.duration) ? `${Math.max(...steps.map(s => parseInt(s.duration) || 0))} min` : '15 min',
      image: 'https://images.unsplash.com/photo-1769770639042-05e6b54a70cb',
      ingredients: ingredients.filter(i => i.trim()),
      steps: steps.filter(s => s.text.trim()).map(s => ({
        text: s.text,
        duration: parseInt(s.duration) ? parseInt(s.duration) * 60 : undefined
      }))
    };
    onSave(newRecipe);
    toast.success('¡Receta guardada!');
    resetForm();
    setMode('selection');
  };

  const resetForm = () => {
    setTitle('');
    setDifficulty('Fácil');
    setIngredients(['']);
    setSteps([{ text: '', duration: '' }]);
  };

  const simulateAI = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      // Pre-fill form with "AI data"
      setTitle('Pasta alla Gricia IA');
      setDifficulty('Media');
      setIngredients(['Pasta', 'Guanciale', 'Pecorino Romano', 'Pimienta negra']);
      setSteps([
        { text: 'Dorar el guanciale hasta que esté crujiente.', duration: '5' },
        { text: 'Mezclar con pecorino y agua de pasta.', duration: '3' }
      ]);
      setMode('manual'); // Switch to manual to allow editing
      toast.success('¡Datos extraídos con éxito! Puedes editarlos ahora.');
    }, 3000);
  };

  if (mode === 'manual') {
    return (
      <div className="flex-1 overflow-y-auto p-6 pb-40 no-scrollbar">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => { setMode('selection'); resetForm(); }} className="p-2.5 bg-gray-100 rounded-full active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-black tracking-tight">Nueva Receta</h1>
        </div>

        <div className="space-y-8">
          <div 
            onClick={() => setShowImageSource(true)}
            className="h-48 w-full border-2 border-dashed border-gray-200 rounded-[28px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
              <PlusCircle size={28} className="text-[#FF8A5B]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Subir imagen principal</span>
          </div>

          <div className="space-y-7">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Título del plato</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                type="text" 
                placeholder="Ej. Lasaña casera" 
                className="w-full bg-[#F5F0E8] border-none rounded-[20px] px-6 py-4.5 text-base font-bold focus:ring-2 focus:ring-[#FF8A5B] outline-none" 
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nivel de dificultad</label>
              <div className="flex gap-2.5">
                {(['Fácil', 'Media', 'Difícil'] as Difficulty[]).map(d => (
                  <button 
                    key={d} 
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${difficulty === d ? 'bg-[#FF8A5B] text-white shadow-xl shadow-orange-200' : 'bg-gray-100 text-gray-400 active:bg-gray-200'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Ingredientes</label>
                <button onClick={addIngredient} className="text-[#FF8A5B] flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest active:scale-95">
                  <PlusCircle size={14} strokeWidth={3} /> Añadir
                </button>
              </div>
              <div className="space-y-3">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      value={ing}
                      onChange={e => updateIngredient(idx, e.target.value)}
                      type="text" 
                      placeholder="Ej. 200g de harina" 
                      className="flex-1 bg-gray-100 rounded-[18px] px-5 py-4 text-sm font-bold border-none focus:bg-white focus:ring-1 focus:ring-orange-100 outline-none" 
                    />
                    {ingredients.length > 1 && (
                      <button onClick={() => removeIngredient(idx)} className="p-3 text-red-300 active:text-red-500"><Trash2 size={20} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Preparación paso a paso</label>
                <button onClick={addStep} className="text-[#FF8A5B] flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest active:scale-95">
                  <PlusCircle size={14} strokeWidth={3} /> Añadir paso
                </button>
              </div>
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-[24px] p-5 border border-gray-100 relative group">
                    <div className="flex justify-between mb-3">
                       <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Paso {idx+1}</span>
                       {steps.length > 1 && <button onClick={() => removeStep(idx)} className="text-gray-300 active:text-red-400"><X size={16} /></button>}
                    </div>
                    <textarea 
                      value={step.text}
                      onChange={e => updateStep(idx, 'text', e.target.value)}
                      placeholder="¿Qué hacemos en este paso?"
                      className="w-full bg-transparent border-none resize-none text-sm font-bold outline-none mb-4 placeholder:text-gray-300"
                      rows={2}
                    />
                    <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl w-fit border border-gray-100 shadow-sm">
                       <Timer size={16} className="text-orange-300" />
                       <input 
                         value={step.duration}
                         onChange={e => updateStep(idx, 'duration', e.target.value)}
                         type="number" 
                         inputMode="numeric"
                         pattern="[0-9]*"
                         placeholder="0" 
                         className="w-12 text-sm font-black outline-none border-none p-0 text-center"
                       />
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Minutos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-5 bg-[#A0522D] text-white rounded-[24px] font-black text-base uppercase tracking-widest shadow-xl shadow-orange-900/20 active:translate-y-1 transition-transform border-b-4 border-orange-900/30"
          >
            Guardar en biblioteca
          </button>
        </div>

        {/* Mobile-Adapted Bottom Sheet for Image Source */}
        <AnimatePresence>
          {showImageSource && (
            <React.Fragment key="image-source-modal-container">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowImageSource(false)} className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-[#FFFDF9] rounded-t-[40px] p-8 z-[81] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-10" />
                <h3 className="text-xl font-black mb-8 text-center tracking-tight">Elegir Imagen</h3>
                <div className="flex gap-5 mb-6">
                   <button onClick={() => { toast.info('Accediendo a la galería...'); setShowImageSource(false); }} className="flex-1 flex flex-col items-center gap-4 p-8 bg-[#F5F0E8] rounded-[32px] active:scale-95 transition-transform border border-orange-50">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#FF8A5B] shadow-sm"><ImageIcon size={30} /></div>
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-[#A0522D]">Galería</span>
                   </button>
                   <button onClick={() => { toast.info('Accediendo a la cámara...'); setShowImageSource(false); }} className="flex-1 flex flex-col items-center gap-4 p-8 bg-[#F5F0E8] rounded-[32px] active:scale-95 transition-transform border border-orange-50">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#FF8A5B] shadow-sm"><Camera size={30} /></div>
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-[#A0522D]">Cámara</span>
                   </button>
                </div>
                <button onClick={() => setShowImageSource(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-full font-bold text-sm">Cancelar</button>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (mode === 'ai') {
    return (
      <div className="flex-1 overflow-y-auto p-6 pb-32 bg-[#0F172A] text-white min-h-full no-scrollbar">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setMode('selection')} className="p-2.5 bg-white/10 rounded-full active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-blue-400" />
            <h1 className="text-2xl font-black tracking-tight">AI Chef Vision</h1>
          </div>
        </div>
        <div className="space-y-8 mt-12 text-center">
          <div className="w-24 h-24 bg-blue-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
            <Youtube size={40} className="text-blue-400 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Crea desde un vídeo</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[260px] mx-auto mb-10">Pega el link de TikTok, Reels o YouTube y generaremos la receta paso a paso.</p>
          
          <div className="space-y-5">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Pega el enlace aquí..." 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-[24px] px-6 py-5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" 
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                 <Music2 size={16} className="text-slate-500" />
              </div>
            </div>
            <button 
              onClick={simulateAI} 
              disabled={analyzing} 
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[24px] font-black text-base uppercase tracking-widest shadow-2xl shadow-blue-900/40 active:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles size={20} fill="currentColor" /> Analizar vídeo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-32 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 bg-[#F5F0E8] rounded-[30px] flex items-center justify-center mb-8 text-[#FF8A5B] shadow-lg shadow-orange-100/50"
      >
        <PlusCircle size={40} strokeWidth={2.5} />
      </motion.div>
      <h1 className="text-3xl font-black text-center mb-3 tracking-tight">Nueva Receta</h1>
      <p className="text-gray-400 text-center text-sm mb-12 max-w-[240px] font-medium leading-relaxed">Sube tus propias creaciones o usa nuestra IA para importar vídeos.</p>
      
      <div className="w-full space-y-5">
        <button onClick={() => setMode('manual')} className="w-full p-6 bg-[#F5F0E8] rounded-[36px] flex items-center gap-5 group hover:bg-[#FF8A5B] transition-all duration-500 border border-orange-50 active:scale-[0.98]">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><ChefHat size={32} className="text-[#A0522D]" /></div>
          <div className="text-left">
            <h3 className="font-black text-lg group-hover:text-white uppercase tracking-tighter">Manual</h3>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-white/80 uppercase tracking-widest">Crear paso a paso</p>
          </div>
        </button>
        <button onClick={() => setMode('ai')} className="w-full p-6 bg-slate-900 rounded-[36px] flex items-center gap-5 group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 active:scale-[0.98]">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform"><Sparkles size={32} className="text-white" fill="currentColor" /></div>
          <div className="text-left">
            <h3 className="font-black text-lg text-white uppercase tracking-tighter">IA Chef Vision</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Importar desde link</p>
          </div>
        </button>
      </div>
    </div>
  );
};

const MyRecipesView = ({ recipes, onSelect }: { recipes: Recipe[], onSelect: (r: Recipe) => void }) => {
  const [filter, setFilter] = useState('Todas');
  const categories = ['Todas', 'Rápidas', 'Saludables', 'Vegetarianas', 'Postres'];

  const filteredRecipes = useMemo(() => {
    if (filter === 'Todas') return recipes;
    return recipes.filter(r => r.category === filter);
  }, [recipes, filter]);

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight mb-2">Mis Recetas</h1>
        <p className="text-gray-500 text-sm font-medium">Tu cocina personal organizada</p>
      </header>

      <FilterBar activeFilter={filter} setFilter={setFilter} categories={categories} />

      <div className="space-y-6 mt-4">
        {filteredRecipes.length > 0 ? filteredRecipes.map((recipe) => (
          <motion.div 
            key={recipe.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }} 
            onClick={() => onSelect(recipe)} 
            className="group relative bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm active:shadow-md transition-all"
          >
            <div className="relative h-52">
              <ImageWithFallback src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                {recipe.category}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 tracking-tight">{recipe.title}</h3>
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5"><Timer size={16} className="text-[#FF8A5B]" /> {recipe.time}</span>
                  <span className="flex items-center gap-1.5"><Flame size={16} className="text-[#FF8A5B]" /> {recipe.difficulty}</span>
                </div>
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                <ChefHat size={32} />
             </div>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No hay recetas en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ExploreView = ({ onSelect, recipes, onUpdate }: { onSelect: (r: Recipe) => void, recipes: Recipe[], onUpdate: (rs: Recipe[]) => void }) => {
  const [filter, setFilter] = useState('Tendencia');
  const categories = ['Tendencia', 'Rápidas', 'Saludables', 'Vegetarianas', 'Postres'];

  const filteredRecipes = useMemo(() => {
    if (filter === 'Tendencia') return recipes;
    return recipes.filter(r => r.category === filter);
  }, [recipes, filter]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(recipes.map(r => r.id === id ? { ...r, liked: !r.liked, likes: (r.likes || 0) + (r.liked ? -1 : 1) } : r));
    if (!recipes.find(r => r.id === id)?.liked) toast.success('¡Añadido a favoritos!');
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(recipes.map(r => r.id === id ? { ...r, saved: !r.saved } : r));
    toast.success(recipes.find(r => r.id === id)?.saved ? 'Receta eliminada' : 'Receta guardada');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
      <div className="p-6 sticky top-0 bg-[#FFFDF9]/90 backdrop-blur-xl z-30 border-b border-orange-50/50">
        <h1 className="text-3xl font-black mb-4 tracking-tight">Explorar</h1>
        <FilterBar activeFilter={filter} setFilter={setFilter} categories={categories} />
      </div>

      <div className="px-6 space-y-12 mt-6">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id} className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#FF8A5B]/20 p-0.5">
                  <ImageWithFallback src={recipe.author?.avatar!} alt={recipe.author?.name!} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight">{recipe.author?.name}</h4>
                  <p className="text-[9px] font-black text-[#FF8A5B] uppercase tracking-[0.1em]">Gourmet Chef</p>
                </div>
              </div>
              <button onClick={(e) => toggleSave(recipe.id, e)} className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all active:scale-90 ${recipe.saved ? 'bg-[#FF8A5B] text-white shadow-xl shadow-orange-200' : 'bg-[#F5F0E8] text-[#A0522D] border border-orange-50'}`}>
                <Bookmark size={22} fill={recipe.saved ? 'currentColor' : 'none'} strokeWidth={2.5} />
              </button>
            </div>
            
            <motion.div 
              whileTap={{ scale: 0.97 }} 
              onClick={() => onSelect(recipe)} 
              className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl mb-5 group active:shadow-orange-100"
            >
              <ImageWithFallback src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex gap-2 mb-3">
                   <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20">{recipe.category}</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight">{recipe.title}</h3>
                <div className="flex items-center gap-4 text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><Timer size={14} className="text-white" /> {recipe.time}</span>
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                  <span className="flex items-center gap-1.5"><Flame size={14} className="text-white" /> {recipe.difficulty}</span>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-6">
                <button onClick={(e) => toggleLike(recipe.id, e)} className={`flex items-center gap-2 font-black transition-all active:scale-125 ${recipe.liked ? 'text-red-500' : 'text-gray-400'}`}>
                  <Heart size={24} fill={recipe.liked ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  <span className="text-sm tracking-tighter">{recipe.likes}</span>
                </button>
                <button className="text-gray-400 hover:text-blue-500 active:scale-110 transition-transform">
                  <Share2 size={24} strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i+recipe.id}`} alt="user" className="w-full h-full object-cover" />
                   </div>
                 ))}
                 <div className="w-7 h-7 rounded-full border-2 border-white bg-[#F5F0E8] flex items-center justify-center text-[8px] font-black text-[#A0522D]">
                    +12
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [exploreRecipes, setExploreRecipes] = useState<Recipe[]>(EXPLORE_RECIPES_INITIAL);

  const addNewRecipe = (recipe: Recipe) => {
    setMyRecipes([recipe, ...myRecipes]);
    setActiveTab('recipes');
  };

  return (
    <MobileFrame>
      <GlobalStyles />
      <Toaster position="top-center" theme="light" expand={false} richColors />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'recipes' && (
            <motion.div key="recipes-tab" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex flex-col overflow-hidden">
              <MyRecipesView recipes={myRecipes} onSelect={setSelectedRecipe} />
            </motion.div>
          )}
          {activeTab === 'explore' && (
            <motion.div key="explore-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex-1 flex flex-col overflow-hidden">
              <ExploreView onSelect={setSelectedRecipe} recipes={exploreRecipes} onUpdate={setExploreRecipes} />
            </motion.div>
          )}
          {activeTab === 'create' && (
            <motion.div key="create-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex-1 flex flex-col overflow-hidden">
              <CreateView onSave={addNewRecipe} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedRecipe && (
            <motion.div key="recipe-detail-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 350 }} className="absolute inset-0 z-[100]">
              <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
            </motion.div>
          )}
        </AnimatePresence>
        <BottomNav activeTab={activeTab} setTab={setActiveTab} />
      </div>
    </MobileFrame>
  );
}
