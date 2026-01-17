import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { MapPin, Heart, Eye, Phone, Link as LinkIcon, ChevronLeft, ChevronRight, Trash2 } from './Icons';
import { showSuccess, showError } from '../src/utils/toast'; // Import toast utilities

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  isClientView?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onDelete, isClientView }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const pricePerMeter = Math.round(property.price / (property.category === 'land' ? property.landArea || 1 : property.totalArea));

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev: number) => (prev + 1) % property.imageUrls.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev: number) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length);
  };

  const generateClientLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientUrl = `${window.location.origin}/property/${property.id}?clientMode=true`;

    try {
      // Update the property in the database with the generated public link
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...property, publicLink: clientUrl }), // Save the generated link
      });

      if (!response.ok) {
        throw new Error('Failed to save public link to database');
      }

      await navigator.clipboard.writeText(clientUrl);
      showSuccess('Ссылка для клиента скопирована и сохранена!');
    } catch (error) {
      console.error("Error generating or saving client link:", error);
      showError('Ошибка при создании или сохранении ссылки для клиента.');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-slate-100 flex flex-col h-full">
      <div className="h-72 relative overflow-hidden shrink-0">
        <img 
          src={property.imageUrls[currentImg] || 'https://via.placeholder.com/800x600?text=No+Image'} 
          alt={property.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {property.imageUrls.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/50 backdrop-blur-md p-2 rounded-full text-white transition opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/50 backdrop-blur-md p-2 rounded-full text-white transition opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.imageUrls.map((_: string, i: number) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === currentImg ? 'w-4 bg-white' : 'w-1 bg-white/50'}`}></div>
              ))}
            </div>
          </>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-12">
          {property.isEOselya && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">єОселя</span>
          )}
          <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            {property.category === 'land' ? 'Участок' : property.type === 'New Build' ? 'Новостройка' : 'Вторичка'}
          </span>
          {property.hasRepair && property.repairType !== 'Без ремонта' && (
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
              {property.repairType}
            </span>
          )}
        </div>
        
        <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2.5 rounded-xl text-white transition">
          <Heart className="w-4 h-4" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="text-white">
            <h3 className="text-2xl font-[900]">${property.price.toLocaleString()}</h3>
            <p className="text-white/80 font-bold text-[10px] uppercase tracking-tighter">
              ${pricePerMeter.toLocaleString()} / {property.category === 'land' ? 'сот' : 'м²'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="space-y-4 flex-grow mb-6">
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-xs uppercase tracking-wider text-slate-400">{property.district}</p>
              <p className="font-bold text-sm truncate">{property.address}</p>
            </div>
          </div>
          
          {!isClientView && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 rounded-xl p-3">
              <Phone className="w-4 h-4" />
              <span className="font-black text-xs tracking-wider">{property.ownerPhone}</span>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-4">
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Комнат</p>
              <p className="font-black text-slate-800 text-base">{property.category === 'land' ? '—' : property.rooms}</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Площадь</p>
              <p className="font-black text-slate-800 text-base">
                {property.category === 'land' ? property.landArea : property.totalArea} {property.category === 'land' ? 'сот' : 'м²'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Этаж</p>
              <p className="font-black text-slate-800 text-base">
                {property.floor ? `${property.floor}/${property.totalFloors || '?'}` : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
          <div className="flex gap-2 w-full">
            {!isClientView && onEdit ? (
              <button 
                onClick={() => onEdit(property)}
                className="flex-grow bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                Редактировать
              </button>
            ) : (
              <button className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                Связаться
              </button>
            )}
            <Link 
              to={`/property/${property.id}${isClientView ? '?clientMode=true' : ''}`}
              className="w-12 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all flex items-center justify-center"
            >
              <Eye className="w-5 h-5" />
            </Link>
            {!isClientView && onDelete && (
              <button 
                onClick={() => onDelete(property.id)}
                className="w-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {!isClientView && (
            <button 
              onClick={generateClientLink}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition"
            >
              <LinkIcon className="w-3 h-3" /> Ссылка для клиента
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;