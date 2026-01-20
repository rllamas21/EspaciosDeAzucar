import React from 'react';

const PaymentResult = () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const paymentId = params.get('payment_id');
  const orderId = params.get('order_id') || params.get('external_reference');

  const isSuccess = status === 'success' || status === 'approved';
  const isPending = status === 'pending';
  const isFailure = status === 'failure';

  const handleAction = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 font-sans animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-10 rounded-lg shadow-xl max-w-md w-full text-center border border-stone-100 relative overflow-hidden">

        <div className="mb-8 flex justify-center">
          {(isSuccess || isPending) ? (
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
          {isSuccess && 'Pago registrado'}
          {isPending && 'Pago en proceso'}
          {isFailure && 'Hubo un problema'}
        </h1>

        <p className="text-stone-500 mb-8 leading-relaxed font-light text-sm">
          {isSuccess && `Tu orden #${orderId || '—'} fue registrada. Estamos confirmando el pago.`}
          {isPending && 'Estamos esperando la confirmación del pago. Esto puede tardar unos minutos.'}
          {isFailure && 'No se pudo completar el pago. Podés intentarlo nuevamente.'}
        </p>

        <div className="bg-stone-50 rounded-lg p-6 mb-8 text-sm border border-stone-100">
          <div className="flex justify-between mb-3 border-b border-stone-200 pb-2">
            <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Operación</span>
            <span className="font-mono text-stone-800">{paymentId || '---'}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Estado</span>
            <span className={`font-bold ${isFailure ? 'text-red-600' : 'text-green-600'}`}>
              {isFailure ? 'NO CONFIRMADO' : 'EN VERIFICACIÓN'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleAction}
            className="w-full bg-stone-900 text-white py-4 rounded font-bold hover:bg-stone-800 transition shadow-lg uppercase tracking-widest text-[10px]"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
