import React, { useEffect, useState } from 'react';

const PaymentResult = () => {
  const [countdown, setCountdown] = useState(10);
  
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const paymentId = params.get('payment_id');
  const orderId = params.get('order_id') || params.get('external_reference');

  const isSuccess = status === 'success' || status === 'approved';

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = window.location.origin;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess]);

  const handleAction = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 font-sans animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-10 rounded-lg shadow-xl max-w-md w-full text-center border border-stone-100 relative overflow-hidden">
        
        {isSuccess && (
          <div 
            className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        )}

        <div className="mb-8 flex justify-center">
          {isSuccess ? (
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center ring-1 ring-green-100">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center ring-1 ring-red-100">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="font-serif text-3xl text-stone-900 mb-4">
          {isSuccess ? 'Pago Acreditado' : 'Hubo un problema'}
        </h1>

        <p className="text-stone-500 mb-8 leading-relaxed font-light text-sm">
          {isSuccess 
            ? `Tu orden #${orderId || '...'} ha sido procesada correctamente. En breve recibirás un correo con la confirmación.`
            : 'No pudimos procesar tu pago. Por favor revisa los datos de tu tarjeta o intenta con otro medio de pago.'
          }
        </p>

        <div className="bg-stone-50 rounded-lg p-6 mb-8 text-sm border border-stone-100">
          <div className="flex justify-between mb-3 border-b border-stone-200 pb-2">
            <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Operación</span>
            <span className="font-mono text-stone-800">{paymentId || '---'}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Estado</span>
            <span className={`font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {isSuccess ? 'APROBADO' : 'RECHAZADO'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleAction}
            className="w-full bg-stone-900 text-white py-4 rounded font-bold hover:bg-stone-800 transition shadow-lg uppercase tracking-widest text-[10px]"
          >
            {isSuccess ? `Volver a la tienda (${countdown}s)` : 'Intentar nuevamente'}
          </button>
          {isSuccess && (
            <p className="text-[9px] text-stone-400 uppercase tracking-tighter">
              Serás redirigido automáticamente
            </p>
          )}
        </div>
      </div>
      <p className="mt-8 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
        Espacios de Azúcar &copy; 2025
      </p>
    </div>
  );
};

export default PaymentResult;