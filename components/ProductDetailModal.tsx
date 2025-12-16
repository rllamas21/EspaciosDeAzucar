
import React, { useState, useEffect } from 'react';

import { X, Ruler, Sparkles, ScrollText, Check, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ColorOption } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  // Updated signature to accept size
  onAddToCart: (product: Product, color?: ColorOption, size?: string, quantity?: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
 const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>(
  product?.colors?.[0]
);

// Gallery state (ÚNICO)
const [activeImageIndex, setActiveImageIndex] = useState(0);

useEffect(() => {
  setActiveImageIndex(0);
}, [selectedColor]);

// NEW: Local size state
const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

// Tabs, quantity, errors
const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'care'>('description');
const [quantity, setQuantity] = useState(1);
const [showSizeError, setShowSizeError] = useState(false);

  if (!product) return null;

 // ✅ Gallery images (STRICTAMENTE por color)
const galleryImages = selectedColor
  ? [
      selectedColor.image,
      selectedColor.hoverImage,
    ].filter(Boolean)
  : product.images && product.images.length > 0
    ? product.images
    : [product.image];



  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    // Validation: If product has sizes but none selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }
    onAddToCart(product, selectedColor, selectedSize, quantity);
  };

  return (
    // FIX: Changed 'items-center' to 'items-end md:items-center' and added 'overflow-y-auto' to parent
    // This ensures on mobile, if content is tall, we can scroll the whole page and top isn't cut off.
    <div className="fixed inset-0 z-[80] flex md:items-center justify-center overflow-y-auto bg-stone-900/60 backdrop-blur-sm">
      
      {/* Backdrop Click Zone - Needs to be separate to not block scroll */}
      <div 
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      {/* FIX: 
          1. Removed fixed height 'h-full' on mobile. Used 'min-h-full md:min-h-0 md:h-auto'.
          2. Added 'md:max-h-[90vh]' only for desktop.
          3. Added 'mt-auto md:mt-0' to stick to bottom on mobile or center on desktop.
      */}
      <div className="relative bg-[#fafaf9] w-full max-w-5xl min-h-full md:min-h-0 md:h-auto md:max-h-[90vh] md:rounded-lg shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 pointer-events-auto">
        
        {/* Close Button - Sticky on mobile to ensure visibility */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur-md rounded-full text-stone-900 hover:bg-stone-900 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image (Hero + Carousel Logic) */}
        {/* FIX: Changed h-[40vh] to aspect-square on mobile. This guarantees the image isn't too tall. */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-auto relative bg-stone-200 flex-shrink-0 group overflow-hidden">
           <img 
             key={activeImageIndex}
             src={galleryImages[activeImageIndex]} 
             alt={product.name} 
             className="w-full h-full object-cover animate-in fade-in duration-500"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent pointer-events-none" />

           {/* Navigation Controls (Only if > 1 image) */}
           {galleryImages.length > 1 && (
             <>
               <button 
                 onClick={handlePrevImage}
                 className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-stone-900 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100 backdrop-blur-sm z-10"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>

               <button 
                 onClick={handleNextImage}
                 className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-stone-900 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100 backdrop-blur-sm z-10"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>

               {/* Pagination Dots */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                 {galleryImages.map((_, idx) => (
                   <button
                     key={idx}
                     onClick={() => setActiveImageIndex(idx)}
                     className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${
                       activeImageIndex === idx 
                         ? 'bg-white w-4' 
                         : 'bg-white/50 hover:bg-white/80'
                     }`}
                   />
                 ))}
               </div>
             </>
           )}
        </div>

        {/* Right: Content */}
        {/* FIX: Removed h-[60vh] constraint. Allowed 'flex-1' and 'overflow-y-auto' only on desktop. */}
        <div className="w-full md:w-1/2 flex flex-col md:h-auto md:overflow-hidden bg-[#fafaf9]">
          
          {/* Header Area */}
          <div className="p-6 md:p-10 pb-0 flex-shrink-0">
             <span className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium block mb-2">{product.category}</span>
             <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2 leading-tight">{product.name}</h2>
             <p className="text-xl font-medium text-stone-900 mb-6">${product.price.toLocaleString()}</p>
             
             {/* Action Area (Color & Size & Add) */}
             <div className="flex flex-col gap-6 border-b border-stone-200 pb-8">
                
                {/* COLOR SELECTION */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-widest text-stone-400 w-16">Acabado:</span>
                    <div className="flex gap-2">
                      {product.colors.map((c) => (
                         <button
  key={c.name}
  onClick={() => setSelectedColor(c)}
  className={`w-8 h-8 rounded-full border border-transparent relative flex items-center justify-center transition-all ${
    selectedColor?.name === c.name
      ? 'ring-1 ring-offset-2 ring-stone-900'
      : 'hover:scale-105'
  }`}
  style={{
    backgroundColor: c.hex,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
  }}
  title={c.name}
>

                           {selectedColor?.name === c.name && (
                             <Check className={`w-4 h-4 ${['Negro', 'Carbón', 'Negro Mate', 'Gunmetal'].includes(c.name) ? 'text-white' : 'text-stone-900'}`} />
                           )}
                         </button>
                      ))}
                    </div>
                    <span className="text-sm text-stone-600">{selectedColor?.name || product.colors[0].name}</span>
                  </div>
                )}

                {/* INLINE SIZE SELECTION - The Solution */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span className={`text-xs uppercase tracking-widest w-16 transition-colors ${showSizeError ? 'text-red-600 font-bold' : 'text-stone-400'}`}>
                        Tamaño:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setSelectedSize(s);
                              setShowSizeError(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium border rounded transition-all ${
                              selectedSize === s 
                                ? 'bg-stone-900 text-white border-stone-900' 
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                            } ${showSizeError ? 'border-red-300 bg-red-50 text-red-800' : ''}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {showSizeError && (
                      <span className="text-[10px] text-red-500 pl-[5.5rem] animate-pulse">Por favor selecciona un tamaño.</span>
                    )}
                  </div>
                )}
                
                {/* QUANTITY & ADD ROW */}
                <div className="flex items-stretch gap-3 h-12 mt-2">
                   {/* Quantity Stepper */}
                   <div className="flex items-center border border-stone-200 rounded w-32 flex-shrink-0 bg-white">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors rounded-l"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center font-medium text-stone-900 tabular-nums select-none">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors rounded-r"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                   </div>

                   {/* Add Button */}
                   <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-stone-900 text-white rounded flex items-center justify-center uppercase tracking-widest text-xs font-medium hover:bg-stone-700 transition-colors shadow-sm"
                    >
                      Agregar — ${(product.price * quantity).toLocaleString()}
                    </button>
                </div>
             </div>
          </div>

          {/* Scrollable Details Area */}
          {/* FIX: Added 'pb-10' to ensure content isn't flush with bottom on mobile. On desktop, overflow-y-auto handles it. */}
          <div className="flex-1 md:overflow-y-auto p-6 md:p-10 pt-0 pb-10">
             
             {/* Tabs - Sticky Header */}
             <div className="flex gap-6 border-b border-stone-200 sticky top-0 bg-[#fafaf9] pt-6 z-10 transition-shadow duration-300">
               {['description', 'specs', 'care'].map((tab) => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`text-xs uppercase tracking-widest pb-3 transition-colors border-b-2 -mb-[1px] ${activeTab === tab ? 'text-stone-900 border-stone-900' : 'text-stone-400 border-transparent hover:text-stone-600'}`}
                 >
                   {tab === 'description' ? 'Descripción' : tab === 'specs' ? 'Ficha Técnica' : 'Cuidados'}
                 </button>
               ))}
             </div>

             {/* Tab Content */}
             <div className="min-h-[200px] pt-6">
               {activeTab === 'description' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                 </div>
               )}

               {activeTab === 'specs' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start gap-3">
                         <Ruler className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                         <div>
                           <h4 className="text-xs uppercase tracking-wider text-stone-900 font-bold mb-1">Dimensiones</h4>
                           <p className="text-stone-600 text-sm">{product.dimensions}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <ScrollText className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                         <div>
                           <h4 className="text-xs uppercase tracking-wider text-stone-900 font-bold mb-1">Materiales</h4>
                           <p className="text-stone-600 text-sm">{product.materialDetails}</p>
                         </div>
                      </div>
                      {product.specs && (
                        <div className="mt-4 bg-white p-4 rounded border border-stone-100">
                           <h4 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Especificaciones</h4>
                           <div className="grid grid-cols-2 gap-y-2">
                             {Object.entries(product.specs).map(([key, value]) => (
                               <div key={key}>
                                 <span className="block text-xs font-bold text-stone-900">{key}</span>
                                 <span className="block text-xs text-stone-500">{value}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
               )}

               {activeTab === 'care' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-stone-900 font-bold mb-1">Mantenimiento</h4>
                        <p className="text-stone-600 text-sm leading-relaxed">{product.careInstructions}</p>
                      </div>
                   </div>
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
