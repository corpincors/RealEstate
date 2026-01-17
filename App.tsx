import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Property, FilterState, PropertyCategory } from './types';
import { 
  INITIAL_PROPERTIES, DISTRICTS, ROOMS_OPTIONS, LAND_TYPES, HOUSE_TYPES, 
  REPAIR_TYPES, HOUSING_CLASSES, HEATING_OPTIONS, TECH_OPTIONS, COMFORT_OPTIONS, 
  COMM_OPTIONS, INFRA_OPTIONS, CATEGORIES 
} from './constants.tsx';
import { PlusCircle, Search, Plus, Home, ChevronDown, X } from './components/Icons';
import PropertyCard from './components/PropertyCard';
import PropertyFormModal from './components/PropertyFormModal';
import MultiSelect from './components/MultiSelect';
import PropertyDetailPage from './src/pages/PropertyDetailPage';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isClientMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('clientMode') === 'true';
  }, [location.search]);

  const isDetailPage = useMemo(() => location.pathname.startsWith('/property/'), [location.pathname]);

  const availableDistricts = useMemo(() => {
    const propertyDistricts = properties.map(p => p.district);
    const combined = [...DISTRICTS, ...propertyDistricts];
    return Array.from(new Set(combined.filter(d => d.trim() !== ''))).sort();
  }, [properties]);

  const [filters, setFilters] = useState<FilterState>({
    category: 'apartments',
    district: 'Любой',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    minKitchenArea: '',
    maxKitchenArea: '',
    minFloor: '',
    maxFloor: '',
    minTotalFloors: '',
    maxTotalFloors: '',
    rooms: 'Любое',
    type: 'Любой',
    houseType: 'Любой',
    housingClass: 'Любой',
    hasFurniture: null,
    hasRepair: null,
    repairType: 'Любой',
    heating: 'Любой',
    isEOselya: null,
    landType: 'Любой',
    minLandArea: '',
    maxLandArea: '',
    tech: [],
    comfort: [],
    comm: [],
    infra: [],
    keywords: '',
  });

  const filteredProperties = useMemo(() => {
    const lowerCaseKeywords = filters.keywords.toLowerCase();

    return properties.filter(p => {
      if (p.category !== filters.category) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.district !== 'Любой' && p.district !== filters.district) return false;

      // Фильтрация по ключевым словам
      if (lowerCaseKeywords) {
        const matchesAddress = p.address.toLowerCase().includes(lowerCaseKeywords);
        const matchesDescription = p.description.toLowerCase().includes(lowerCaseKeywords);
        const matchesOwnerPhone = p.ownerPhone.toLowerCase().includes(lowerCaseKeywords); // Добавлена проверка номера телефона
        if (!matchesAddress && !matchesDescription && !matchesOwnerPhone) return false;
      }

      if (filters.category === 'land') {
        if (filters.minLandArea && (p.landArea || 0) < Number(filters.minLandArea)) return false;
        if (filters.maxLandArea && (p.landArea || 0) > Number(filters.maxLandArea)) return false;
        if (filters.landType !== 'Любой' && p.landType !== filters.landType) return false;
      } else {
        if (filters.type !== 'Любой' && p.type !== filters.type) return false;
        if (filters.minFloor && (p.floor || 0) < Number(filters.minFloor)) return false;
        if (filters.maxFloor && (p.floor || 0) > Number(filters.maxFloor)) return false;
        if (filters.minTotalFloors && (p.totalFloors || 0) < Number(filters.minTotalFloors)) return false;
        if (filters.maxTotalFloors && (p.totalFloors || 0) > Number(filters.maxTotalFloors)) return false;
        if (filters.rooms !== 'Любое' && p.rooms !== filters.rooms) return false;
        if (filters.minArea && p.totalArea < Number(filters.minArea)) return false;
        if (filters.maxArea && p.totalArea > Number(filters.maxArea)) return false;
        if (filters.minKitchenArea && (p.kitchenArea || 0) < Number(filters.minKitchenArea)) return false;
        if (filters.maxKitchenArea && (p.kitchenArea || 0) > Number(filters.maxKitchenArea)) return false;
        if (filters.houseType !== 'Любой' && p.houseType !== filters.houseType) return false;
        if (filters.housingClass !== 'Любой' && p.housingClass !== filters.housingClass) return false;
        if (filters.hasFurniture !== null && p.hasFurniture !== filters.hasFurniture) return false;
        if (filters.hasRepair !== null && p.hasRepair !== filters.hasRepair) return false;
        if (filters.repairType !== 'Любой' && p.repairType !== filters.repairType) return false;
        if (filters.heating !== 'Любой' && p.heating !== filters.heating) return false;
        if (filters.isEOselya !== null && p.isEOselya !== filters.isEOselya) return false;

        if (filters.tech.length > 0 && !filters.tech.every(f => p.tech.includes(f))) return false;
        if (filters.comfort.length > 0 && !filters.comfort.every(f => p.comfort.includes(f))) return false;
        if (filters.comm.length > 0 && !filters.comm.every(f => p.comm.includes(f))) return false;
        if (filters.infra.length > 0 && !filters.infra.every(f => p.infra.includes(f))) return false;
      }

      return true;
    });
  }, [properties, filters]);

  const handleSaveProperty = (property: Property) => {
    setProperties(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.map(p => p.id === property.id ? property : p);
      }
      return [property, ...prev];
    });
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const resetFilters = () => {
    setFilters({
      category: filters.category,
      district: 'Любой',
      minPrice: '', maxPrice: '', minArea: '', maxArea: '', minKitchenArea: '', maxKitchenArea: '',
      minFloor: '', maxFloor: '', minTotalFloors: '', maxTotalFloors: '',
      rooms: 'Любое', type: 'Любой', houseType: 'Любой', housingClass: 'Любой',
      hasFurniture: null, hasRepair: null, repairType: 'Любой', heating: 'Любой',
      isEOselya: null, landType: 'Любой', minLandArea: '', maxLandArea: '',
      tech: [], comfort: [], comm: [], infra: [],
      keywords: '',
    });
  };

  const isLand = filters.category === 'land';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
            <Home className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">
              {isClientMode ? 'Real Estate Catalog' : 'Realty CRM'}
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              {isClientMode ? 'Client Portfolio' : 'Expert Management'}
            </p>
          </div>
        </div>
        {!isClientMode && !isDetailPage && (
          <button 
            onClick={() => { setEditingProperty(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Добавить объект
          </button>
        )}
        {isClientMode && !isDetailPage && ( 
          <button 
            onClick={() => {
              navigate('/');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs"
          >
            Вернуться в CRM
          </button>
        )}
      </header>

      <Routes>
        <Route path="/" element={
          <>
            {!isDetailPage && (
              <section className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-sm border border-slate-50 mb-12">
                <div className="grid grid-cols-1 gap-12">
                  {/* Ключевые слова - перемещено сюда */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ключевые слова</label>
                    <input 
                      type="text" 
                      placeholder="Поиск по адресу, описанию, телефону..." 
                      value={filters.keywords} 
                      onChange={(e) => setFilters({...filters, keywords: e.target.value})} 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold outline-none transition" 
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3 p-1.5 bg-slate-50 rounded-[2rem] w-fit">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setFilters(prev => ({ ...prev, category: cat.id as PropertyCategory }))}
                        className={`px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                          filters.category === cat.id ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Район</label>
                      <select 
                        value={filters.district}
                        onChange={(e) => setFilters({...filters, district: e.target.value})}
                        className="w-full bg-slate-50 border-transparent focus:border-blue-500 border-2 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                      >
                        <option value="Любой">Любой район</option>
                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Бюджет ($)</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="От" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                        <input type="number" placeholder="До" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                      </div>
                    </div>

                    {/* Старое место для ключевых слов, теперь пусто */}
                    <div className="lg:col-span-2"></div> 

                    {isLand ? (
                      <>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Площадь земли (сот.)</label>
                          <div className="flex gap-2">
                            <input type="number" placeholder="От" value={filters.minLandArea} onChange={(e) => setFilters({...filters, minLandArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                            <input type="number" placeholder="До" value={filters.maxLandArea} onChange={(e) => setFilters({...filters, maxLandArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Тип земли</label>
                          <select 
                            value={filters.landType}
                            onChange={(e) => setFilters({...filters, landType: e.target.value})}
                            className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold"
                          >
                            <option value="Любой">Любой тип</option>
                            {LAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Комнат</label>
                          <select 
                            value={filters.rooms}
                            onChange={(e) => setFilters({...filters, rooms: e.target.value})}
                            className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold"
                          >
                            <option value="Любое">Любое</option>
                            {ROOMS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Этаж (от/до)</label>
                          <div className="flex gap-2">
                            <input type="number" placeholder="Мин" value={filters.minFloor} onChange={(e) => setFilters({...filters, minFloor: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                            <input type="number" placeholder="Макс" value={filters.maxFloor} onChange={(e) => setFilters({...filters, maxFloor: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Общая пл. (м²)</label>
                          <div className="flex gap-2">
                            <input type="number" placeholder="От" value={filters.minArea} onChange={(e) => setFilters({...filters, minArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                            <input type="number" placeholder="До" value={filters.maxArea} onChange={(e) => setFilters({...filters, maxArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Пл. кухни (м²)</label>
                          <div className="flex gap-2">
                            <input type="number" placeholder="От" value={filters.minKitchenArea} onChange={(e) => setFilters({...filters, minKitchenArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                            <input type="number" placeholder="До" value={filters.maxKitchenArea} onChange={(e) => setFilters({...filters, maxKitchenArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Тип дома</label>
                          <select value={filters.houseType} onChange={(e) => setFilters({...filters, houseType: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                            <option value="Любой">Любой тип</option>
                            {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Вид ремонта</label>
                          <select value={filters.repairType} onChange={(e) => setFilters({...filters, repairType: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                            <option value="Любой">Любой ремонт</option>
                            {REPAIR_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {!isLand && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-slate-50">
                      <MultiSelect label="Техника" prefix="Т" options={TECH_OPTIONS} selected={filters.tech} onChange={(s) => setFilters({...filters, tech: s})} />
                      <MultiSelect label="Комфорт" prefix="К" options={COMFORT_OPTIONS} selected={filters.comfort} onChange={(s) => setFilters({...filters, comfort: s})} />
                      <MultiSelect label="Коммуникации" prefix="К" options={COMM_OPTIONS} selected={filters.comm} onChange={(s) => setFilters({...filters, comm: s})} />
                      <MultiSelect label="Инфраструктура" prefix="И" options={INFRA_OPTIONS} selected={filters.infra} onChange={(s) => setFilters({...filters, infra: s})} />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-10">
                    {!isLand && (
                      <div className="flex flex-wrap gap-10">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div 
                            className={`w-12 h-6 rounded-full relative transition-all ${filters.hasFurniture === true ? 'bg-blue-600' : 'bg-slate-200'}`}
                            onClick={() => setFilters({...filters, hasFurniture: filters.hasFurniture === true ? null : true})}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.hasFurniture === true ? 'left-7' : 'left-1'}`}></div>
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Мебель</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div 
                            className={`w-12 h-6 rounded-full relative transition-all ${filters.hasRepair === true ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            onClick={() => setFilters({...filters, hasRepair: filters.hasRepair === true ? null : true})}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.hasRepair === true ? 'left-7' : 'left-1'}`}></div>
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">С ремонтом</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div 
                            className={`w-12 h-6 rounded-full relative transition-all ${filters.isEOselya === true ? 'bg-emerald-600' : 'bg-slate-200'}`}
                            onClick={() => setFilters({...filters, isEOselya: filters.isEOselya === true ? null : true})}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.isEOselya === true ? 'left-7' : 'left-1'}`}></div>
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">єОселя</span>
                        </label>
                      </div>
                    )}
                    
                    <div className="flex gap-4 ml-auto">
                      <button 
                        onClick={resetFilters}
                        className="px-8 py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition"
                      >
                        Сбросить
                      </button>
                      <div className="px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl flex items-center gap-3">
                        <Search className="w-4 h-4" /> Найдено: {filteredProperties.length}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  isClientView={isClientMode}
                  onEdit={isClientMode ? undefined : (p) => { setEditingProperty(p); setIsModalOpen(true); }}
                  onDelete={isClientMode ? undefined : handleDeleteProperty}
                />
              ))}

              {!isClientMode && (
                <div 
                  onClick={() => { setEditingProperty(null); setIsModalOpen(true); }}
                  className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-blue-100 hover:bg-blue-50/10 transition-all min-h-[400px]"
                >
                  <div className="bg-slate-50 group-hover:bg-blue-600 p-8 rounded-full transition-all duration-500 mb-6 group-hover:rotate-90">
                    <Plus className="w-10 h-10 text-slate-300 group-hover:text-white" />
                  </div>
                  <p className="font-black text-slate-400 group-hover:text-blue-600 uppercase text-[10px] tracking-[0.3em]">Новый объект</p>
                </div>
              )}
            </div>
          </>
        } />
        <Route path="/property/:id" element={<PropertyDetailPage properties={properties} />} />
      </Routes>

      <PropertyFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
        availableDistricts={availableDistricts}
      />
    </div>
  );
};

export default App;