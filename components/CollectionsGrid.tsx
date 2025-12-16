import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  colSpan: string; // Tailwind class for grid layout
  alignment: 'start' | 'end' | 'center';
}

const COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    title: 'Cápsula Wabi-Sabi',
    subtitle: 'La belleza de la imperfección y los materiales honestos.',
    image: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?auto=format&fit=crop&w=1600&q=80',
    colSpan: 'md:col-span-2 md:row-span-2',
    alignment: 'start'
  },
  {
    id: 'c2',
    title: 'Workspace Brutalista',
    subtitle: 'Productividad forjada en hormigón y acero.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    colSpan: 'md:col-span-1 md:row-span-1',
    alignment: 'center'
  },
  {
    id: 'c3',
    title: 'Santuario de Luz',
    subtitle: 'Espacios etéreos para la claridad mental.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    colSpan: 'md:col-span-1 md:row-span-1',
    alignment: 'center'
  },
  {
    id: 'c4',
    title: 'Vida Orgánica',
    subtitle: 'Conectando el interior con el exterior.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
    colSpan: 'md:col-span-3',
    alignment: 'end'
  }
];

const CollectionsGrid: React.FC = () => {
  return (
    <div className="w-full bg-stone-50 min-h-screen pt-24 md:pt-32 pb-20 px-6 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24 space-y-6">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500">
            Series Curadas 2025
          </span>
          <h2 className="font-serif text-5xl md:text-7xl text-stone-900 tracking-tight">
            Nuestras Colecciones
          </h2>
          <p className="max-w-xl mx-auto text-stone-600 font-light text-lg leading-relaxed">
            Explora narrativas visuales diseñadas para evocar emociones específicas y resolver necesidades arquitectónicas con elegancia silenciosa.
          </p>
        </div>

        {/* Masonry Grid - Added auto-rows-[400px] to ensure height on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {COLLECTIONS.map((collection) => (
            <div 
              key={collection.id} 
              className={`group relative overflow-hidden bg-stone-200 cursor-pointer ${collection.colSpan}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={collection.image} 
                  alt={collection.title} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              </div>

              {/* Content Overlay */}
              <div className={`absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white ${collection.alignment === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
                  <div className="flex items-center gap-3 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="h-[1px] w-8 bg-white/70"></span>
                    <span className="text-xs uppercase tracking-[0.2em] font-medium">Explorar</span>
                  </div>
                  
                  <div className="border-t border-white/20 pt-6 mt-2 flex justify-between items-end w-full">
                    <div>
                      <h3 className="font-serif text-3xl md:text-4xl mb-2">{collection.title}</h3>
                      <p className="text-stone-200 font-light text-sm md:text-base max-w-md hidden md:block">
                        {collection.subtitle}
                      </p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsGrid;