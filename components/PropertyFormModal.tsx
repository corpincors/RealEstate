import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import { X, Home, Layers, Camera, Plus, Phone } from './Icons';
import MultiSelect from './MultiSelect';
import SingleSelectWithDelete from './SingleSelectWithDelete';
import { 
  LAND_TYPES, HOUSE_TYPES, REPAIR_TYPES, HOUSING_CLASSES,
  HEATING_OPTIONS, TECH_OPTIONS, COMFORT_OPTIONS, COMM_OPTIONS, INFRA_OPTIONS,
  INITIAL_DISTRICTS, HOUSE_TYPES_EXTENDED // Удален LOCATION_TYPES
} from '../constants.tsx';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  editingProperty: Property | null;
  availableDistricts: string[];
  onRemoveCustomDistrict: (district: string) => void;
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingProperty,
  availableDistricts,
  onRemoveCustomDistrict
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Property>>({
    category: 'apartments',
    type: 'Secondary',
    price: 0,
    district: '',
    address: '',
    ownerPhone: '',
    totalArea: 0,
    rooms: '1',
    houseType: HOUSE_TYPES[0],
    housingClass: 'Комфорт',
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
    houseSubtype: HOUSE_TYPES_EXTENDED[0], // Инициализация нового поля
    locationType: 'inCity', // Инициализация нового поля
    distanceFromCityKm: undefined // Инициализация нового поля
  });

  useEffect(() => {
    if (editingProperty) {
      setFormData(editingProperty);
    } else if (isOpen) {
      setFormData({
        category: 'apartments',
        type: 'Secondary',
        price: 0,
        district: '',
        address: '',
        ownerPhone: '',
        totalArea: 0,
        rooms: '1',
        houseType: HOUSE_TYPES[0],
        housingClass: 'Комфорт',
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
        houseSubtype: HOUSE_TYPES_EXTENDED[0], // Сброс для нового объекта
        locationType: 'inCity', // Сброс для нового объекта
        distanceFromCityKm: undefined // Сброс для нового объекта
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
      category: newCategory as Property['category'], // Убедимся, что тип корректен
      houseSubtype: newCategory === 'houses' ? HOUSE_TYPES_EXTENDED[0] : undefined, // Сброс или установка подкатегории
      locationType: newCategory === 'houses' ? 'inCity' : undefined, // Сброс или установка типа местоположения
      distanceFromCityKm: newCategory === 'houses' ? undefined : undefined // Сброс расстояния
    }));
  };

  const handleLocationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocationType: Property['locationType'] = e.target.value === 'В городе' ? 'inCity' : 'outsideCity';
    setFormData(prev => ({ 
      ...prev, 
      locationType: newLocationType,
      distanceFromCityKm: newLocationType === 'inCity' ? undefined : prev.distanceFromCityKm // Сброс расстояния, если "В городе"
    }));
  };

  const handleDistrictChange = (value: string) => {
    setFormData(prev => ({ ...prev, district: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(readers);
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
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[3rem] overflow-y-auto relative custom-scrollbar animate-in zoom-in-95 duration-300">
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
                  <img src={url} className="w-full h-full object-cover" alt="" />
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
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Категория</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleCategoryChange} // Используем новый обработчик
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
              >
                <option value="apartments">Квартиры</option>
                <option value="houses">Дома</option>
                <option value="commercial">Коммерция</option>
                <option value="land">Земельные участки</option>
              </select>
            </div>

            {isHouses && ( // New location fields for 'houses' category
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
            )}

            <SingleSelectWithDelete
              label="Район"
              options={availableDistricts}
              initialOptions={INITIAL_DISTRICTS}
              selected={formData.district || ''}
              onChange={handleDistrictChange}
              onRemoveOption={onRemoveCustomDistrict}
            />

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Площадь земли (сот.)</label>
                  <input type="number" name="landArea" value={formData.landArea || ''} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Тип земли</label>
                  <select name="landType" value={formData.landType || ''} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold">
                    {LAND_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
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
                {isHouses && ( // Поле для типа дома
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Тип дома</label>
                    <select 
                      name="houseSubtype" 
                      value={formData.houseSubtype || ''} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold"
                    >
                      {HOUSE_TYPES_EXTENDED.map((t: string) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Комнат</label>
                  <input 
                    type="number"
                    name="rooms"
                    // Если formData.rooms - нечисловое значение ('Студия', '5+'), отображаем пустую строку
                    value={['Студия', '5+'].includes(formData.rooms || '') ? '' : formData.rooms}
                    onChange={handleChange}
                    placeholder="Количество комнат"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
                    min="1" // Минимальное количество комнат
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
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Тип дома</label>
                  <select name="houseType" value={formData.houseType} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                    {HOUSE_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Класс жилья</label>
                  <select name="housingClass" value={formData.housingClass} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                    {HOUSING_CLASSES.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Вид ремонта</label>
                  <select name="repairType" value={formData.repairType} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                    {REPAIR_TYPES.map((r: string) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Отопление</label>
                  <select name="heating" value={formData.heating} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-bold">
                    {HEATING_OPTIONS.map((h: string) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            )}
            
            {formData.locationType === 'outsideCity' && isHouses && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Расстояние от города (км)</label>
                  <input 
                    type="number"
                    name="distanceFromCityKm"
                    value={formData.distanceFromCityKm || ''}
                    onChange={handleChange}
                    placeholder="Например, 10"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
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
                    {/* FIX: Corrected malformed div element */}
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
                <MultiSelect 
                  label="Бытовая техника" 
                  prefix="Выбрано" 
                  options={TECH_OPTIONS} 
                  selected={formData.tech || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, tech: s}))} 
                />
                <MultiSelect 
                  label="Комфорт" 
                  prefix="Выбрано" 
                  options={COMFORT_OPTIONS} 
                  selected={formData.comfort || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, comfort: s}))} 
                />
                <MultiSelect 
                  label="Коммуникации" 
                  prefix="Выбрано" 
                  options={COMM_OPTIONS} 
                  selected={formData.comm || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, comm: s}))} 
                />
                <MultiSelect 
                  label="Инфраструктура" 
                  prefix="Выбрано" 
                  options={INFRA_OPTIONS} 
                  selected={formData.infra || []} 
                  onChange={(s: string[]) => setFormData(p => ({...p, infra: s}))} 
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