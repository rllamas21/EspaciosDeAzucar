import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';

interface PaymentBrickProps {
  orderTotal: number;
  orderId: string | number;
  clientId: string | number;
}

const PaymentBrick = ({ orderTotal, orderId, clientId }: PaymentBrickProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
    if (publicKey) {
      // locale es-AR es vital para que reconozca tarjetas locales
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setReady(true);
    }
  }, []);

  const initialization = {
    amount: Number(orderTotal),
    payer: {
      email: 'comprador_final@gmail.com', // Usa un email real o este genérico
    },
  };

  const customization = {
    paymentMethods: {
      // 🚨 ATENCIÓN: Eliminamos "all". 
      // Al NO declarar tipos, el SDK deja de filtrar localmente y 
      // permite que el backend sea el que decida. Esto evita el error al escribir.
      maxInstallments: 12, 
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
          orderId,
          clientId
        }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'approved') {
          resolve();
          window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else {
          resolve();
          window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch(() => reject());
    });
  };

  if (!ready) return <Loader2 className="animate-spin" />;

  return (
    <Payment
      initialization={initialization}
      customization={customization as any}
      onSubmit={onSubmit}
      // Forzamos que ignore errores no críticos de validación visual
      onError={(err) => console.log("SDK LOG:", err)}
    />
  );
};

export default PaymentBrick;