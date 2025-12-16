
import React, { useMemo } from 'react';
import { X, Minus, Plus, CreditCard, Building2, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  t: (key: string) => string;
  onCheckout?: () => void; // Added onCheckout Prop
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, t, onCheckout }) => {
  // Simplified Logic: Payment method selection moved to CheckoutModal
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const shipping = subtotal > 5000 ? 0 : 150; // Free shipping over 5000
  const finalTotal = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - z-[70] to cover Navbar (z-60) */}
      <div 
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[70] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer - z-[80] to sit above backdrop */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white z-[80] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-serif text-stone-900">{t('cart_title')} ({cart.reduce((a,c) => a + c.quantity, 0)})</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <span className="text-4xl opacity-20 font-serif">{t('cart_empty')}</span>
              <p className="text-sm uppercase tracking-widest">{t('cart_empty_sub')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex gap-4 group/item">
                <div className="relative w-20 h-24 bg-stone-100 flex-shrink-0">
                  <img
  src={item.selectedColor?.image || item.image}
  alt={item.name}
  className="w-full h-full object-cover mix-blend-multiply"
/>

                  {item.selectedColor && (
                    <div 
                      className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm" 
                      style={{ backgroundColor: item.selectedColor.hex }}
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-stone-900 font-serif leading-tight pr-2">{item.name}</h3>
                      <div className="flex flex-col items-end">
                        <p className="text-sm tabular-nums font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Variant Display */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-stone-500">{item.category}</span>
                      {item.selectedSize && (
                        <>
                          <span className="text-[10px] text-stone-300">•</span>
                          <span className="text-[10px] text-stone-600 font-medium">{item.selectedSize}</span>
                        </>
                      )}
                      {item.selectedColor && (
                        <>
                          <span className="text-[10px] text-stone-300">•</span>
                          <span className="text-[10px] text-stone-600">{item.selectedColor.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-stone-200 rounded-full px-2 h-7">
                      <button 
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="p-1 hover:text-stone-900 text-stone-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="p-1 hover:text-stone-900 text-stone-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title={t('cart_remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="bg-stone-50 p-6 space-y-6 border-t border-stone-200">
            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-stone-200/50">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>{t('shipping')}</span>
                <span>{shipping === 0 ? t('free') : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between text-lg font-serif font-medium text-stone-900 pt-3">
                <span>{t('total')}</span>
                <span className="tabular-nums">${finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-stone-900 text-white h-14 flex items-center justify-between px-6 hover:bg-stone-800 transition-colors group"
            >
              <span className="font-medium tracking-wide">{t('checkout')}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
