import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Property, FilterState, PropertyCategory } from './types';
import { 
  ROOMS_OPTIONS, LAND_TYPES, 
  REPAIR_TYPES, HOUSING_CLASSES, HEATING_OPTIONS, TECH_OPTIONS, COMFORT_OPTIONS, 
  COMM_OPTIONS, INFRA_OPTIONS, CATEGORIES, INITIAL_DISTRICTS, HOUSE_TYPES_EXTENDED, LOCATION_TYPES,
  YEAR_BUILT_OPTIONS, WALL_TYPE_OPTIONS, BATHROOM_OPTIONS, DEAL_TYPE_OPTIONS, PLANNING_STATUS_OPTIONS,
  // Новые константы для земельных участков
  LAND_COMMUNICATIONS_OPTIONS, LAND_STRUCTURES_OPTIONS, LAND_INFRASTRUCTURE_OPTIONS, LAND_LANDSCAPE_OPTIONS
} from './constants.tsx';
import { PlusCircle, Search, Plus, Home, LogOut, ChevronDown, Users } from './components/Icons';
import PropertyCard from './components/PropertyCard';
import PropertyFormModal from './components/PropertyFormModal';
import MultiSelect from './components/MultiSelect';
import EditableMultiSelect from './components/EditableMultiSelect';
import PropertyDetailPage from './src/pages/PropertyDetailPage';
import LoginPage from '@/src/pages/LoginPage';
import ClientsPage from '@/src/pages/ClientsPage';
import { useAuth } from '@/src/context/AuthContext';
import { showSuccess, showError } from './src/utils/toast';

import { API_BASE_URL } from './src/config';

const API_URL = `${API_BASE_URL}/properties`;
const CUSTOM_OPTIONS_API_URL = `${API_BASE_URL}/customOptions`;
const ADDITIONAL_FILTERS_STORAGE_KEY = 'realty_crm_additional_filters_open';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const [customOptions, setCustomOptions] = useState<{
    districts: string[];
    housingClasses: string[];
    repairTypes: string[];
    heatingOptions: string[];
    yearBuiltOptions: string[];
    wallTypeOptions: string[];
    bathroomOptions: string[];
    dealTypeOptions: string[];
    planningStatusOptions: string[];
    landTypes: string[];
    houseTypes: string[];
    techOptions: string[];
    comfortOptions: string[];
    commOptions: string[];
    infraOptions: string[];
    // Новые поля для земельных участков
    landCommunicationsOptions: string[];
    landStructuresOptions: string[];
    landInfrastructureOptions: string[];
    landLandscapeOptions: string[];
  }>({
    districts: [],
    housingClasses: [],
    repairTypes: [],
    heatingOptions: [],
    yearBuiltOptions: [],
    wallTypeOptions: [],
    bathroomOptions: [],
    dealTypeOptions: [],
    planningStatusOptions: [],
    landTypes: [],
    houseTypes: [],
    techOptions: [],
    comfortOptions: [],
    commOptions: [],
    infraOptions: [],
    // Новые поля для земельных участков
    landCommunicationsOptions: [],
    landStructuresOptions: [],
    landInfrastructureOptions: [],
    landLandscapeOptions: []
  });

  const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(ADDITIONAL_FILTERS_STORAGE_KEY);
      return storedState === 'true';
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
      
      // Миграция: добавляем поле status если его нет
      const migratedData = data.map(property => ({
        ...property,
        status: property.status || 'available'
      }));
      
      // Обновляем объекты на сервере если нужно
      for (const property of migratedData) {
        if (!property.status) {
          try {
            await fetch(`${API_URL}/${property.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...property, status: 'available' }),
            });
          } catch (error) {
            console.error("Error migrating property:", error);
          }
        }
      }
      
      setProperties(migratedData);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      showError("Не удалось загрузить список объектов.");
    }
  }, []);

  const fetchCustomOptions = useCallback(async () => {
    try {
      const response = await fetch(CUSTOM_OPTIONS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomOptions(data);
    } catch (error) {
      console.error("Failed to fetch custom options from API, trying fallback:", error);
      // Fallback: load from db.json directly
      try {
        const dbResponse = await fetch('/db.json');
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          if (dbData.customOptions) {
            setCustomOptions(dbData.customOptions);
            console.log("Loaded customOptions from db.json fallback:", dbData.customOptions);
          }
        }
      } catch (fallbackError) {
        console.error("Failed to load fallback data:", fallbackError);
        showError("Не удалось загрузить пользовательские опции.");
      }
    }
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchCustomOptions();
    // console.log("App.tsx - Initial fetch and setup complete."); // Removed log
  }, [fetchProperties, fetchCustomOptions]);

  const isClientMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('clientMode') === 'true';
  }, [location.search]);

  const isDetailPage = useMemo(() => location.pathname.startsWith('/property/'), [location.pathname]);
  const isClientsPage = useMemo(() => location.pathname === '/clients', [location.pathname]);
  const isPropertiesPage = useMemo(() => location.pathname === '/', [location.pathname]);

  const updateCustomOptionsOnServer = useCallback(async (updatedOptions: typeof customOptions) => {
    try {
      const response = await fetch(CUSTOM_OPTIONS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOptions),
      });
      if (!response.ok) {
        throw new Error(`Failed to update custom options: ${response.status}`);
      }
      setCustomOptions(updatedOptions);
      showSuccess('Пользовательские опции обновлены!');
    } catch (error) {
      console.error("Error updating custom options:", error);
      showError('Ошибка при обновлении пользовательских опций.');
    }
  }, []);

  const getUniqueOptions = useCallback((initialConstants: string[], customList: string[] | undefined, propertyKey: string) => {
    const propertyValues = properties.map(p => p[propertyKey as keyof Property]).filter(v => typeof v === 'string' && v.trim() !== '');
    const customValues = Array.isArray(customList) ? customList : [];
    const combined = [...initialConstants, ...customValues, ...propertyValues];
    return Array.from(new Set(combined.filter(v => typeof v === 'string' && v.trim() !== ''))).sort();
  }, [properties]);

  // Dynamic option lists for SingleSelectWithDelete
  const availableDistricts = useMemo(() => getUniqueOptions(INITIAL_DISTRICTS, customOptions.districts || [], 'district'), [getUniqueOptions, customOptions.districts]);
  const availableHousingClasses = useMemo(() => getUniqueOptions(HOUSING_CLASSES, customOptions.housingClasses || [], 'housingClass'), [getUniqueOptions, customOptions.housingClasses]);
  const availableRepairTypes = useMemo(() => getUniqueOptions(REPAIR_TYPES, customOptions.repairTypes || [], 'repairType'), [getUniqueOptions, customOptions.repairTypes]);
  const availableHeatingOptions = useMemo(() => getUniqueOptions(HEATING_OPTIONS, customOptions.heatingOptions || [], 'heating'), [getUniqueOptions, customOptions.heatingOptions]);
  const availableHouseTypes = useMemo(() => getUniqueOptions([...HOUSE_TYPES_EXTENDED], customOptions.houseTypes || [], 'houseSubtype'), [getUniqueOptions, customOptions.houseTypes]);
  const availableYearBuiltOptions = useMemo(() => getUniqueOptions(YEAR_BUILT_OPTIONS, customOptions.yearBuiltOptions || [], 'yearBuilt'), [getUniqueOptions, customOptions.yearBuiltOptions]);
  const availableWallTypeOptions = useMemo(() => getUniqueOptions(WALL_TYPE_OPTIONS, customOptions.wallTypeOptions || [], 'wallType'), [getUniqueOptions, customOptions.wallTypeOptions]);
  const availableBathroomOptions = useMemo(() => getUniqueOptions(BATHROOM_OPTIONS, customOptions.bathroomOptions || [], 'bathroomType'), [getUniqueOptions, customOptions.bathroomOptions]);
  const availableLandTypes = useMemo(() => getUniqueOptions(LAND_TYPES, customOptions.landTypes || [], 'landType'), [getUniqueOptions, customOptions.landTypes]);
  const availableDealTypeOptions = useMemo(() => getUniqueOptions(DEAL_TYPE_OPTIONS, customOptions.dealTypeOptions || [], 'dealType'), [getUniqueOptions, customOptions.dealTypeOptions]);
  const availablePlanningStatusOptions = useMemo(() => getUniqueOptions(PLANNING_STATUS_OPTIONS, customOptions.planningStatusOptions || [], 'planningStatus'), [getUniqueOptions, customOptions.planningStatusOptions]);

  // Dynamic option lists for EditableMultiSelect (for filters and form)
  const availableTechOptions = useMemo(() => getUniqueOptions(TECH_OPTIONS, customOptions.techOptions || [], 'tech'), [getUniqueOptions, customOptions.techOptions]);
  const availableComfortOptions = useMemo(() => getUniqueOptions(COMFORT_OPTIONS, customOptions.comfortOptions || [], 'comfort'), [getUniqueOptions, customOptions.comfortOptions]);
  const availableCommOptions = useMemo(() => getUniqueOptions(COMM_OPTIONS, customOptions.commOptions || [], 'comm'), [getUniqueOptions, customOptions.commOptions]);
  const availableInfraOptions = useMemo(() => getUniqueOptions(INFRA_OPTIONS, customOptions.infraOptions || [], 'infra'), [getUniqueOptions, customOptions.infraOptions]);

  // Новые опции для земельных участков
  const availableLandCommunicationsOptions = useMemo(() => getUniqueOptions(LAND_COMMUNICATIONS_OPTIONS, customOptions.landCommunicationsOptions || [], 'landCommunications'), [getUniqueOptions, customOptions.landCommunicationsOptions]);
  const availableLandStructuresOptions = useMemo(() => getUniqueOptions(LAND_STRUCTURES_OPTIONS, customOptions.landStructuresOptions || [], 'landStructures'), [getUniqueOptions, customOptions.landStructuresOptions]);
  const availableLandInfrastructureOptions = useMemo(() => getUniqueOptions(LAND_INFRASTRUCTURE_OPTIONS, customOptions.landInfrastructureOptions || [], 'landInfrastructure'), [getUniqueOptions, customOptions.landInfrastructureOptions]);
  const availableLandLandscapeOptions = useMemo(() => getUniqueOptions(LAND_LANDSCAPE_OPTIONS, customOptions.landLandscapeOptions || [], 'landLandscape'), [getUniqueOptions, customOptions.landLandscapeOptions]);

  // Add a separate useEffect for logging availableComfortOptions
  useEffect(() => {
    // console.log("App.tsx - availableComfortOptions (for filters and form):", availableComfortOptions); // Removed log
  }, [availableComfortOptions]);

  // Functions to add custom options
  const handleAddCustomOption = useCallback((category: keyof typeof customOptions, option: string) => {
    setCustomOptions(prev => {
      const currentCategory = prev[category] || [];
      const updatedCategory = Array.from(new Set([...currentCategory, option])).sort();
      const updatedOptions = { ...prev, [category]: updatedCategory };
      updateCustomOptionsOnServer(updatedOptions);
      return updatedOptions;
    });
  }, [updateCustomOptionsOnServer]);

  // Functions to remove custom options
  const handleRemoveCustomOption = useCallback((category: keyof typeof customOptions, optionToRemove: string, initialConstants: string[]) => {
    console.log(`[App] Attempting to remove custom option: ${optionToRemove} from category: ${category}`); // Added log
    console.log(`[App] Current customOptions before removal:`, customOptions); // Added log
    if (initialConstants.includes(optionToRemove)) {
      showError(`Нельзя удалить предопределенную опцию "${optionToRemove}".`);
      console.warn(`[App] Attempted to remove constant option: ${optionToRemove}`); // Added log
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите удалить пользовательскую опцию "${optionToRemove}"?`)) {
      return;
    }

    setCustomOptions(prev => {
      const updatedCategory = prev[category].filter(opt => opt !== optionToRemove);
      const updatedOptions = { ...prev, [category]: updatedCategory };
      console.log(`[App] New customOptions state for ${category} after removal:`, updatedCategory); // Added log
      updateCustomOptionsOnServer(updatedOptions);
      return updatedOptions;
    });
  }, [updateCustomOptionsOnServer]);


  const handleRemoveCustomDistrict = useCallback(async (districtToRemove: string) => {
    if (INITIAL_DISTRICTS.includes(districtToRemove)) {
      showError(`Нельзя удалить предопределенный район "${districtToRemove}".`);
      return;
    }
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
      
      // Remove from custom options
      setCustomOptions(prev => {
        const updatedDistricts = prev.districts.filter(d => d !== districtToRemove);
        const updatedOptions = { ...prev, districts: updatedDistricts };
        updateCustomOptionsOnServer(updatedOptions);
        return updatedOptions;
      });

      fetchProperties(); 
      showSuccess(`Район "${districtToRemove}" успешно удален и объекты обновлены.`);
    } catch (error) {
      console.error("Error removing custom district:", error);
      showError("Ошибка при удалении района. Пожалуйста, проверьте консоль.");
    }
  }, [properties, fetchProperties, updateCustomOptionsOnServer]);


  const [filters, setFilters] = useState<FilterState>({
    category: 'apartments',
    status: 'available',
    district: [],
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
    housingClass: [],
    hasFurniture: null,
    hasRepair: null,
    repairType: [],
    heating: [],
    isEOselya: null,
    landType: [],
    minLandArea: '',
    maxLandArea: '',
    houseSubtype: [],
    locationType: 'Любой',
    distanceFromCityKm: '',
    yearBuilt: [],
    wallType: [],
    bathroomType: [],
    dealType: [],
    planningStatus: [],
    tech: [],
    comfort: [],
    comm: [],
    infra: [],
    landCommunications: [],
    landStructures: [],
    landInfrastructure: [],
    landLandscape: [],
    keywords: '',
  });

  const filteredProperties = useMemo(() => {
    const lowerCaseKeywords = filters.keywords.toLowerCase();
    const filterDistanceFromCity = Number(filters.distanceFromCityKm);

    return properties.filter((p: Property) => {
      if (p.category !== filters.category) return false;
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.district.length > 0 && !filters.district.some((f: string) => p.district === f)) return false;

      if (lowerCaseKeywords) {
        const matchesAddress = p.address.toLowerCase().includes(lowerCaseKeywords);
        const matchesDescription = p.description.toLowerCase().includes(lowerCaseKeywords);
        const matchesOwnerPhone = p.ownerPhone.toLowerCase().includes(lowerCaseKeywords);
        if (!matchesAddress && !matchesDescription && !matchesOwnerPhone) return false;
      }

      if (filters.category === 'land') {
        if (filters.minLandArea && (p.landArea || 0) < Number(filters.minLandArea)) return false;
        if (filters.maxLandArea && (p.landArea || 0) > Number(filters.maxLandArea)) return false;
        if (filters.landType.length > 0 && !filters.landType.some((f: string) => p.landType === f)) return false;
        
        // Новые фильтры для земельных участков
        if (filters.landCommunications.length > 0 && !filters.landCommunications.every((f: string) => (p.landCommunications || []).includes(f))) return false;
        if (filters.landStructures.length > 0 && !filters.landStructures.every((f: string) => (p.landStructures || []).includes(f))) return false;
        if (filters.landInfrastructure.length > 0 && !filters.landInfrastructure.every((f: string) => (p.landInfrastructure || []).includes(f))) return false;
        if (filters.landLandscape.length > 0 && !filters.landLandscape.every((f: string) => (p.landLandscape || []).includes(f))) return false;
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
        if (filters.housingClass.length > 0 && !filters.housingClass.some((f: string) => p.housingClass === f)) return false;
        if (filters.hasFurniture !== null && p.hasFurniture !== filters.hasFurniture) return false;
        if (filters.hasRepair !== null && p.hasRepair !== filters.hasRepair) return false;
        if (filters.repairType.length > 0 && !filters.repairType.some((f: string) => p.repairType === f)) return false;
        if (filters.heating.length > 0 && !filters.heating.some((f: string) => p.heating === f)) return false;
        if (filters.isEOselya !== null && p.isEOselya !== filters.isEOselya) return false;
        if (filters.yearBuilt.length > 0 && !filters.yearBuilt.some((f: string) => p.yearBuilt === f)) return false;
        if (filters.wallType.length > 0 && !filters.wallType.some((f: string) => p.wallType === f)) return false;
        if (filters.bathroomType.length > 0 && !filters.bathroomType.some((f: string) => p.bathroomType === f)) return false;
        if (filters.dealType.length > 0 && !filters.dealType.some((f: string) => p.dealType === f)) return false;
        if (filters.planningStatus.length > 0 && !filters.planningStatus.some((f: string) => p.planningStatus === f)) return false;

        if (filters.houseSubtype.length > 0 && !filters.houseSubtype.some((f: string) => p.houseSubtype === f)) return false;
        
        if (filters.category === 'houses') {
          if (filters.locationType !== 'Любой') {
            if (filters.locationType === 'В городе' && p.locationType !== 'inCity') return false;
            if (filters.locationType === 'За городом' && p.locationType !== 'outsideCity') return false;
          }
          if (filters.locationType === 'За городом' && filters.distanceFromCityKm) {
            if (p.distanceFromCityKm === undefined || p.distanceFromCityKm > filterDistanceFromCity) return false;
          }
        }

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
        showSuccess('Объект успешно обновлен!');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(property),
        });
        if (!response.ok) throw new Error('Failed to add property');
        showSuccess('Объект успешно добавлен!');
      }
      fetchProperties();
      setIsModalOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error("Error saving property:", error);
      showError("Ошибка при сохранении объекта. Пожалуйста, проверьте консоль.");
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
      showSuccess('Объект успешно удален!');
    } catch (error) {
      console.error("Error deleting property:", error);
      showError("Ошибка при удалении объекта. Пожалуйста, проверьте консоль.");
    }
  };

  const handleUpdatePropertyStatus = async (id: string, status: 'available' | 'sold' | 'advance') => {
    try {
      const property = properties.find(p => p.id === id);
      if (!property) return;

      const updatedProperty = { ...property, status };
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProperty),
      });
      if (!response.ok) throw new Error('Failed to update property status');
      fetchProperties();
      const statusText = status === 'sold' ? 'Продано' : status === 'advance' ? 'Аванс' : 'Актуально';
      showSuccess(`Статус объекта изменен на "${statusText}"!`);
    } catch (error) {
      console.error("Error updating property status:", error);
      showError("Ошибка при обновлении статуса объекта. Пожалуйста, проверьте консоль.");
    }
  };

  const resetFilters = () => {
    setFilters({
      category: filters.category,
      status: 'available',
      district: [],
      minPrice: '', maxPrice: '', minArea: '', maxArea: '', minKitchenArea: '', maxKitchenArea: '',
      minFloor: '', maxFloor: '', minTotalFloors: '', maxTotalFloors: '',
      rooms: 'Любое', type: 'Любой', 
      housingClass: [],
      hasFurniture: null, hasRepair: null, repairType: [], heating: [],
      isEOselya: null, landType: [], minLandArea: '', maxLandArea: '',
      houseSubtype: [],
      locationType: 'Любой',
      distanceFromCityKm: '',
      yearBuilt: [],
      wallType: [],
      bathroomType: [],
      dealType: [],
      planningStatus: [],
      tech: [], comfort: [], comm: [], infra: [],
      // Новые поля для земельных участков
      landCommunications: [],
      landStructures: [],
      landInfrastructure: [],
      landLandscape: [],
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
            <h1 className="text-xl font-[900] text-slate-900 tracking-tight">
              {isClientMode ? 'Real Estate Catalog' : 'Maryana_Ivshyna'}
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              {isClientMode ? 'Client Portfolio' : 'real_estate'}
            </p>
          </div>
        </div>
        
        {/* Переключатель статусов - только на главной странице объектов для авторизованных пользователей */}
        {!isClientsPage && !isDetailPage && !isClientMode && isAuthenticated && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-lg">
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))} 
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                filters.status === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'available' }))} 
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                filters.status === 'available' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Актуально
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'sold' }))} 
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                filters.status === 'sold' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Продано
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'advance' }))} 
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                filters.status === 'advance' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Аванс
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {!isClientMode && isAuthenticated && (
            <>
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-xs transition-all active:scale-95 ${
                  isPropertiesPage && !isDetailPage ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Home className="w-3 h-3" /> Объекты
              </Link>
              <Link 
                to="/clients" 
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-xs transition-all active:scale-95 ${
                  isClientsPage ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Users className="w-3 h-3" /> Клиенты
              </Link>
              {!isDetailPage && !isClientsPage && (
                <button 
                  onClick={() => { setEditingProperty(null); setIsModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-xs transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" /> Добавить объект
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
              {!isDetailPage && !isClientsPage && (
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
                          onClick={() => setFilters(prev => ({ 
                            ...prev, 
                            category: cat.id as PropertyCategory, 
                            houseSubtype: [],
                            locationType: 'Любой',
                            distanceFromCityKm: '',
                            yearBuilt: [],
                            wallType: [],
                            bathroomType: [],
                          }))} 
                          className={`px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                            filters.category === cat.id ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                      {isHouses && (
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Расположение</label>
                          <select 
                            value={filters.locationType}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, locationType: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                          >
                            <option value="Любой">Любое</option>
                            {LOCATION_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      )}
                      {isHouses && filters.locationType === 'За городом' && (
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">От города (км)</label>
                          <input 
                            type="number" 
                            placeholder="До" 
                            value={filters.distanceFromCityKm} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, distanceFromCityKm: e.target.value})} 
                            className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" 
                          />
                        </div>
                      )}
                      <EditableMultiSelect 
                        label="Район" 
                        prefix="Р" 
                        initialOptions={availableDistricts}
                        constantOptions={INITIAL_DISTRICTS}
                        selected={filters.district || []} 
                        onChange={(s: string[]) => setFilters({...filters, district: s})} 
                        onAddCustomOption={(option: string) => handleAddCustomOption('districts', option)}
                        onRemoveOption={(option: string) => handleRemoveCustomOption('districts', option, INITIAL_DISTRICTS)}
                      />

                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Бюджет ($)</label>
                        <div className="flex gap-2">
                          <input type="number" placeholder="От" value={filters.minPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                          <input type="number" placeholder="До" value={filters.maxPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" />
                        </div>
                      </div>

                      {/* New filter for house subtype (now "Тип дома") */}
                      {isHouses && (
                        <EditableMultiSelect 
                          label="Тип дома" 
                          prefix="Т" 
                          initialOptions={availableHouseTypes}
                          constantOptions={[...HOUSE_TYPES_EXTENDED]}
                          selected={filters.houseSubtype || []} 
                          onChange={(s: string[]) => setFilters({...filters, houseSubtype: s})} 
                          onAddCustomOption={(option: string) => handleAddCustomOption('houseTypes', option)}
                          onRemoveOption={(option: string) => handleRemoveCustomOption('houseTypes', option, HOUSE_TYPES_EXTENDED)}
                        />
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
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Тип недвижимости</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableLandTypes}
                                constantOptions={LAND_TYPES}
                                selected={filters.landType || []} 
                                onChange={(s: string[]) => setFilters(p => ({...p, landType: s}))} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('landTypes', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('landTypes', option, LAND_TYPES)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Коммуникации</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableLandCommunicationsOptions}
                                constantOptions={LAND_COMMUNICATIONS_OPTIONS}
                                selected={filters.landCommunications || []} 
                                onChange={(s: string[]) => setFilters(p => ({...p, landCommunications: s}))} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('landCommunicationsOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('landCommunicationsOptions', option, LAND_COMMUNICATIONS_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Сооружения</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableLandStructuresOptions}
                                constantOptions={LAND_STRUCTURES_OPTIONS}
                                selected={filters.landStructures || []} 
                                onChange={(s: string[]) => setFilters(p => ({...p, landStructures: s}))} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('landStructuresOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('landStructuresOptions', option, LAND_STRUCTURES_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Инфраструктура до 500 метров</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableLandInfrastructureOptions}
                                constantOptions={LAND_INFRASTRUCTURE_OPTIONS}
                                selected={filters.landInfrastructure || []} 
                                onChange={(s: string[]) => setFilters(p => ({...p, landInfrastructure: s}))} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('landInfrastructureOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('landInfrastructureOptions', option, LAND_INFRASTRUCTURE_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ландшафт до 1 км</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableLandLandscapeOptions}
                                constantOptions={LAND_LANDSCAPE_OPTIONS}
                                selected={filters.landLandscape || []} 
                                onChange={(s: string[]) => setFilters(p => ({...p, landLandscape: s}))} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('landLandscapeOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('landLandscapeOptions', option, LAND_LANDSCAPE_OPTIONS)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Комнат</label>
                              <input 
                                type="text" 
                                placeholder="Количество комнат" 
                                value={filters.rooms === 'Любое' ? '' : filters.rooms}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, rooms: e.target.value || 'Любое'})}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                              />
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
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Класс жилья</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableHousingClasses}
                                constantOptions={HOUSING_CLASSES}
                                selected={filters.housingClass || []} 
                                onChange={(s: string[]) => setFilters({...filters, housingClass: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('housingClasses', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('housingClasses', option, HOUSING_CLASSES)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Вид ремонта</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableRepairTypes}
                                constantOptions={REPAIR_TYPES}
                                selected={filters.repairType || []} 
                                onChange={(s: string[]) => setFilters({...filters, repairType: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('repairTypes', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('repairTypes', option, REPAIR_TYPES)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Отопление</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableHeatingOptions}
                                constantOptions={HEATING_OPTIONS}
                                selected={filters.heating || []} 
                                onChange={(s: string[]) => setFilters({...filters, heating: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('heatingOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('heatingOptions', option, HEATING_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Год постройки/сдачи</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableYearBuiltOptions}
                                constantOptions={YEAR_BUILT_OPTIONS}
                                selected={filters.yearBuilt || []} 
                                onChange={(s: string[]) => setFilters({...filters, yearBuilt: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('yearBuiltOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('yearBuiltOptions', option, YEAR_BUILT_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Тип стен</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableWallTypeOptions}
                                constantOptions={WALL_TYPE_OPTIONS}
                                selected={filters.wallType || []} 
                                onChange={(s: string[]) => setFilters({...filters, wallType: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('wallTypeOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('wallTypeOptions', option, WALL_TYPE_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Санузел</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableBathroomOptions}
                                constantOptions={BATHROOM_OPTIONS}
                                selected={filters.bathroomType || []} 
                                onChange={(s: string[]) => setFilters({...filters, bathroomType: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('bathroomOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('bathroomOptions', option, BATHROOM_OPTIONS)}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Тип сделки</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availableDealTypeOptions}
                                constantOptions={DEAL_TYPE_OPTIONS as string[]}
                                selected={filters.dealType || []} 
                                onChange={(s: string[]) => setFilters({...filters, dealType: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('dealTypeOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('dealTypeOptions', option, DEAL_TYPE_OPTIONS as string[])}
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Планировка</label>
                              <EditableMultiSelect 
                                label="" 
                                prefix="" 
                                initialOptions={availablePlanningStatusOptions}
                                constantOptions={PLANNING_STATUS_OPTIONS as string[]}
                                selected={filters.planningStatus || []} 
                                onChange={(s: string[]) => setFilters({...filters, planningStatus: s})} 
                                onAddCustomOption={(option: string) => handleAddCustomOption('planningStatusOptions', option)}
                                onRemoveOption={(option: string) => handleRemoveCustomOption('planningStatusOptions', option, PLANNING_STATUS_OPTIONS as string[])}
                              />
                            </div>
                          </div>
                        )}

                        {!isLand && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-slate-50">
                            <EditableMultiSelect 
                              label="Техника" 
                              prefix="Т" 
                              initialOptions={availableTechOptions}
                              constantOptions={TECH_OPTIONS}
                              selected={filters.tech || []} 
                              onChange={(s: string[]) => setFilters({...filters, tech: s})} 
                              onAddCustomOption={(option: string) => handleAddCustomOption('techOptions', option)}
                              onRemoveOption={(option: string) => handleRemoveCustomOption('techOptions', option, TECH_OPTIONS)}
                            />
                            <EditableMultiSelect 
                              label="Комфорт" 
                              prefix="К" 
                              initialOptions={availableComfortOptions}
                              constantOptions={COMFORT_OPTIONS}
                              selected={filters.comfort || []} 
                              onChange={(s: string[]) => setFilters(p => ({...p, comfort: s}))} 
                              onAddCustomOption={(option: string) => handleAddCustomOption('comfortOptions', option)}
                              onRemoveOption={(option: string) => handleRemoveCustomOption('comfortOptions', option, COMFORT_OPTIONS)}
                            />
                            <EditableMultiSelect 
                              label="Коммуникации" 
                              prefix="К" 
                              initialOptions={availableCommOptions}
                              constantOptions={COMM_OPTIONS}
                              selected={filters.comm || []} 
                              onChange={(s: string[]) => setFilters(p => ({...p, comm: s}))} 
                              onAddCustomOption={(option: string) => handleAddCustomOption('commOptions', option)}
                              onRemoveOption={(option: string) => handleRemoveCustomOption('commOptions', option, COMM_OPTIONS)}
                            />
                            <EditableMultiSelect 
                              label="Инфраструктура" 
                              prefix="И" 
                              initialOptions={availableInfraOptions}
                              constantOptions={INFRA_OPTIONS}
                              selected={filters.infra || []} 
                              onChange={(s: string[]) => setFilters(p => ({...p, infra: s}))} 
                              onAddCustomOption={(option: string) => handleAddCustomOption('infraOptions', option)}
                              onRemoveOption={(option: string) => handleRemoveCustomOption('infraOptions', option, INFRA_OPTIONS)}
                            />
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

              {!isClientsPage && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredProperties.map((property: Property) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      isClientView={isClientMode}
                      onEdit={isClientMode || !isAuthenticated ? undefined : (p: Property) => { setEditingProperty(p); setIsModalOpen(true); }}
                      onDelete={isClientMode || !isAuthenticated ? undefined : handleDeleteProperty}
                      onUpdateStatus={isClientMode || !isAuthenticated ? undefined : handleUpdatePropertyStatus}
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
        onAddCustomDistrict={(option: string) => handleAddCustomOption('districts', option)}
        onRemoveCustomDistrict={handleRemoveCustomDistrict}

        availableHousingClasses={availableHousingClasses}
        onAddCustomHousingClass={(option: string) => handleAddCustomOption('housingClasses', option)}
        onRemoveCustomHousingClass={(option: string) => handleRemoveCustomOption('housingClasses', option, HOUSING_CLASSES)}

        availableRepairTypes={availableRepairTypes}
        onAddCustomRepairType={(option: string) => handleAddCustomOption('repairTypes', option)}
        onRemoveCustomRepairType={(option: string) => handleRemoveCustomOption('repairTypes', option, REPAIR_TYPES)}

        availableHeatingOptions={availableHeatingOptions}
        onAddCustomHeatingOption={(option: string) => handleAddCustomOption('heatingOptions', option)}
        onRemoveCustomHeatingOption={(option: string) => handleRemoveCustomOption('heatingOptions', option, HEATING_OPTIONS)}

        availableYearBuiltOptions={availableYearBuiltOptions}
        onAddCustomYearBuiltOption={(option: string) => handleAddCustomOption('yearBuiltOptions', option)}
        onRemoveCustomYearBuiltOption={(option: string) => handleRemoveCustomOption('yearBuiltOptions', option, YEAR_BUILT_OPTIONS)}

        availableWallTypeOptions={availableWallTypeOptions}
        onAddCustomWallTypeOption={(option: string) => handleAddCustomOption('wallTypeOptions', option)}
        onRemoveCustomWallTypeOption={(option: string) => handleRemoveCustomOption('wallTypeOptions', option, WALL_TYPE_OPTIONS)}

        availableBathroomOptions={availableBathroomOptions}
        onAddCustomBathroomOption={(option: string) => handleAddCustomOption('bathroomOptions', option)}
        onRemoveCustomBathroomOption={(option: string) => handleRemoveCustomOption('bathroomOptions', option, BATHROOM_OPTIONS)}

        availableLandTypes={availableLandTypes}
        onAddCustomLandType={(option: string) => handleAddCustomOption('landTypes', option)}
        onRemoveCustomLandType={(option: string) => handleRemoveCustomOption('landTypes', option, LAND_TYPES)}

        availableDealTypeOptions={availableDealTypeOptions}
        onAddCustomDealTypeOption={(option: string) => handleAddCustomOption('dealTypeOptions', option)}
        onRemoveCustomDealTypeOption={(option: string) => handleRemoveCustomOption('dealTypeOptions', option, DEAL_TYPE_OPTIONS)}

        availablePlanningStatusOptions={availablePlanningStatusOptions}
        onAddCustomPlanningStatusOption={(option: string) => handleAddCustomOption('planningStatusOptions', option)}
        onRemoveCustomPlanningStatusOption={(option: string) => handleRemoveCustomOption('planningStatusOptions', option, PLANNING_STATUS_OPTIONS)}

        availableHouseTypes={availableHouseTypes}
        onAddCustomHouseType={(option: string) => handleAddCustomOption('houseTypes', option)}
        onRemoveCustomHouseType={(option: string) => handleRemoveCustomOption('houseTypes', option, HOUSE_TYPES_EXTENDED)}

        availableTechOptions={availableTechOptions} 
        onAddCustomTechOption={(option: string) => handleAddCustomOption('techOptions', option)}
        onRemoveCustomTechOption={(option: string) => handleRemoveCustomOption('techOptions', option, TECH_OPTIONS)} 
        availableComfortOptions={availableComfortOptions}
        onAddCustomComfortOption={(option: string) => handleAddCustomOption('comfortOptions', option)}
        onRemoveCustomComfortOption={(option: string) => handleRemoveCustomOption('comfortOptions', option, COMFORT_OPTIONS)} 
        availableCommOptions={availableCommOptions}
        onAddCustomCommOption={(option: string) => handleAddCustomOption('commOptions', option)}
        onRemoveCustomCommOption={(option: string) => handleRemoveCustomOption('commOptions', option, COMM_OPTIONS)} 
        availableInfraOptions={availableInfraOptions}
        onAddCustomInfraOption={(option: string) => handleAddCustomOption('infraOptions', option)}
        onRemoveCustomInfraOption={(option: string) => handleRemoveCustomOption('infraOptions', option, INFRA_OPTIONS)}
        
        // Новые пропсы для земельных участков
        availableLandCommunicationsOptions={availableLandCommunicationsOptions}
        onAddCustomLandCommunicationsOption={(option: string) => handleAddCustomOption('landCommunicationsOptions', option)}
        onRemoveCustomLandCommunicationsOption={(option: string) => handleRemoveCustomOption('landCommunicationsOptions', option, LAND_COMMUNICATIONS_OPTIONS)}
        
        availableLandStructuresOptions={availableLandStructuresOptions}
        onAddCustomLandStructuresOption={(option: string) => handleAddCustomOption('landStructuresOptions', option)}
        onRemoveCustomLandStructuresOption={(option: string) => handleRemoveCustomOption('landStructuresOptions', option, LAND_STRUCTURES_OPTIONS)}
        
        availableLandInfrastructureOptions={availableLandInfrastructureOptions}
        onAddCustomLandInfrastructureOption={(option: string) => handleAddCustomOption('landInfrastructureOptions', option)}
        onRemoveCustomLandInfrastructureOption={(option: string) => handleRemoveCustomOption('landInfrastructureOptions', option, LAND_INFRASTRUCTURE_OPTIONS)}
        
        availableLandLandscapeOptions={availableLandLandscapeOptions}
        onAddCustomLandLandscapeOption={(option: string) => handleAddCustomOption('landLandscapeOptions', option)}
        onRemoveCustomLandLandscapeOption={(option: string) => handleRemoveCustomOption('landLandscapeOptions', option, LAND_LANDSCAPE_OPTIONS)}
      />
    </div>
  );
};

export default App;