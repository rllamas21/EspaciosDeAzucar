
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Building2, Copy, Check, UploadCloud, Loader2, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToShop: () => void;
  total: number;
  onClearCart: () => void;
}

type PaymentMethod = 'card' | 'transfer';
type ProcessingState = 'idle' | 'processing' | 'success';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onReturnToShop, total, onClearCart }) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [status, setStatus] = useState<ProcessingState>('idle');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  // Card Form State
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    dni: '',
    installments: '1'
  });

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setMethod('card');
      setUploadedFile(null);
      setCountdown(5);
    }
  }, [isOpen]);

  // Auto-redirect countdown logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === 'success' && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (status === 'success' && countdown === 0) {
      onReturnToShop(); // Call specific return handler
    }
    return () => clearTimeout(timer);
  }, [status, countdown, onReturnToShop]);

  // Calculate Discount
  const discount = method === 'transfer' ? total * 0.10 : 0;
  const finalTotal = total - discount;

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    
    // Simulate API Call
    setTimeout(() => {
      setStatus('success');
      onClearCart();
    }, 2500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // --- RENDER: SUCCESS STATE ---
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" />
        <div className="relative bg-white w-full max-w-md p-12 text-center rounded-sm shadow-2xl animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Check className="w-10 h-10 text-green-900" />
           </div>
           <h2 className="font-serif text-3xl text-stone-900 mb-4">
             {method === 'transfer' ? 'Comprobante Recibido' : 'Pago Exitoso'}
           </h2>
           <p className="text-stone-500 mb-8 font-light">
             {method === 'transfer' 
               ? 'Hemos recibido su comprobante. Nuestro equipo lo validará en breve y procesará su envío.' 
               : 'Su orden ha sido procesada correctamente. En breve recibirá un correo electrónico con los detalles.'}
           </p>
           
           <div className="space-y-4">
             <button 
               onClick={onReturnToShop} // Call specific return handler
               className="bg-stone-900 text-white px-8 py-3 w-full hover:bg-stone-800 transition-colors uppercase tracking-widest text-xs font-medium flex items-center justify-center gap-2"
             >
               Volver a la Tienda <ArrowRight className="w-3 h-3" />
             </button>
             <p className="text-[10px] text-stone-400 animate-pulse">
               Redireccionando en {countdown}s...
             </p>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: FORM STATE ---
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#fafaf9] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-sm shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white">
          <div>
            <h2 className="font-serif text-xl text-stone-900">Finalizar Compra</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-stone-500 uppercase tracking-widest">Total: ${finalTotal.toLocaleString()}</p>
              {method === 'transfer' && (
                <span className="text-[10px] bg-green-100 text-green-800 px-1.5 rounded font-medium">-10% OFF</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center justify-center p-4 border rounded transition-all duration-300 relative ${
                method === 'card' 
                  ? 'bg-white border-stone-900 text-stone-900 shadow-sm ring-1 ring-stone-900' 
                  : 'bg-transparent border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
            >
              <CreditCard className="w-6 h-6 mb-2" strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-wider">Tarjeta</span>
            </button>
            <button
              onClick={() => setMethod('transfer')}
              className={`flex flex-col items-center justify-center p-4 border rounded transition-all duration-300 relative ${
                method === 'transfer' 
                  ? 'bg-white border-stone-900 text-stone-900 shadow-sm ring-1 ring-stone-900' 
                  : 'bg-transparent border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
            >
              {/* Discount Badge */}
              <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                -10%
              </span>
              <Building2 className="w-6 h-6 mb-2" strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-wider">Transferencia</span>
            </button>
          </div>

          {/* CARD FORM */}
          {method === 'card' && (
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Número de Tarjeta</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     placeholder="0000 0000 0000 0000"
                     value={cardData.number}
                     onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                     maxLength={19}
                     required
                     className="w-full bg-white border border-stone-200 p-3 pl-10 text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-0 transition-colors font-mono"
                   />
                   <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Titular</label>
                   <input 
                     type="text" 
                     placeholder="COMO FIGURA EN LA TARJETA"
                     required
                     value={cardData.name}
                     onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                     className="w-full bg-white border border-stone-200 p-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">DNI del Titular</label>
                   <input 
                     type="text" 
                     placeholder="XX.XXX.XXX"
                     required
                     value={cardData.dni}
                     onChange={(e) => setCardData({...cardData, dni: e.target.value})}
                     className="w-full bg-white border border-stone-200 p-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Vencimiento</label>
                   <input 
                     type="text" 
                     placeholder="MM/AA"
                     maxLength={5}
                     required
                     value={cardData.expiry}
                     onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                     className="w-full bg-white border border-stone-200 p-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors text-center"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Cód. Seguridad</label>
                   <div className="relative">
                      <input 
                        type="password" 
                        placeholder="123"
                        maxLength={4}
                        required
                        value={cardData.cvc}
                        onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                        className="w-full bg-white border border-stone-200 p-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors text-center"
                      />
                      <ShieldCheck className="absolute right-3 top-3.5 w-4 h-4 text-stone-300" />
                   </div>
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Plan de Pagos (Cuotas)</label>
                 <select 
                   className="w-full bg-white border border-stone-200 p-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors appearance-none"
                   value={cardData.installments}
                   onChange={(e) => setCardData({...cardData, installments: e.target.value})}
                 >
                   <option value="1">1 pago de ${finalTotal.toLocaleString()} (Sin interés)</option>
                   <option value="3">3 cuotas de ${(finalTotal/3).toFixed(2)} (Sin interés)</option>
                   <option value="6">6 cuotas fijas de ${(finalTotal/6 * 1.15).toFixed(2)}</option>
                 </select>
               </div>
            </form>
          )}

          {/* TRANSFER FORM */}
          {method === 'transfer' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               {/* Discount Banner Inside Form */}
               <div className="bg-green-50 border border-green-100 p-3 flex items-center gap-3 text-green-800 text-sm rounded">
                  <Check className="w-4 h-4" />
                  <span>Descuento del 10% aplicado al seleccionar Transferencia.</span>
               </div>

               <div className="bg-white border border-stone-200 p-6 rounded relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 bg-stone-100 rounded-bl">
                   <Building2 className="w-4 h-4 text-stone-400" />
                 </div>
                 <h3 className="font-serif text-lg text-stone-900 mb-4">Datos Bancarios</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Empresa / Titular</span>
                     <p className="font-medium text-stone-900">Espacios de Azúcar S.R.L.</p>
                   </div>
                   
                   {/* CBU Field */}
                   <div>
                     <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">CBU / CVU</span>
                     <div className="flex gap-2">
                       <code className="flex-1 bg-stone-50 p-2 text-stone-800 font-mono text-sm border border-stone-100 rounded">
                         0070089420000012345678
                       </code>
                       <button 
                         onClick={() => handleCopy('0070089420000012345678', 'cbu')}
                         className="px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded flex items-center justify-center transition-colors min-w-[60px]"
                       >
                         {copiedField === 'cbu' ? <Check className="w-4 h-4 text-green-600" /> : <span className="text-xs font-medium">Copiar</span>}
                       </button>
                     </div>
                   </div>

                   {/* Alias Field */}
                   <div>
                     <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Alias</span>
                     <div className="flex gap-2">
                       <code className="flex-1 bg-stone-50 p-2 text-stone-800 font-mono text-sm border border-stone-100 rounded">
                         ESPACIOS.AZUCAR.AR
                       </code>
                       <button 
                         onClick={() => handleCopy('ESPACIOS.AZUCAR.AR', 'alias')}
                         className="px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded flex items-center justify-center transition-colors min-w-[60px]"
                       >
                         {copiedField === 'alias' ? <Check className="w-4 h-4 text-green-600" /> : <span className="text-xs font-medium">Copiar</span>}
                       </button>
                     </div>
                   </div>

                   <div>
                     <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Banco</span>
                     <p className="text-sm text-stone-700">Banco Galicia</p>
                   </div>
                 </div>
               </div>

               {/* Upload Section */}
               <div className="space-y-2">
                 <h4 className="text-sm font-medium text-stone-900">Adjuntar Comprobante</h4>
                 <label className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all group ${uploadedFile ? 'border-green-200 bg-green-50/30' : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'}`}>
                   <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                   {uploadedFile ? (
                     <>
                        <FileCheck className="w-8 h-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium text-green-800">{uploadedFile}</span>
                        <span className="text-xs text-green-600 mt-1">Archivo listo para enviar</span>
                     </>
                   ) : (
                     <>
                        <UploadCloud className="w-8 h-8 text-stone-300 group-hover:text-stone-500 mb-2 transition-colors" />
                        <span className="text-sm text-stone-500 font-medium group-hover:text-stone-700">Click para subir archivo</span>
                        <span className="text-xs text-stone-400 mt-1">JPG, PNG o PDF</span>
                     </>
                   )}
                 </label>
               </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-200 bg-white">
          <button 
            onClick={handleSubmit}
            disabled={status === 'processing'}
            className="w-full bg-stone-900 text-white h-14 flex items-center justify-center gap-3 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="uppercase tracking-widest text-xs font-medium">Procesando...</span>
              </>
            ) : (
              <span className="uppercase tracking-widest text-xs font-medium">
                {method === 'transfer' ? `Informar Pago ($${finalTotal.toLocaleString()})` : `Pagar $${finalTotal.toLocaleString()}`}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
