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
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setReady(true);
    } else {
      console.error("❌ ERROR CRÍTICO: No se encontró VITE_MP_PUBLIC_KEY");
    }
  }, []);

  const initialization = {
    amount: Number(orderTotal),
    payer: {
      email: 'test_user_1954@testuser.com', // Email recomendado para pruebas (Sandbox)
    },
  };

  const customization = {
    paymentMethods: {
      // 📘 SEGÚN DOCUMENTACIÓN:
      // Solo definimos lo que queremos controlar. 
      // Eliminamos 'ticket', 'bankTransfer' y 'mercadoPago' para evitar conflictos.
      // Al no ponerlos, el Brick prioriza Tarjetas si 'creditCard' está en 'all'.
      creditCard: "all",
      debitCard: "all",
      maxInstallments: 12
    },
    visual: {
        style: {
            theme: 'flat', // Tema plano y moderno
            customVariables: {
                formBackgroundColor: '#ffffff', // Fondo blanco puro
                baseColor: '#1c1917', // Tu color Stone-900
                borderRadius: '6px',
                successColor: '#16a34a',
                warningColor: '#eab308',
                errorColor: '#dc2626',
            }
        },
        texts: {
            formTitle: "default", // Mantenemos default para evitar duplicidad visual
        },
        hidePaymentButton: false,
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    // IMPORTANTE: Retornar la promesa para que el botón de carga funcione nativamente
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
        resolve(); // Avisamos al Brick que terminó el proceso
        if (data.status === 'approved') {
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else {
            window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch((error) => {
        console.error("Error procesando el pago:", error);
        reject(); // Avisamos al Brick que hubo error
      });
    });
  };

  const onError = async (error: any) => {
    console.log("Error en Brick:", error);
  };

  const onReady = async () => {
    // El brick cargó correctamente
  };

  if (!ready) {
    return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <Payment
        initialization={initialization}
        customization={customization as any} 
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
};

export default PaymentBrick;