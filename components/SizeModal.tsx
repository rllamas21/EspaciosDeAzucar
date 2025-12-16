import React from 'react';
import { X } from 'lucide-react';
import { Product, ColorOption } from '../types';

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  preSelectedColor: ColorOption | null;
  onConfirm: (size: string) => void;
}

const SizeModal: React.FC<SizeModalProps> = ({ isOpen, onClose, product, preSelectedColor, onConfirm }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-sm rounded-lg shadow-xl p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <h3 className="font-serif text-xl text-stone-900">Selecciona Tamaño</h3>
          <div className="flex items-center justify-center gap-3 text-sm text-stone-500 pb-2 border-b border-stone-100">
            <span>{product.name}</span>
            {preSelectedColor && (
              <span className="flex items-center gap-1">
                 • <div className="w-3 h-3 rounded-full border border-stone-200" style={{backgroundColor: preSelectedColor.hex}}></div>
                 {preSelectedColor.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            {product.sizes?.map((size) => (
              <button
                key={size}
                onClick={() => onConfirm(size)}
                className="w-full py-3 px-4 text-sm font-medium border border-stone-200 rounded hover:border-stone-900 hover:bg-stone-50 transition-all text-stone-700"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeModal;