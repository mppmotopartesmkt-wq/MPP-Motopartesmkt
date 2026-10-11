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
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-dark-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-lime/20 border border-lime flex items-center justify-center text-lime font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                PERFIL DE USUARIO
              </h2>
              <span className="text-[11px] text-gray-400">
                Rol actual:{' '}
                <strong className={profile?.role === 'admin' ? 'text-lime' : 'text-sky-400'}>
                  {profile?.role?.toUpperCase()}
                </strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher (Admin / Customer) */}
        <div className="bg-dark-950 p-4 border-b border-dark-800 flex items-center justify-between">
          <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-lime" />
            Simulador de Roles (RLS):
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => loginAsDemoUser('customer')}
              className={`text-[11px] font-bold px-3 py-1 rounded transition-colors ${
                profile?.role === 'customer'
                  ? 'bg-sky-500 text-black'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => loginAsDemoUser('admin')}
              className={`text-[11px] font-bold px-3 py-1 rounded transition-colors ${
                profile?.role === 'admin'
                  ? 'bg-lime text-black'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              Administrador
            </button>
          </div>
        </div>

        {/* Admin Dashboard shortcut inside profile modal */}
        {profile?.role === 'admin' && onNavigateToAdmin && (
          <div className="bg-lime/10 border-b border-lime/30 p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-lime">
              Tienes permisos de Administrador
            </span>
            <button
              onClick={() => {
                onClose();
                onNavigateToAdmin();
              }}
              className="bg-lime hover:bg-lime-bright text-black font-black text-xs uppercase px-3 py-1.5 rounded transition-colors shadow-sm"
            >
              Abrir Panel Admin
            </button>
          </div>
        )}

        {/* Profile Info Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-lime" /> Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-lime" /> Correo Electrónico
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full bg-dark-950/50 border border-dark-800 rounded px-3 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-gray-400 font-semibold mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-lime" /> Tipo
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-dark-950 border border-dark-700 rounded px-2 py-2 text-white focus:outline-none focus:border-lime"
              >
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="RUT">RUT</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-400 font-semibold mb-1">
                Número de Documento
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-400 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-lime" /> Ciudad
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-lime" /> Teléfono
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">
              Dirección de Entrega
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-dark-950 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-lime"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-lime hover:bg-lime-bright text-black font-black py-2.5 rounded text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>¡GUARDADO CON ÉXITO!</span>
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
