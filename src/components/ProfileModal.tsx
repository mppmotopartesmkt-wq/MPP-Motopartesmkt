import React, { useState } from 'react';
import { X, User, Shield, Check, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DocumentType } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdmin?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onNavigateToAdmin }) => {
  const { profile, loginAsDemoUser, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [docType, setDocType] = useState<DocumentType>(profile?.document_type || 'CC');
  const [docNumber, setDocNumber] = useState(profile?.document_number || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      phone,
      address,
      city,
      document_type: docType,
      document_number: docNumber,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-gray-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime/20 border border-lime flex items-center justify-center text-black font-bold">
              <User className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                PERFIL DE USUARIO
              </h2>
              <span className="text-[11px] text-gray-500 font-medium">
                Rol actual:{' '}
                <strong className={profile?.role === 'admin' ? 'text-black bg-lime/40 px-1.5 py-0.5 rounded text-[10px] font-black' : 'text-gray-900 font-bold'}>
                  {profile?.role?.toUpperCase()}
                </strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher (Admin / Customer) */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-700 font-bold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-black" />
            Simulador de Roles (RLS):
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => loginAsDemoUser('customer')}
              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                profile?.role === 'customer'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => loginAsDemoUser('admin')}
              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                profile?.role === 'admin'
                  ? 'bg-lime text-black font-black shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
              }`}
            >
              Administrador
            </button>
          </div>
        </div>

        {/* Admin Dashboard shortcut inside profile modal */}
        {profile?.role === 'admin' && onNavigateToAdmin && (
          <div className="bg-lime/10 border-b border-lime/30 p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">
              Tienes permisos de Administrador
            </span>
            <button
              onClick={() => {
                onClose();
                onNavigateToAdmin();
              }}
              className="bg-black hover:bg-gray-800 text-white font-black text-xs uppercase px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Abrir Panel Admin
            </button>
          </div>
        )}

        {/* Profile Info Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-500" /> Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-500" /> Correo Electrónico
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-gray-500" /> Tipo
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
              >
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="RUT">RUT</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 font-bold mb-1.5">
                Número de Documento
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all font-medium font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-500" /> Ciudad
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-500" /> Teléfono
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1.5">
              Dirección de Entrega
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-lime" />
                <span>¡DATOS GUARDADOS CON ÉXITO!</span>
              </>
            ) : (
              <span>GUARDAR DATOS</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
