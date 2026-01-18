import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Property, FilterState, PropertyCategory } from './types';
import { 
  ROOMS_OPTIONS, LAND_TYPES, HOUSE_TYPES, 
  REPAIR_TYPES, HOUSING_CLASSES, HEATING_OPTIONS, TECH_OPTIONS, COMFORT_OPTIONS, 
  COMM_OPTIONS, INFRA_OPTIONS, CATEGORIES, INITIAL_DISTRICTS, HOUSE_SUBTYPES
} from './constants.tsx';
import { PlusCircle, Search, Plus, Home, LogOut, ChevronDown, Users } from './components/Icons';
import PropertyCard from './components/PropertyCard';
import PropertyFormModal from './components/PropertyFormModal';
import MultiSelect from './components/MultiSelect';
import PropertyDetailPage from './src/pages/PropertyDetailPage';
import LoginPage from '@/src/pages/LoginPage';
import ClientsPage from '@/src/pages/ClientsPage'; // Import ClientsPage
import { useAuth } from '@/src/context/AuthContext';

const API_URL = '/api/properties';
const ADDITIONAL_FILTERS_STORAGE_KEY = 'realty_crm_additional_filters_open';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(ADDITIONAL_FILTERS_STORAGE_KEY);
      return storedState === 'true'; // По умолчанию закрыто, если не найдено
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADDITIONAL_FILTERS_STORAGE_KEY, String(showAdditionalFilters));
    }
  }, [showAdditionalFilters]);

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Property[] = await response.json();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const isClientMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('clientMode') === 'true';
  }, [location.search]);

  const isDetailPage = useMemo(() => location.pathname.startsWith('/property/'), [location.pathname]);
  const isClientsPage = useMemo(() => location.pathname === '/clients', [location.pathname]);
  const isPropertiesPage = useMemo(() => location.pathname === '/', [location.pathname]);


  const availableDistricts = useMemo(() => {
    const propertyDistricts = properties.map((p: Property) => p.district);
    const combined = [...INITIAL_DISTRICTS, ...propertyDistricts];
    return Array.from(new Set(combined.filter(d => d.trim() !== ''))).sort();
  }, [properties]);

  const handleRemoveCustomDistrict = async (districtToRemove: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить район "${districtToRemove}"? Все объекты, использующие его, будут обновлены.`)) {
      return;
    }
  
    try {
      const propertiesToUpdate = properties.filter((p: Property) => p.district === districtToRemove);
  
      const updatePromises = propertiesToUpdate.map(async (p: Property) => {
        const updatedProperty = { ...p, district: '' };
        const response = await fetch(`${API_URL}/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProperty),
        });
        if (!response.ok) throw new Error(`Failed to update property ${p.id}`);
        return response.json();
      });
  
      await Promise.all(updatePromises);
      fetchProperties();
    } catch (error) {
      console.error("Error removing custom district:", error);
      alert("Ошибка при удалении района. Пожалуйста, проверьте консоль.");
    }
  };

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
    houseSubtype: 'Любой', // Добавлено новое поле фильтра
    tech: [],
    comfort: [],
    comm: [],
    infra: [],
    keywords: '',
  });

  const filteredProperties = useMemo(() => {
    const lowerCaseKeywords = filters.keywords.toLowerCase();

    return properties.filter((p: Property) => {
      if (p.category !== filters.category) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.district !== 'Любой' && p.district !== filters.district) return false;

      if (lowerCaseKeywords) {
        const matchesAddress = p.address.toLowerCase().includes(lowerCaseKeywords);
        const matchesDescription = p.description.toLowerCase().includes(lowerCaseKeywords);
        const matchesOwnerPhone = p.ownerPhone.toLowerCase().includes(lowerCaseKeywords);
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

        // New filter for houseSubtype
        if (filters.category === 'houses' && filters.houseSubtype !== 'Любой' && p.houseSubtype !== filters.houseSubtype) return false;

        if (filters.tech.length > 0 && !filters.tech.every((f: string) => p.tech.includes(f))) return false;
        if (filters.comfort.length > 0 && !filters.comfort.every((f: string) => p.comfort.includes(f))) return false;
        if (filters.comm.length > 0 && !filters.comm.every((f: string) => p.comm.includes(f))) return false;
        if (filters.infra.length > 0 && !filters.infra.every((f: string) => p.infra.includes(f))) return false;
      }

      return true;
    });
  }, [properties, filters]);

  const handleSaveProperty = async (property: Property) => {
    try {
      if (editingProperty) {
        const response = await fetch(`${API_URL}/${property.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(property),
        });
        if (!response.ok) throw new Error('Failed to update property');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(property),
        });
        if (!response.ok) throw new Error('Failed to add property');
      }
      fetchProperties();
      setIsModalOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Ошибка при сохранении объекта. Пожалуйста, проверьте консоль.");
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот объект?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete property');
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Ошибка при удалении объекта. Пожалуйста, проверьте консоль.");
    }
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
      houseSubtype: 'Любой', // Сброс нового поля
      tech: [], comfort: [], comm: [], infra: [],
      keywords: '',
    });
  };

  const isLand = filters.category === 'land';
  const isHouses = filters.category === 'houses';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
            <Home className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">
              {isClientMode ? 'Real Estate Catalog' : 'MaryanaEstate'}
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              {isClientMode ? 'Client Portfolio' : 'Expert Management'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isClientMode && isAuthenticated && (
            <>
              <Link 
                to="/" 
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-xs transition-all active:scale-95 ${
                  isPropertiesPage && !isDetailPage ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Объекты
              </Link>
              <Link 
                to="/clients" 
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-xs transition-all active:scale-95 ${
                  isClientsPage ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Users className="w-4 h-4" /> Клиенты
              </Link>
              {!isDetailPage && !isClientsPage && ( // Show "Add Property" only on main page
                <button 
                  onClick={() => { setEditingProperty(null); setIsModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" /> Добавить объект
                </button>
              )}
              <button 
                onClick={logout}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-xs transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" /> Выйти
              </button>
            </>
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
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/clients" element={isAuthenticated ? <ClientsPage /> : <Navigate to="/login" replace />} />
        <Route path="/" element={
          isAuthenticated || isClientMode ? (
            <>
              {!isDetailPage && !isClientsPage && ( // Hide filters on detail and clients page
                <section className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-sm border border-slate-50 mb-12">
                  <div className="grid grid-cols-1 gap-12">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ключевые слова</label>
                      <input 
                        type="text" 
                        placeholder="Поиск по адресу, описанию, телефону..." 
                        value={filters.keywords} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, keywords: e.target.value})} 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold outline-none transition" 
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 p-1.5 bg-slate-50 rounded-[2rem] w-fit">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setFilters(prev => ({ ...prev, category: cat.id as PropertyCategory, houseSubtype: 'Любой' }))} // Reset houseSubtype on category change
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
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, district: e.target.value})}
                          className="w-full bg-slate-50 border-transparent focus:border-blue-500 border-2 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                        >
                          <option value="Любой">Любой район</option>
                          {availableDistricts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Бюджет ($)</label>
                        <div className="flex gap-2">
                          <input type="number" placeholder="От" value={filters.minPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                          <input type="number" placeholder="До" value={filters.maxPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                        </div>
                      </div>

                      {/* New filter for house subtype */}
                      {isHouses && (
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Подкатегория</label>
                          <select 
                            value={filters.houseSubtype}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, houseSubtype: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                          >
                            <option value="Любой">Любая</option>
                            {HOUSE_SUBTYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      )}

                      {/* Toggle for Additional Filters - New Position */}
                      <div className={`flex justify-end items-end ${isHouses ? '' : 'lg:col-span-2'}`}>
                        <button
                          type="button"
                          onClick={() => setShowAdditionalFilters(prev => !prev)}
                          className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 transition-all active:scale-95"
                        >
                          {showAdditionalFilters ? 'Скрыть дополнительные фильтры' : 'Показать дополнительные фильтры'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showAdditionalFilters ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Additional Filters Section (Conditional) */}
                    {showAdditionalFilters && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-200">
                        {isLand ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Площадь земли (сот.)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="От" value={filters.minLandArea} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, minLandArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                                <input type="number" placeholder="До" value={filters.maxLandArea} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, maxLandArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Тип земли</label>
                              <select 
                                value={filters.landType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, landType: e.target.value})}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                              >
                                <option value="Любой">Любой тип</option>
                                {LAND_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Комнат</label>
                              <select 
                                value={filters.rooms}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, rooms: e.target.value})}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                              >
                                <option value="Любое">Любое</option>
                                {ROOMS_OPTIONS.map((o: string) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Этаж (от/до)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="Мин" value={filters.minFloor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, minFloor: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                                <input type="number" placeholder="Макс" value={filters.maxFloor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, maxFloor: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Общая пл. (м²)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="От" value={filters.minArea} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, minArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                                <input type="number" placeholder="До" value={filters.maxArea} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, maxArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Пл. кухни (м²)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="От" value={filters.minKitchenArea} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, minKitchenArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                                <input type="number" placeholder="До" value={filters.maxKitchenArea} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, maxKitchenArea: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Тип дома</label>
                              <select value={filters.houseType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, houseType: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition">
                                <option value="Любой">Любой тип</option>
                                {HOUSE_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Класс жилья</label>
                              <select value={filters.housingClass} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, housingClass: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                                {HOUSING_CLASSES.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Вид ремонта</label>
                              <select value={filters.repairType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, repairType: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                                {REPAIR_TYPES.map((r: string) => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Отопление</label>
                              <select value={filters.heating} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, heating: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                                {HEATING_OPTIONS.map((h: string) => <option key={h} value={h}>{h}</option>)}
                              </select>
                            </div>
                          </div>
                        )}

                        {!isLand && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-slate-50">
                            <MultiSelect label="Техника" prefix="Т" options={TECH_OPTIONS} selected={filters.tech} onChange={(s: string[]) => setFilters({...filters, tech: s})} />
                            <MultiSelect label="Комфорт" prefix="К" options={COMFORT_OPTIONS} selected={filters.comfort} onChange={(s: string[]) => setFilters(p => ({...p, comfort: s}))} />
                            <MultiSelect label="Коммуникации" prefix="К" options={COMM_OPTIONS} selected={filters.comm} onChange={(s: string[]) => setFilters(p => ({...p, comm: s}))} />
                            <MultiSelect label="Инфраструктура" prefix="И" options={INFRA_OPTIONS} selected={filters.infra} onChange={(s: string[]) => setFilters(p => ({...p, infra: s}))} />
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
                                  className={`w-12 h-6 rounded-full relative transition-colors ${filters.isEOselya === true ? 'bg-emerald-600' : 'bg-slate-200'}`}
                                  onClick={() => setFilters({...filters, isEOselya: filters.isEOselya === true ? null : true})}
                                >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.isEOselya === true ? 'left-7' : 'left-1'}`}></div>
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">єОселя</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-4">
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
                </section>
              )}

              {!isClientsPage && ( // Hide property cards on clients page
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredProperties.map((property: Property) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      isClientView={isClientMode}
                      onEdit={isClientMode || !isAuthenticated ? undefined : (p: Property) => { setEditingProperty(p); setIsModalOpen(true); }}
                      onDelete={isClientMode || !isAuthenticated ? undefined : handleDeleteProperty}
                    />
                  ))}

                  {!isClientMode && isAuthenticated && (
                    <div 
                      onClick={() => { setEditingProperty(null); setIsModalOpen(true); }}
                      className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-blue-100 hover:bg-blue-50/10 transition-all min-h-[400px]"
                    >
                      <div className="bg-slate-50 group-hover:bg-blue-600 p-8 rounded-full transition-all duration-500 mb-6 group-hover:rotate-90">
                        <Plus className="w-10 h-10 text-slate-300 group-hover:text-white" />
                      </div>
                      <p className="font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Новый объект</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/property/:id" element={<PropertyDetailPage properties={properties} />} />
      </Routes>

      <PropertyFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
        availableDistricts={availableDistricts}
        onRemoveCustomDistrict={handleRemoveCustomDistrict}
      />
    </div>
  );
};

export default App;