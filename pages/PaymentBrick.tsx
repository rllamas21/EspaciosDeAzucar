import { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

interface PaymentBrickProps {
  orderTotal: number;
  orderId: string | number;
  clientId: string | number;
}

const PaymentBrick = ({ orderTotal, orderId, clientId }: PaymentBrickProps) => {

  useEffect(() => {
    // ⚠️ REEMPLAZA CON TU PUBLIC KEY DE PRODUCCIÓN (Empieza con APP_USR-...)
    initMercadoPago('APP_USR-tu-public-key-real-aqui', { locale: 'es-AR' });
  }, []);

  const initialization = {
    amount: Number(orderTotal),
    preferenceId: "<PREFERENCE_ID>", // Se deja así para Bricks
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
    visual: {
        style: {
            theme: 'default', 
        },
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise<void>((resolve, reject) => {
      fetch("https://yobel-admin-638148538936.us-east1.run.app/api/store/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, 
          orderId: orderId,
          clientId: clientId
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        resolve();
        
        if (data.status === 'approved') {
            // REDIRECCIÓN MANUAL
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else {
            // REDIRECCIÓN ERROR
            window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch((error) => {
        console.error(error);
        reject();
      });
    });
  };

  const onError = async (error: any) => {
    console.log("Error en Brick:", error);
  };

  const onReady = async () => {
    // El componente cargó
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200">
      <h3 className="text-lg font-serif mb-4 text-stone-700">Pago Seguro con Tarjeta</h3>
      <div className="opacity-95">
        <Payment
          initialization={initialization}
          customization={customization as any} 
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
        />
      </div>
    </div>
  );
};

export default PaymentBrick;