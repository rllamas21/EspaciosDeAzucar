import React from 'react';
import { ArrowLeft, Truck, RefreshCw } from 'lucide-react';

interface InfoPageProps {
  type: 'shipping' | 'returns';
  onBack: () => void;
  t: (key: string) => string;
}

const InfoPage: React.FC<InfoPageProps> = ({ type, onBack, t }) => {
  const isShipping = type === 'shipping';
  
  return (
    <div className="min-h-screen bg-stone-50 pt-24 md:pt-32 pb-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-12 text-sm uppercase tracking-widest font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver
        </button>

        <div className="bg-white p-8 md:p-16 border border-stone-100 shadow-sm">
           <div className="flex items-center gap-4 mb-8 text-stone-900">
              {isShipping ? <Truck className="w-8 h-8" strokeWidth={1} /> : <RefreshCw className="w-8 h-8" strokeWidth={1} />}
              <h1 className="font-serif text-3xl md:text-5xl">
                {isShipping ? 'Política de Envíos' : 'Cambios y Devoluciones'}
              </h1>
           </div>

           <div className="space-y-8 text-stone-600 font-light leading-relaxed">
             {isShipping ? (
               <>
                 <p className="text-lg text-stone-800 font-normal">
                   En Espacios de Azúcar, tratamos la logística con el mismo cuidado que el diseño. Cada pieza es inspeccionada manualmente antes de salir de nuestro almacén.
                 </p>
                 
                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-3">Tiempos de Entrega</h3>
                   <ul className="list-disc pl-5 space-y-2">
                     <li><strong>Piezas en Stock (Herrajes y Decoración):</strong> 3 a 5 días hábiles en área metropolitana.</li>
                     <li><strong>Mobiliario Signature:</strong> 2 a 3 semanas. Estas piezas requieren un embalaje especial en cajas de madera para asegurar su integridad.</li>
                     <li><strong>Sistemas Arquitectónicos (A medida):</strong> 6 a 8 semanas, dependiendo de la complejidad de la fabricación.</li>
                   </ul>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-3">Costos</h3>
                   <p>Ofrecemos <strong>envío gratuito</strong> en todos los pedidos superiores a $5000. Para pedidos menores, se calcula una tarifa plana de $150 al finalizar la compra.</p>
                 </div>

                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-3">Entrega White Glove</h3>
                    <p>Para mobiliario de gran formato (Mesas de Travertino, Sofás), nuestro servicio incluye la subida al domicilio, desembalaje y retirada del material de protección. Por favor, verifica que los accesos (ascensores, puertas) permitan el paso de las piezas.</p>
                 </div>
               </>
             ) : (
               <>
                 <p className="text-lg text-stone-800 font-normal">
                   Queremos que ames tu espacio. Si una pieza no encaja con tu visión, estamos aquí para solucionarlo.
                 </p>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-3">Plazo de Devolución</h3>
                   <p>Aceptamos devoluciones de productos estándar dentro de los <strong>30 días naturales</strong> siguientes a la recepción del pedido.</p>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-3">Condiciones</h3>
                   <ul className="list-disc pl-5 space-y-2">
                     <li>El producto debe estar en su estado original, sin usar y en su embalaje original.</li>
                     <li>Los artículos hechos a medida (Puertas Horizon, Ventanales) no admiten devolución salvo defecto de fabricación.</li>
                     <li>Los costos de envío de la devolución corren por cuenta del cliente, salvo en caso de producto defectuoso.</li>
                   </ul>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-3">Proceso</h3>
                   <p>Para iniciar una devolución, contacta a nuestro equipo de conserjería en <strong>soporte@espaciosdeazucar.com</strong> con tu número de pedido. Organizaremos la recogida en tu domicilio.</p>
                 </div>

                 <div className="bg-stone-50 p-6 border border-stone-200 mt-8">
                   <p className="text-sm italic">
                     Nota: Las variaciones naturales en mármol, madera o latón no se consideran defectos. Son la garantía de que posees un material noble y auténtico.
                   </p>
                 </div>
               </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
