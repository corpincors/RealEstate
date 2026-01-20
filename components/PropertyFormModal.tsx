import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import { X, Home, Layers, Camera, Plus, Phone } from './Icons';
import EditableMultiSelect from './EditableMultiSelect';
import EditableSingleSelect from './EditableSingleSelect'; // Используем переименованный компонент
import { 
  REPAIR_TYPES, HOUSING_CLASSES,
  HEATING_OPTIONS, TECH_OPTIONS, COMFORT_OPTIONS, COMM_OPTIONS, INFRA_OPTIONS,
  HOUSE_TYPES_EXTENDED, YEAR_BUILT_OPTIONS, WALL_TYPE_OPTIONS, BATHROOM_OPTIONS, DEAL_TYPE_OPTIONS, PLANNING_STATUS_OPTIONS,
  // Новые константы для земельных участков
  LAND_COMMUNICATIONS_OPTIONS, LAND_STRUCTURES_OPTIONS, LAND_INFRASTRUCTURE_OPTIONS, LAND_LANDSCAPE_OPTIONS
} from '../constants.tsx';
import { API_BASE_URL } from '../src/config';
import { getImageUrl } from '../src/utils/image';
import { compressImage } from '../src/utils/imageCompression';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  editingProperty: Property | null;

  availableDistricts: string[];
  onAddCustomDistrict: (option: string) => void;
  onRemoveCustomDistrict: (district: string) => void;

  availableHousingClasses: string[];
  onAddCustomHousingClass: (option: string) => void;
  onRemoveCustomHousingClass: (option: string) => void;

  availableRepairTypes: string[];
  onAddCustomRepairType: (option: string) => void;
  onRemoveCustomRepairType: (option: string) => void;

  availableHeatingOptions: string[];
  onAddCustomHeatingOption: (option: string) => void;
  onRemoveCustomHeatingOption: (option: string) => void;

  availableYearBuiltOptions: string[];
  onAddCustomYearBuiltOption: (option: string) => void;
  onRemoveCustomYearBuiltOption: (option: string) => void;

  availableWallTypeOptions: string[];
  onAddCustomWallTypeOption: (option: string) => void;
  onRemoveCustomWallTypeOption: (option: string) => void;

  availableBathroomOptions: string[];
  onAddCustomBathroomOption: (option: string) => void;
  onRemoveCustomBathroomOption: (option: string) => void;

  availableLandTypes: string[];
  onAddCustomLandType: (option: string) => void;
  onRemoveCustomLandType: (option: string) => void;

  availableDealTypeOptions: string[];
  onAddCustomDealTypeOption: (option: string) => void;
  onRemoveCustomDealTypeOption: (option: string) => void;

  availablePlanningStatusOptions: string[];
  onAddCustomPlanningStatusOption: (option: string) => void;
  onRemoveCustomPlanningStatusOption: (option: string) => void;

  availableHouseTypes: string[];
  onAddCustomHouseType: (option: string) => void;
  onRemoveCustomHouseType: (option: string) => void;

  availableComfortOptions: string[];
  onAddCustomComfortOption: (option: string) => void;
  onRemoveCustomComfortOption: (option: string) => void;

  availableTechOptions: string[];
  onAddCustomTechOption: (option: string) => void;
  onRemoveCustomTechOption: (option: string) => void;
  
  availableCommOptions: string[];
  onAddCustomCommOption: (option: string) => void;
  onRemoveCustomCommOption: (option: string) => void;
  
  availableInfraOptions: string[];
  onAddCustomInfraOption: (option: string) => void;
  onRemoveCustomInfraOption: (option: string) => void;
  
  // Новые пропсы для земельных участков
  availableLandCommunicationsOptions: string[];
  onAddCustomLandCommunicationsOption: (option: string) => void;
  onRemoveCustomLandCommunicationsOption: (option: string) => void;
  
  availableLandStructuresOptions: string[];
  onAddCustomLandStructuresOption: (option: string) => void;
  onRemoveCustomLandStructuresOption: (option: string) => void;
  
  availableLandInfrastructureOptions: string[];
  onAddCustomLandInfrastructureOption: (option: string) => void;
  onRemoveCustomLandInfrastructureOption: (option: string) => void;
  
  availableLandLandscapeOptions: string[];
  onAddCustomLandLandscapeOption: (option: string) => void;
  onRemoveCustomLandLandscapeOption: (option: string) => void;
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingProperty,
  availableDistricts,
  onAddCustomDistrict,
  onRemoveCustomDistrict,
  availableHousingClasses,
  onAddCustomHousingClass,
  onRemoveCustomHousingClass,
  availableRepairTypes,
  onAddCustomRepairType,
  onRemoveCustomRepairType,
  availableHeatingOptions,
  onAddCustomHeatingOption,
  onRemoveCustomHeatingOption,
  availableYearBuiltOptions,
  onAddCustomYearBuiltOption,
  onRemoveCustomYearBuiltOption,
  availableWallTypeOptions,
  onAddCustomWallTypeOption,
  onRemoveCustomWallTypeOption,
  availableBathroomOptions,
  onAddCustomBathroomOption,
  onRemoveCustomBathroomOption,
  availableLandTypes,
  onAddCustomLandType,
  onRemoveCustomLandType,
  availableDealTypeOptions,
  onAddCustomDealTypeOption,
  onRemoveCustomDealTypeOption,
  availablePlanningStatusOptions,
  onAddCustomPlanningStatusOption,
  onRemoveCustomPlanningStatusOption,
  availableHouseTypes,
  onAddCustomHouseType,
  onRemoveCustomHouseType,
  availableComfortOptions,
  onAddCustomComfortOption,
  onRemoveCustomComfortOption,
  availableTechOptions,
  onAddCustomTechOption,
  onRemoveCustomTechOption,
  availableCommOptions,
  onAddCustomCommOption,
  onRemoveCustomCommOption,
  availableInfraOptions,
  onAddCustomInfraOption,
  onRemoveCustomInfraOption,
  // Новые пропсы для земельных участков
  availableLandCommunicationsOptions,
  onAddCustomLandCommunicationsOption,
  onRemoveCustomLandCommunicationsOption,
  
  availableLandStructuresOptions,
  onAddCustomLandStructuresOption,
  onRemoveCustomLandStructuresOption,
  
  availableLandInfrastructureOptions,
  onAddCustomLandInfrastructureOption,
  onRemoveCustomLandInfrastructureOption,
  
  availableLandLandscapeOptions,
  onAddCustomLandLandscapeOption,
  onRemoveCustomLandLandscapeOption,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Property>>({
    category: 'apartments',
    type: 'Secondary',
    status: 'available',
    price: 0,
    district: '',
    address: '',
    ownerPhone: '',
    totalArea: 0,
    rooms: '1',
    housingClass: HOUSING_CLASSES[0], // Используем первую опцию из констант
    hasFurniture: false,
    hasRepair: false,
    repairType: REPAIR_TYPES[0],
    heating: HEATING_OPTIONS[0],
    tech: [],
    comfort: [],
    comm: [],
    infra: [],
    isEOselya: false,
    description: '',
    imageUrls: [],
    houseSubtype: HOUSE_TYPES_EXTENDED[0],
    locationType: 'inCity',
    distanceFromCityKm: undefined,
    plotArea: undefined,
    cadastralNumber: '',
    yearBuilt: YEAR_BUILT_OPTIONS[0], // Используем первую опцию из констант
    wallType: WALL_TYPE_OPTIONS[0],   // Используем первую опцию из констант
    bathroomType: BATHROOM_OPTIONS[0], // Используем первую опцию из констант
    // Новые поля для земельных участков
    landCommunications: [],
    landStructures: [],
    landInfrastructure: [],
    landLandscape: [],
  });

  useEffect(() => {
    if (editingProperty) {
      setFormData(editingProperty);
    } else if (isOpen) {
      setFormData({
        category: 'apartments',
        type: 'Secondary',
        status: 'available',
        price: 0,
        district: '',
        address: '',
        ownerPhone: '',
        totalArea: 0,
        rooms: '1',
        housingClass: availableHousingClasses[0] || HOUSING_CLASSES[0],
        hasFurniture: false,
        hasRepair: false,
        repairType: availableRepairTypes[0] || REPAIR_TYPES[0],
        heating: availableHeatingOptions[0] || HEATING_OPTIONS[0],
        tech: [],
        comfort: [],
        comm: [],
        infra: [],
        isEOselya: false,
        description: '',
        imageUrls: [],
        houseSubtype: HOUSE_TYPES_EXTENDED[0],
        locationType: 'inCity',
        distanceFromCityKm: undefined,
        plotArea: undefined,
        cadastralNumber: '',
        yearBuilt: availableYearBuiltOptions[0] || YEAR_BUILT_OPTIONS[0],
        wallType: availableWallTypeOptions[0] || WALL_TYPE_OPTIONS[0],
        bathroomType: availableBathroomOptions[0] || BATHROOM_OPTIONS[0],
        // Новые поля для земельных участков
        landCommunications: [],
        landStructures: [],
        landInfrastructure: [],
        landLandscape: [],
      });
    }
  }, [editingProperty, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let val: string | number | boolean | undefined = value;

    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (name === 'rooms') {
      val = String(value);
    } else if (type === 'number') {
      val = Number(value);
      if (isNaN(val)) val = undefined; // Handle empty number input
    }
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      category: newCategory as Property['category'],
      houseSubtype: newCategory === 'houses' ? HOUSE_TYPES_EXTENDED[0] : undefined,
      locationType: (newCategory === 'houses' || newCategory === 'land') ? 'inCity' : undefined,
      distanceFromCityKm: newCategory === 'houses' ? undefined : undefined,
      plotArea: newCategory === 'houses' ? undefined : undefined,
      cadastralNumber: newCategory === 'houses' ? '' : undefined,
      yearBuilt: newCategory === 'land' ? undefined : (availableYearBuiltOptions[0] || YEAR_BUILT_OPTIONS[0]),
      wallType: newCategory === 'land' ? undefined : (availableWallTypeOptions[0] || WALL_TYPE_OPTIONS[0]),
      bathroomType: newCategory === 'land' ? undefined : (availableBathroomOptions[0] || BATHROOM_OPTIONS[0]),
    }));
  };

  const handleLocationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocationType: Property['locationType'] = e.target.value === 'В городе' ? 'inCity' : 'outsideCity';
    setFormData(prev => ({ 
      ...prev, 
      locationType: newLocationType,
      distanceFromCityKm: newLocationType === 'inCity' ? undefined : prev.distanceFromCityKm
    }));
  };

  const handleDistrictChange = (value: string) => {
    setFormData(prev => ({ ...prev, district: value }));
  };

  const handleYearBuiltChange = (value: string) => {
    setFormData(prev => ({ ...prev, yearBuilt: value }));
  };

  const handleWallTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, wallType: value }));
  };

  const handleBathroomTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, bathroomType: value }));
  };

  const handleHousingClassChange = (value: string) => {
    setFormData(prev => ({ ...prev, housingClass: value }));
  };

  const handleRepairTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, repairType: value }));
  };

  const handleHeatingChange = (value: string) => {
    setFormData(prev => ({ ...prev, heating: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file: File) => {
      try {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append('image', compressedFile);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
           method: 'POST',
           body: formData
        });
        
        if (!response.ok) {
          console.error(`Upload failed for file ${file.name}`);
          return null;
        }
        
        const data = await response.json();
        return data.url; 
      } catch (err) {
        console.error("Error uploading file:", err);
        return null;
      }
    });

    const results = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
    
    setFormData(prev => ({ 
      ...prev, 
      imageUrls: [...(prev.imageUrls || []), ...results] 
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, imageUrls: (prev.imageUrls || []).filter((_: string, i: number) => i !== index) }));
  };

  const handleToggle = (name: keyof Property) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.district) {
      alert('Пожалуйста, укажите район');
      return;
    }
    const newProperty: Property = {
      ...formData as Property,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      imageUrls: formData.imageUrls?.length 
        ? formData.imageUrls 
        : ['data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%2275%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%209l9-7%209%207v11a2%202%200%200%201-2%202H5a2%202%200%200%201-2-2z%22%3E%3C%2Fpath%3E%3Cpolyline%20points%3D%229%2022%209%2012%2015%2012%2015%2022%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E']
    };
    onSave(newProperty);
  };

  const isLand = formData.category === 'land';
  const isHouses = formData.category === 'houses';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-[3rem] overflow-y-auto relative custom-scrollbar animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">
              {editingProperty ? 'Редактировать объект' : 'Добавить новый объект'}
            </h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Детальные характеристики CRM</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* PHOTO UPLOAD SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-slate-900">
              <Camera className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-widest">Фотографии объекта</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.imageUrls?.map((url: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group shadow-sm border border-slate-100">
                  <img src={getImageUrl(url)} className="w-full h-full object-cover" alt="" />
                  <button 
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              
              <button 
                type="button"
                onClick={triggerFileInput}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition group"
              >
                <div className="bg-slate-50 group-hover:bg-blue-100 p-3 rounded-xl transition">
                   <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">Галерея</span>
              </button>
            </div>
          </section>

          {/* BASIC INFO */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Категория</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
              >
                <option value="apartments">Квартиры</option>
                <option value="houses">Дома</option>
                <option value="commercial">Коммерция</option>
                <option value="land">Земельные участки</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Статус</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
              >
                <option value="available">Актуально</option>
                <option value="sold">Продано</option>
                <option value="advance">Аванс</option>
              </select>
            </div>

            {(isHouses || isLand) && (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Расположение</label>
                  <select 
                    name="locationType"
                    value={formData.locationType === 'inCity' ? 'В городе' : 'За городом'}
                    onChange={handleLocationTypeChange}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                  >
                    <option value="В городе">В городе</option>
                    <option value="За городом">За городом</option>
                  </select>
                </div>
                {formData.locationType === 'outsideCity' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">От города (км)</label>
                    <input 
                      type="number"
                      name="distanceFromCityKm"
                      value={formData.distanceFromCityKm || ''}
                      onChange={handleChange}
                      placeholder="Например, 10"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <EditableSingleSelect
                label="Район"
                initialOptions={availableDistricts}
                selected={formData.district || ''}
                onChange={handleDistrictChange}
                onAddCustomOption={onAddCustomDistrict}
                onRemoveOption={onRemoveCustomDistrict}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Цена ($)</label>
              <input 
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                required
              />
            </div>
          </section>

          {/* SENSITIVE / OWNER INFO */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50/50 p-8 rounded-[2.5rem]">
             <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest ml-2">Номер телефона владельца</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input 
                  type="text"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="+380 ..."
                  className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 pl-12 outline-none font-bold text-slate-700 transition shadow-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest ml-2">Точный адрес</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Улица, дом, кв..."
                  className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 pl-12 outline-none font-bold text-slate-700 transition shadow-sm"
                  required
                />
              </div>
            </div>
          </section>

          {/* DYNAMIC FIELDS BASED ON CATEGORY */}
          <section className="space-y-10">
            {isLand ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Площадь земли (сот.)</label>
                  <input type="number" name="landArea" value={formData.landArea || ''} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Кадастровый номер</label>
                  <input type="text" name="cadastralNumber" value={formData.cadastralNumber || ''} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold" />
                </div>
                <EditableSingleSelect
                  label="Тип недвижимости"
                  initialOptions={availableLandTypes}
                  selected={formData.landType || ''}
                  onChange={(value: string) => handleChange({ target: { name: 'landType', value } } as any)}
                  onAddCustomOption={onAddCustomLandType}
                  onRemoveOption={onRemoveCustomLandType}
                />
                <EditableMultiSelect 
                  label="Коммуникации"
                  prefix="Выбрано" 
                  initialOptions={availableLandCommunicationsOptions}
                  constantOptions={LAND_COMMUNICATIONS_OPTIONS}
                  selected={formData.landCommunications || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, landCommunications: s}))} 
                  onAddCustomOption={onAddCustomLandCommunicationsOption}
                  onRemoveOption={onRemoveCustomLandCommunicationsOption}
                />
                <EditableMultiSelect 
                  label="Сооружения на участке"
                  prefix="Выбрано" 
                  initialOptions={availableLandStructuresOptions}
                  constantOptions={LAND_STRUCTURES_OPTIONS}
                  selected={formData.landStructures || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, landStructures: s}))} 
                  onAddCustomOption={onAddCustomLandStructuresOption}
                  onRemoveOption={onRemoveCustomLandStructuresOption}
                />
                <EditableMultiSelect 
                  label="Инфраструктура до 500 метров"
                  prefix="Выбрано" 
                  initialOptions={availableLandInfrastructureOptions}
                  constantOptions={LAND_INFRASTRUCTURE_OPTIONS}
                  selected={formData.landInfrastructure || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, landInfrastructure: s}))} 
                  onAddCustomOption={onAddCustomLandInfrastructureOption}
                  onRemoveOption={onRemoveCustomLandInfrastructureOption}
                />
                <EditableMultiSelect 
                  label="Ландшафт до 1 км"
                  prefix="Выбрано" 
                  initialOptions={availableLandLandscapeOptions}
                  constantOptions={LAND_LANDSCAPE_OPTIONS}
                  selected={formData.landLandscape || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, landLandscape: s}))} 
                  onAddCustomOption={onAddCustomLandLandscapeOption}
                  onRemoveOption={onRemoveCustomLandLandscapeOption}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Вид объекта</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                    <option value="Secondary">Вторичка</option>
                    <option value="New Build">Новостройка</option>
                    <option value="Construction">Строящийся</option>
                  </select>
                </div>
                {isHouses && (
                  <>
                    <EditableSingleSelect
                      label="Тип дома"
                      initialOptions={availableHouseTypes}
                      selected={formData.houseSubtype || ''}
                      onChange={(value: string) => handleChange({ target: { name: 'houseSubtype', value } } as any)}
                      onAddCustomOption={onAddCustomHouseType}
                      onRemoveOption={onRemoveCustomHouseType}
                    />
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Площадь участка (сот.)</label>
                      <input 
                        type="number"
                        name="plotArea"
                        value={formData.plotArea || ''}
                        onChange={handleChange}
                        placeholder="Например, 6"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Кадастровый номер</label>
                      <input 
                        type="text"
                        name="cadastralNumber"
                        value={formData.cadastralNumber || ''}
                        onChange={handleChange}
                        placeholder="Например, 1234567890"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Комнат</label>
                  <input 
                    type="number"
                    name="rooms"
                    value={['Студия', '5+'].includes(formData.rooms || '') ? '' : formData.rooms}
                    onChange={handleChange}
                    placeholder="Количество комнат"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Этаж / Этажность</label>
                  <div className="flex gap-2">
                    <input type="number" name="floor" placeholder="7" value={formData.floor || ''} onChange={handleChange} className="w-1/2 bg-slate-50 rounded-2xl p-4 outline-none font-bold" />
                    <input type="number" name="totalFloors" placeholder="12" value={formData.totalFloors || ''} onChange={handleChange} className="w-1/2 bg-slate-50 rounded-2xl p-4 outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Общая пл. / Кухни</label>
                  <div className="flex gap-2">
                    <input type="number" name="totalArea" placeholder="85" value={formData.totalArea || ''} onChange={handleChange} className="w-1/2 bg-slate-50 rounded-2xl p-4 outline-none font-bold" required />
                    <input type="number" name="kitchenArea" placeholder="15" value={formData.kitchenArea || ''} onChange={handleChange} className="w-1/2 bg-slate-50 rounded-2xl p-4 outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Класс жилья"
                    initialOptions={availableHousingClasses}
                    selected={formData.housingClass || ''}
                    onChange={handleHousingClassChange}
                    onAddCustomOption={onAddCustomHousingClass}
                    onRemoveOption={onRemoveCustomHousingClass}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Вид ремонта"
                    initialOptions={availableRepairTypes}
                    selected={formData.repairType || ''}
                    onChange={handleRepairTypeChange}
                    onAddCustomOption={onAddCustomRepairType}
                    onRemoveOption={onRemoveCustomRepairType}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Отопление"
                    initialOptions={availableHeatingOptions}
                    selected={formData.heating || ''}
                    onChange={handleHeatingChange}
                    onAddCustomOption={onAddCustomHeatingOption}
                    onRemoveOption={onRemoveCustomHeatingOption}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Год постройки/сдачи"
                    initialOptions={availableYearBuiltOptions}
                    selected={formData.yearBuilt || ''}
                    onChange={handleYearBuiltChange}
                    onAddCustomOption={onAddCustomYearBuiltOption}
                    onRemoveOption={onRemoveCustomYearBuiltOption}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Тип стен"
                    initialOptions={availableWallTypeOptions}
                    selected={formData.wallType || ''}
                    onChange={handleWallTypeChange}
                    onAddCustomOption={onAddCustomWallTypeOption}
                    onRemoveOption={onRemoveCustomWallTypeOption}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Санузел"
                    initialOptions={availableBathroomOptions}
                    selected={formData.bathroomType || ''}
                    onChange={handleBathroomTypeChange}
                    onAddCustomOption={onAddCustomBathroomOption}
                    onRemoveOption={onRemoveCustomBathroomOption}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Тип сделки"
                    initialOptions={availableDealTypeOptions}
                    selected={formData.dealType || ''}
                    onChange={(value: string) => setFormData({...formData, dealType: value})}
                    onAddCustomOption={onAddCustomDealTypeOption}
                    onRemoveOption={onRemoveCustomDealTypeOption}
                  />
                </div>
                <div className="space-y-2">
                  <EditableSingleSelect
                    label="Планировка"
                    initialOptions={availablePlanningStatusOptions}
                    selected={formData.planningStatus || ''}
                    onChange={(value: string) => setFormData({...formData, planningStatus: value})}
                    onAddCustomOption={onAddCustomPlanningStatusOption}
                    onRemoveOption={onRemoveCustomPlanningStatusOption}
                  />
                </div>
              </div>
            )}
            
            {!isLand && (
              <div className="flex flex-wrap gap-10 py-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.hasFurniture ? 'bg-blue-600' : 'bg-slate-200'}`} onClick={() => handleToggle('hasFurniture')}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.hasFurniture ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600">Меблировка</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.hasRepair ? 'bg-indigo-600' : 'bg-slate-200'}`} onClick={() => handleToggle('hasRepair')}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.hasRepair ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-600">Ремонт</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isEOselya ? 'bg-emerald-600' : 'bg-slate-200'}`} onClick={() => handleToggle('isEOselya')}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isEOselya ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-600">єОселя</span>
                </label>
              </div>
            )}
          </section>

          {/* MULTI SELECTS */}
          {!isLand && (
            <section className="space-y-10">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="bg-emerald-50 p-2 rounded-xl"><Layers className="w-5 h-5" /></div>
                <h3 className="text-sm font-black uppercase tracking-widest">Дополнительные опции</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EditableMultiSelect 
                  label="Бытовая техника" 
                  prefix="Выбрано" 
                  initialOptions={availableTechOptions}
                  constantOptions={TECH_OPTIONS}
                  selected={formData.tech || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, tech: s}))} 
                  onAddCustomOption={onAddCustomTechOption}
                  onRemoveOption={onRemoveCustomTechOption}
                />
                <EditableMultiSelect 
                  label="Комфорт" 
                  prefix="Выбрано" 
                  initialOptions={availableComfortOptions}
                  constantOptions={COMFORT_OPTIONS}
                  selected={formData.comfort || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, comfort: s}))} 
                  onAddCustomOption={onAddCustomComfortOption}
                  onRemoveOption={onRemoveCustomComfortOption}
                />
                <EditableMultiSelect 
                  label="Коммуникации" 
                  prefix="Выбрано" 
                  initialOptions={availableCommOptions}
                  constantOptions={COMM_OPTIONS}
                  selected={formData.comm || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, comm: s}))} 
                  onAddCustomOption={onAddCustomCommOption}
                  onRemoveOption={onRemoveCustomCommOption}
                />
                <EditableMultiSelect 
                  label="Инфраструктура" 
                  prefix="Выбрано" 
                  initialOptions={availableInfraOptions}
                  constantOptions={INFRA_OPTIONS}
                  selected={formData.infra || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, infra: s}))} 
                  onAddCustomOption={onAddCustomInfraOption}
                  onRemoveOption={onRemoveCustomInfraOption}
                />
              </div>
            </section>
          )}

          <section className="space-y-4">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Описание объекта</label>
             <textarea 
               name="description"
               value={formData.description}
               onChange={handleChange}
               className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[2rem] p-6 outline-none font-medium text-slate-700 min-h-[150px] transition"
               placeholder="Опишите все преимущества объекта..."
             ></textarea>
          </section>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-[900] uppercase tracking-[0.25em] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98]"
          >
            {editingProperty ? 'Сохранить изменения' : 'Разместить в CRM'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;