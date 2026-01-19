import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Address } from '../types';
import { MapPin, Plus, Trash2, Check, Loader2, Home, Briefcase } from 'lucide-react';

// LISTA OFICIAL DE PROVINCIAS ARGENTINAS
const ARGENTINE_PROVINCES = [
  "Buenos Aires",
  "Capital Federal (CABA)",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
];

interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  selectedAddressId?: number;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onSelect, selectedAddressId }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulario vacío (Alias ahora empieza vacío)
  const [newAddress, setNewAddress] = useState({
    alias: '', 
    recipient_name: '',
    street: '',
    number: '',
    floor_apt: '',
    city: '',
    zip_code: '',
    province: '', // Obligaremos a elegir una
    phone: ''
  });

  // 1. CARGAR DIRECCIONES
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/store/addresses');
      setAddresses(data);
      
      if (data.length > 0 && !selectedAddressId) {
        const defaultAddr = data.find((a: Address) => a.is_default) || data[0];
        onSelect(defaultAddr);
      }
    } catch (error) {
      console.error("Error cargando direcciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 2. GUARDAR
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple
    if (!newAddress.province) {
      alert("Por favor selecciona una provincia.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/api/store/addresses', {
        ...newAddress,
        alias: newAddress.alias || 'Mi Dirección', // Si lo dejan vacío, ponemos un default genérico
        is_default: addresses.length === 0
      });
      
      await fetchAddresses();
      onSelect(data); 
      setShowForm(false);
      // Reset form
      setNewAddress({ 
        alias: '', recipient_name: '', street: '', number: '', floor_apt: '', 
        city: '', zip_code: '', province: '', phone: '' 
      });
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Hubo un error al guardar. Revisa los datos.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Seguro que quieres borrar esta dirección?")) return;
    try {
      await api.delete(`/api/store/addresses/${id}`);
      fetchAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400"/></div>;

  return (
    <div className="space-y-4">
      
      {/* LISTA DE TARJETAS */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {addresses.map((addr) => (
          <div 
            key={addr.id}
            onClick={() => onSelect(addr)}
            className={`cursor-pointer border rounded p-4 transition-all relative group ${selectedAddressId === addr.id ? 'border-stone-500 bg-stone-50 ring-1 ring-stone-500' : 'border-stone-200 hover:border-stone-300'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-500"/>
                <span className="font-bold text-sm uppercase tracking-wide text-stone-800">{addr.alias}</span>
                {addr.is_default && <span className="text-[9px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-600 font-bold">DEFAULT</span>}
              </div>
              {selectedAddressId === addr.id && <div className="text-stone-800"><Check className="w-4 h-4"/></div>}
            </div>
            
            <p className="text-sm text-stone-600 font-medium">{addr.street} {addr.number} {addr.floor_apt}</p>
            <p className="text-xs text-stone-500">{addr.city}, {addr.province} ({addr.zip_code})</p>
            <p className="text-xs text-stone-400 mt-1">Recibe: {addr.recipient_name}</p>

            <button 
              onClick={(e) => handleDelete(addr.id, e)}
              className="absolute bottom-3 right-3 p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="border border-dashed border-stone-300 rounded p-4 flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-600 hover:border-stone-400 hover:bg-stone-50 transition-all min-h-[120px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">Nueva Dirección</span>
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="bg-white border border-stone-200 rounded p-5 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-serif text-lg mb-4 text-stone-800">Nueva Dirección</h4>
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <input 
                placeholder="Alias (Ej: Casa, Oficina)" 
                className="input-delicate"
                value={newAddress.alias}
                onChange={e => setNewAddress({...newAddress, alias: e.target.value})}
              />
              <input 
                placeholder="Quién recibe (Nombre y Apellido)" 
                className="input-delicate"
                required
                value={newAddress.recipient_name}
                onChange={e => setNewAddress({...newAddress, recipient_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input 
                placeholder="Calle / Avenida" 
                className="input-delicate col-span-2"
                required
                value={newAddress.street}
                onChange={e => setNewAddress({...newAddress, street: e.target.value})}
              />
              <input 
                placeholder="Altura" 
                className="input-delicate"
                required
                value={newAddress.number}
                onChange={e => setNewAddress({...newAddress, number: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
               <input 
                placeholder="Piso / Depto (Opcional)" 
                className="input-delicate"
                value={newAddress.floor_apt}
                onChange={e => setNewAddress({...newAddress, floor_apt: e.target.value})}
              />
              <input 
                placeholder="Ciudad / Barrio" 
                className="input-delicate"
                required
                value={newAddress.city}
                onChange={e => setNewAddress({...newAddress, city: e.target.value})}
              />
              <input 
                placeholder="C. Postal" 
                className="input-delicate"
                required
                value={newAddress.zip_code}
                onChange={e => setNewAddress({...newAddress, zip_code: e.target.value})}
              />
            </div>

             <div className="grid grid-cols-2 gap-3">
              {/* SELECT DE PROVINCIAS COMPLETO */}
              <div className="relative">
                <select 
                   className="input-delicate appearance-none bg-white" 
                   value={newAddress.province}
                   onChange={e => setNewAddress({...newAddress, province: e.target.value})}
                   required
                >
                    <option value="" disabled>Selecciona Provincia</option>
                    {ARGENTINE_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

               <input 
                placeholder="Teléfono de contacto" 
                className="input-delicate"
                required
                type="tel"
                value={newAddress.phone}
                onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 mt-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold uppercase text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-2 bg-stone-900 text-white text-xs font-bold uppercase rounded-sm hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Guardando...' : 'Guardar Dirección'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ESTILOS DELICADOS (Focus Gris Suave, Borde Fino) */}
      <style>{`
        .input-delicate { 
          width: 100%; 
          padding: 10px 12px; 
          font-size: 14px; 
          border: 1px solid #e7e5e4; /* Stone-200 */
          border-radius: 4px; 
          outline: none; 
          transition: all 0.2s ease-in-out;
          color: #1c1917; /* Stone-900 */
        } 
        .input-delicate:placeholder {
          color: #a8a29e; /* Stone-400 */
        }
        .input-delicate:focus { 
          border-color: #a8a29e; /* Stone-400 (Más oscuro que el borde normal, pero suave) */
          box-shadow: 0 0 0 1px #a8a29e; /* Ring fino y sutil */
        }
      `}</style>
    </div>
  );
};

export default AddressSelector;