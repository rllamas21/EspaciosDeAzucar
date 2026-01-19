import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Address } from '../types';
import { MapPin, Plus, Trash2, Check, Loader2, Home, Briefcase } from 'lucide-react';

interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  selectedAddressId?: number;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onSelect, selectedAddressId }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulario vacío
  const [newAddress, setNewAddress] = useState({
    alias: 'Casa',
    recipient_name: '',
    street: '',
    number: '',
    floor_apt: '',
    city: '',
    zip_code: '',
    province: 'Buenos Aires',
    phone: ''
  });

  // 1. CARGAR DIRECCIONES AL INICIAR
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/store/addresses');
      setAddresses(data);
      
      // Si hay direcciones y ninguna seleccionada, autoseleccionamos la default o la primera
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

  // 2. GUARDAR NUEVA DIRECCIÓN
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/api/store/addresses', {
        ...newAddress,
        is_default: addresses.length === 0 // Si es la primera, es default automático
      });
      
      // Recargamos lista y seleccionamos la nueva
      await fetchAddresses();
      onSelect(data); 
      setShowForm(false);
      // Limpiamos form
      setNewAddress({ ...newAddress, street: '', number: '', recipient_name: '', phone: '' });
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Hubo un error al guardar la dirección. Revisa los datos.");
    } finally {
      setSaving(false);
    }
  };

  // 3. BORRAR DIRECCIÓN
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Para que no seleccione la tarjeta al borrar
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
            className={`cursor-pointer border rounded p-4 transition-all relative group ${selectedAddressId === addr.id ? 'border-stone-800 bg-stone-50 ring-1 ring-stone-800' : 'border-stone-200 hover:border-stone-400'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {addr.alias === 'Trabajo' ? <Briefcase className="w-4 h-4 text-stone-500"/> : <Home className="w-4 h-4 text-stone-500"/>}
                <span className="font-bold text-sm uppercase tracking-wide text-stone-800">{addr.alias}</span>
                {addr.is_default && <span className="text-[9px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-600 font-bold">DEFAULT</span>}
              </div>
              {selectedAddressId === addr.id && <div className="bg-stone-900 text-white rounded-full p-0.5"><Check className="w-3 h-3"/></div>}
            </div>
            
            <p className="text-sm text-stone-600 font-medium">{addr.street} {addr.number}</p>
            <p className="text-xs text-stone-500">{addr.city}, {addr.province} ({addr.zip_code})</p>
            <p className="text-xs text-stone-400 mt-1">Recibe: {addr.recipient_name}</p>

            <button 
              onClick={(e) => handleDelete(addr.id, e)}
              className="absolute bottom-3 right-3 p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
              title="Eliminar dirección"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* BOTÓN AGREGAR (Si no hay formulario abierto) */}
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

      {/* FORMULARIO INTEGRADO */}
      {showForm && (
        <div className="bg-white border border-stone-200 rounded p-5 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-serif text-lg mb-4 text-stone-800">Nueva Dirección</h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input 
                placeholder="Alias (Ej: Casa)" 
                className="input-base"
                value={newAddress.alias}
                onChange={e => setNewAddress({...newAddress, alias: e.target.value})}
              />
              <input 
                placeholder="Quién recibe" 
                className="input-base"
                required
                value={newAddress.recipient_name}
                onChange={e => setNewAddress({...newAddress, recipient_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input 
                placeholder="Calle" 
                className="input-base col-span-2"
                required
                value={newAddress.street}
                onChange={e => setNewAddress({...newAddress, street: e.target.value})}
              />
              <input 
                placeholder="Número" 
                className="input-base"
                required
                value={newAddress.number}
                onChange={e => setNewAddress({...newAddress, number: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                placeholder="Ciudad" 
                className="input-base"
                required
                value={newAddress.city}
                onChange={e => setNewAddress({...newAddress, city: e.target.value})}
              />
              <input 
                placeholder="C. Postal" 
                className="input-base"
                required
                value={newAddress.zip_code}
                onChange={e => setNewAddress({...newAddress, zip_code: e.target.value})}
              />
            </div>
             <div className="grid grid-cols-2 gap-3">
              <select 
                 className="input-base bg-white" 
                 value={newAddress.province}
                 onChange={e => setNewAddress({...newAddress, province: e.target.value})}
              >
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="CABA">CABA</option>
                  <option value="Cordoba">Córdoba</option>
                  <option value="Santa Fe">Santa Fe</option>
                  {/* Agrega más si necesitas */}
              </select>
               <input 
                placeholder="Teléfono" 
                className="input-base"
                required
                value={newAddress.phone}
                onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold uppercase text-stone-500 hover:text-stone-800"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-2 bg-stone-900 text-white text-xs font-bold uppercase rounded hover:bg-stone-800 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Dirección'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`.input-base { width: 100%; padding: 10px; font-size: 14px; border: 1px solid #e7e5e4; border-radius: 4px; outline: none; transition: all 0.2s; } .input-base:focus { border-color: #1c1917; box-shadow: 0 0 0 1px #1c1917; }`}</style>
    </div>
  );
};

export default AddressSelector;