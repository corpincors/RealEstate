import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property } from '../../types';
import { 
  MapPin, Phone, Heart, Share2, ChevronLeft, ChevronRight, Layers 
} from '../../components/Icons';
import { 
  CATEGORIES
} from '../../constants';

interface PropertyDetailPageProps {
  properties: Property[];
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ properties }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [isClientView, setIsClientView] = useState(false);

  useEffect(() => {
    const foundProperty = properties.find((p: Property) => p.id === id);
    setProperty(foundProperty || null);

    const params = new URLSearchParams(window.location.search);
    setIsClientView(params.get('clientMode') === 'true');
  }, [id, properties]);

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center text-slate-500">
        Объект не найден.
        {/* Кнопка 'Вернуться к списку' удалена */}
      </div>
    );
  }

  const pricePerMeter = Math.round(property.price / (property.category === 'land' ? property.landArea || 1 : property.totalArea));
  const categoryLabel = CATEGORIES.find(cat => cat.id === property.category)?.label || property.category;

  const nextImg = () => {
    setCurrentImg((prev: number) => (prev + 1) % property.imageUrls.length);
  };

  const prevImg = () => {
    setCurrentImg((prev: number) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length);
  };

  const getCategoryDisplay = () => {
    if (property.category === 'land') return 'Участок';
    if (property.category === 'houses') return property.houseSubtype || 'Дома';
    if (property.type === 'New Build') return 'Новостройка';
    return 'Вторичка';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Назад</span>
        </button>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition text-slate-500">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition text-slate-500">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-slate-100 p-8 lg:p-12">
        {/* Image Gallery */}
        <div className="relative h-[500px] rounded-3xl overflow-hidden mb-10">
          <img 
            src={property.imageUrls[currentImg] || 'https://via.placeholder.com/1200x800?text=No+Image'} 
            alt={property.address}
            className="w-full h-full object-cover"
          />
          {property.imageUrls.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/50 backdrop-blur-md p-3 rounded-full text-white transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/50 backdrop-blur-md p-3 rounded-full text-white transition">
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {property.imageUrls.map((_: string, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImg ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}></div>
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
            <div>
              <h1 className="text-4xl font-[900]">${property.price.toLocaleString()}</h1>
              <p className="text-white/80 font-bold text-sm uppercase tracking-tighter">
                ${pricePerMeter.toLocaleString()} / {property.category === 'land' ? 'сот' : 'м²'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {property.isEOselya && (
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">єОселя</span>
              )}
              <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {getCategoryDisplay()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-[900] text-slate-900">{property.address}</h2>
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin className="w-5 h-5 text-blue-500" />
              <p className="font-black text-sm uppercase tracking-wider text-slate-400">{property.district}</p>
            </div>
            {!isClientView && (
              <div className="flex items-center gap-3 text-blue-600 bg-blue-50 rounded-xl p-4">
                <Phone className="w-5 h-5" />
                <span className="font-black text-sm tracking-wider">{property.ownerPhone}</span>
              </div>
            )}
            <p className="text-slate-700 leading-relaxed break-words">{property.description}</p>
          </div>
          <div className="lg:col-span-1 bg-slate-50 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Основные характеристики</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-700">
              <li className="flex justify-between"><span>Категория:</span> <span className="font-semibold">{categoryLabel}</span></li>
              {property.category === 'houses' && (
                <>
                  <li className="flex justify-between"><span>Тип дома:</span> <span className="font-semibold">{property.houseSubtype || '—'}</span></li>
                  <li className="flex justify-between">
                    <span>Расположение:</span> 
                    <span className="font-semibold">
                      {property.locationType === 'inCity' ? 'В городе' : 
                       property.locationType === 'outsideCity' && property.distanceFromCityKm !== undefined ? `${property.distanceFromCityKm} км от города` : '—'}
                    </span>
                  </li>
                  {property.plotArea !== undefined && <li className="flex justify-between"><span>Площадь участка:</span> <span className="font-semibold">{property.plotArea} сот.</span></li>}
                  {property.cadastralNumber && <li className="flex justify-between"><span>Кадастровый номер:</span> <span className="font-semibold">{property.cadastralNumber}</span></li>}
                </>
              )}
              {property.category !== 'land' && (
                <>
                  <li className="flex justify-between"><span>Тип:</span> <span className="font-semibold">{property.type}</span></li>
                  <li className="flex justify-between"><span>Комнат:</span> <span className="font-semibold">{property.rooms}</span></li>
                  <li className="flex justify-between"><span>Этаж:</span> <span className="font-semibold">{property.floor || '—'} / {property.totalFloors || '—'}</span></li>
                  <li className="flex justify-between"><span>Общая площадь:</span> <span className="font-semibold">{property.totalArea} м²</span></li>
                  <li className="flex justify-between"><span>Площадь кухни:</span> <span className="font-semibold">{property.kitchenArea || '—'} м²</span></li>
                  {/* <li className="flex justify-between"><span>Тип дома:</span> <span className="font-semibold">{property.houseType}</span></li> */} {/* Удалено */}
                  <li className="flex justify-between"><span>Класс жилья:</span> <span className="font-semibold">{property.housingClass}</span></li>
                  <li className="flex justify-between"><span>Ремонт:</span> <span className="font-semibold">{property.hasRepair ? property.repairType : 'Без ремонта'}</span></li>
                  <li className="flex justify-between"><span>Отопление:</span> <span className="font-semibold">{property.heating}</span></li>
                  <li className="flex justify-between"><span>Меблировка:</span> <span className="font-semibold">{property.hasFurniture ? 'Да' : 'Нет'}</span></li>
                  {property.yearBuilt && <li className="flex justify-between"><span>Год постройки/сдачи:</span> <span className="font-semibold">{property.yearBuilt}</span></li>}
                  {property.wallType && <li className="flex justify-between"><span>Тип стен:</span> <span className="font-semibold">{property.wallType}</span></li>}
                </>
              )}
              {property.category === 'land' && (
                <>
                  <li className="flex justify-between"><span>Площадь земли:</span> <span className="font-semibold">{property.landArea} сот.</span></li>
                  <li className="flex justify-between"><span>Тип земли:</span> <span className="font-semibold">{property.landType}</span></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-10">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="bg-emerald-50 p-2 rounded-xl"><Layers className="w-5 h-5" /></div>
            <h3 className="text-sm font-black uppercase tracking-widest">Дополнительные опции</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {property.tech && property.tech.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Бытовая техника:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {property.tech.map((item: string) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            )}
            {property.comfort && property.comfort.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Комфорт:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {property.comfort.map((item: string) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            )}
            {property.comm && property.comm.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Коммуникации:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {property.comm.map((item: string) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            )}
            {property.infra && property.infra.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Инфраструктура:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {property.infra.map((item: string) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;