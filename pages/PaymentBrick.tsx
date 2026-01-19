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
      email: 'test_user_123@testuser.com', // Opcional: Ayuda a pre-llenar si tienes el email del usuario
    },
  };

  const customization = {
    paymentMethods: {
      // ✅ CORRECCIÓN TÉCNICA:
      // Eliminé "mercadoPago: 'all'" porque esa propiedad NO existe aquí y rompía la validación de tarjetas.
      ticket: [], 
      bankTransfer: [], 
      creditCard: "all",
      debitCard: "all",
      maxInstallments: 12
    },
    visual: {
        style: {
            theme: 'flat', // 'flat' es el más limpio
            customVariables: {
                textPrimaryColor: '#1c1917',
                textSecondaryColor: '#57534e', 
                inputBackgroundColor: '#ffffff',
                formBackgroundColor: '#ffffff', // Fondo blanco para fundirse con tu contenedor
                baseColor: '#1c1917',
                borderRadius: '6px',
                successColor: '#16a34a',
                warningColor: '#eab308',
                errorColor: '#dc2626',
            }
        },
        texts: {
            // ✅ CORRECCIÓN VISUAL: 
            // Ponemos el título en null o vacío para que no salga "Pagar con Tarjeta" dentro del brick.
            // Ya tienes el título "Método de Pago" afuera, así se ve más limpio.
            formTitle: "default", 
        },
        hidePaymentButton: false, 
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
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else {
            window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch((error) => {
        console.error("Error procesando el pago:", error);
        reject();
      });
    });
  };

  const onError = async (error: any) => {
    console.log("Error en Brick:", error);
  };

  const onReady = async () => {
    // Componente listo
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
      {/* Eliminamos opacidad para que se vea nítido */}
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