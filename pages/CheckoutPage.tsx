import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Loader2, AlertCircle, Copy, Check, UploadCloud, Building2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import AddressSelector from '../components/AddressSelector';
import api from '../lib/api';
import { CartItem, Address } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  total: number;
  onReturnToShop: () => void;
}

type CheckoutStep = 'shipping' | 'payment';
type PaymentMethodType = 'mercadopago' | 'transfer' | null;

const BANK_DETAILS = {
  bank: "Banco Santander",
  owner: "Espacios de Azúcar S.A.",
  cbu: "0720000000000000000022",
  alias: "ESPACIOS.AZUCAR.MP",
  cuit: "30-12345678-9"
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, total, onReturnToShop }) => {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  
  const [isTransferSuccess, setIsTransferSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transferFile, setTransferFile] = useState<File | null>(null);

  const discountAmount = paymentMethod === 'transfer' ? total * 0.10 : 0;
  const finalTotal = total - discountAmount;

  useEffect(() => {
    if (isTransferSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTransferSuccess && countdown === 0) {
      onReturnToShop();
    }
  }, [isTransferSuccess, countdown, onReturnToShop]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ==========================================
  // 🔥 LÓGICA UNIFICADA: CREAR Y PAGAR
  // ==========================================
  const handleFinalProcess = async () => {
    if (!selectedAddress) {
      setError("Por favor selecciona una dirección de envío.");
      return;
    }
    if (!paymentMethod) {
      setError("Por favor selecciona un método de pago.");
      return;
    }

    setLoadingOrder(true);
    setError(null);

    try {
      const orderPayload = {
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethod,
        total: finalTotal,
        items: cart.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      // Llamamos a tu nuevo controlador unificado /api/store/checkout
      const { data } = await api.post('/api/store/checkout', orderPayload);

      if (paymentMethod === 'mercadopago' && data.init_point) {
        // 🚀 REDIRECCIÓN DIRECTA A MERCADO PAGO
        window.location.href = data.init_point;
      } else if (paymentMethod === 'transfer') {
        // Si es transferencia, pasamos al paso de ver datos bancarios
        setStep('payment');
      }

    } catch (err: any) {
      console.error("Error en proceso:", err);
      setError(err.response?.data?.error || "Error al procesar la solicitud.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const OrderSummaryContent = () => (
    <>
      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-thin">
        {cart.map((item) => (
          <div key={item.cartItemId} className="flex gap-3 text-sm">
            <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 relative">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                <div className="absolute -top-0 -right-0 bg-stone-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-bl font-bold">
                  {item.quantity}
                </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-800 line-clamp-1">{item.name}</p>
              <p className="text-stone-400 text-xs">{item.selectedColor?.name}</p>
            </div>
            <div className="font-medium text-stone-900">${(item.price * item.quantity).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-100 pt-4 space-y-2 text-sm text-stone-600">
        <div className="flex justify-between"><span>Subtotal</span><span>${total.toLocaleString()}</span></div>
        {paymentMethod === 'transfer' && (
          <div className="flex justify-between text-green-700 font-medium">
            <span>Descuento (10%)</span><span>-${discountAmount.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-end">
        <span className="font-serif text-lg text-stone-800">Total</span>
        <span className="font-bold text-2xl text-stone-900">${finalTotal.toLocaleString()}</span>
      </div>
    </>
  );

  if (isTransferSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-stone-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-2">¡Comprobante Recibido!</h2>
          <p className="text-stone-500 mb-6 text-sm leading-relaxed">Redirigiendo a la tienda en {countdown}s...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={onReturnToShop} className="text-sm font-medium text-stone-500 flex items-center gap-1 hover:text-stone-900">
            <ArrowLeft className="w-4 h-4" /> Volver a la tienda
          </button>
          <div className="flex items-center gap-2 text-stone-900">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-serif font-bold text-lg">Checkout Seguro</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECCIÓN 1: DIRECCIÓN Y MÉTODO */}
          <div className={`bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100 ${step === 'payment' ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="font-serif text-xl text-stone-800 mb-6 flex items-center gap-2">
              <span className="bg-stone-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
              Información de Pedido
            </h2>
            
            <AddressSelector 
              onSelect={(addr) => { setSelectedAddress(addr); setError(null); }} 
              selectedAddressId={selectedAddress?.id}
            />

            <div className="mt-8">
              <label className="block text-sm font-bold text-stone-800 mb-4 uppercase tracking-widest">Método de Pago</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'mercadopago' ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-stone-200'}`}
                >
                  <img src="/mercadonegro.png" alt="MP" className="h-6" />
                </button>
                <button 
                  onClick={() => setPaymentMethod('transfer')}
                  className={`border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'transfer' ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-stone-200'}`}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Transferencia -10%</span>
                </button>
              </div>
            </div>

            {error && <div className="mt-6 text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleFinalProcess}
                disabled={loadingOrder || !selectedAddress || !paymentMethod}
                className="bg-stone-900 text-white px-10 py-4 rounded font-bold text-xs tracking-widest hover:bg-stone-800 disabled:opacity-50 w-full md:w-auto flex items-center justify-center gap-2"
              >
                {loadingOrder ? <Loader2 className="w-4 h-4 animate-spin"/> : paymentMethod === 'mercadopago' ? 'PAGAR AHORA' : 'VER DATOS BANCARIOS'}
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DE TRANSFERENCIA (SOLO SI ELIGE TRANSFERENCIA) */}
          {step === 'payment' && paymentMethod === 'transfer' && (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="font-serif text-xl text-stone-800 mb-6 flex items-center gap-2">
                <span className="bg-stone-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                Finalizar Transferencia
              </h2>
              <div className="bg-stone-50 p-6 rounded border border-stone-200 space-y-4">
                 <div className="flex justify-between items-center bg-white p-3 rounded border">
                   <div><span className="text-[10px] font-bold block text-stone-400">ALIAS</span><span className="font-mono">{BANK_DETAILS.alias}</span></div>
                   <button onClick={() => handleCopy(BANK_DETAILS.alias, 'alias')}><Copy className="w-4 h-4"/></button>
                 </div>
                 <div className="flex justify-between items-center bg-white p-3 rounded border">
                   <div><span className="text-[10px] font-bold block text-stone-400">CBU</span><span className="font-mono text-xs">{BANK_DETAILS.cbu}</span></div>
                   <button onClick={() => handleCopy(BANK_DETAILS.cbu, 'cbu')}><Copy className="w-4 h-4"/></button>
                 </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Adjuntar Comprobante</label>
                <div className="border-2 border-dashed border-stone-300 p-6 rounded-lg text-center relative cursor-pointer hover:bg-stone-50">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setTransferFile(e.target.files?.[0] || null)} />
                  {transferFile ? <div className="flex items-center justify-center gap-2 text-green-600"><Check/>{transferFile.name}</div> : <p className="text-xs text-stone-400">Haz clic aquí para subir el archivo</p>}
                </div>
              </div>

              <button onClick={() => setIsTransferSuccess(true)} className="w-full mt-6 bg-stone-900 text-white py-4 rounded font-bold text-xs tracking-widest">INFORMAR PAGO</button>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 sticky top-24">
            <h3 className="font-serif text-lg mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Resumen</h3>
            <OrderSummaryContent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;