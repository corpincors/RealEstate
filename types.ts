export type PropertyCategory = 'apartments' | 'houses' | 'commercial' | 'land';

export interface Property {
  id: string;
  category: PropertyCategory;
  type: 'Secondary' | 'New Build' | 'Construction';
  status: 'available' | 'sold' | 'advance';
  price: number;
  district: string;
  address: string;
  ownerPhone: string;
  floor?: number;
  totalFloors?: number;
  rooms: string;
  totalArea: number;
  kitchenArea?: number;
  landArea?: number;
  // houseType: string; // Удалено поле Тип дома
  housingClass: string;
  hasFurniture: boolean;
  hasRepair: boolean;
  repairType: string;
  heating: string;
  tech: string[];
  comfort: string[];
  comm: string[];
  infra: string[];
  isEOselya: boolean;
  landType?: string;
  houseSubtype?: 'Клубный дом' | 'Коттедж' | 'Дача' | 'Дуплекс' | 'Дом' | 'Часть дома' | 'Модульные дома' | 'Таунхаус'; // Обновленный тип
  locationType?: 'inCity' | 'outsideCity'; // Новое поле для типа местоположения
  distanceFromCityKm?: number; // Новое поле для расстояния от города
  plotArea?: number; // Новое поле: Площадь участка
  cadastralNumber?: string; // Новое поле: Кадастровый номер
  yearBuilt?: string; // Новое поле: Год постройки/сдачи
  wallType?: string; // Новое поле: Тип стен
  bathroomType?: string; // Новое поле: Тип санузла
  dealType?: string; // Новое поле: Тип сделки
  planningStatus?: string; // Новое поле: Статус планировки
  // Новые поля для земельных участков
  landCommunications?: string[]; // Коммуникации на участке
  landStructures?: string[]; // Сооружения на участке
  landInfrastructure?: string[]; // Инфраструктура до 500 метров
  landLandscape?: string[]; // Ландшафт до 1 км
  description: string;
  imageUrls: string[];
  publicLink?: string; // Added field for the public client link
}

export interface FilterState {
  category: PropertyCategory;
  status: 'available' | 'sold' | 'advance' | 'all';
  district: string[];
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minKitchenArea: string;
  maxKitchenArea: string;
  minFloor: string;
  maxFloor: string;
  minTotalFloors: string;
  maxTotalFloors: string;
  rooms: string;
  type: string;
  // houseType: string; // Удалено поле Тип дома
  housingClass: string[];
  hasFurniture: boolean | null;
  hasRepair: boolean | null;
  repairType: string[];
  heating: string[];
  isEOselya: boolean | null;
  landType: string[];
  minLandArea: string;
  maxLandArea: string;
  houseSubtype: string[]; // Добавлено поле для фильтрации по типу дома
  locationType: string; // Добавлено поле для фильтрации по типу местоположения
  distanceFromCityKm: string; // Изменено на одно поле для фильтрации по расстоянию от города
  yearBuilt: string[]; // Добавлено поле для фильтрации по году постройки
  wallType: string[]; // Добавлено поле для фильтрации по типу стен
  bathroomType: string[]; // Новое поле: Тип санузла
  dealType: string[]; // Новое поле: Тип сделки
  planningStatus: string[]; // Новое поле: Статус планировки
  tech: string[];
  comfort: string[];
  comm: string[];
  infra: string[];
  // Новые поля для фильтрации земельных участков
  landCommunications: string[]; // Коммуникации на участке
  landStructures: string[]; // Сооружения на участке
  landInfrastructure: string[]; // Инфраструктура до 500 метров
  landLandscape: string[]; // Ландшафт до 1 км
  keywords: string; // Добавлено поле для поиска по ключевым словам
}

export interface Client {
  id: string;
  clientName?: string; // Добавлено поле для имени клиента
  phoneNumber: string;
  lastCalled: string; // ISO date string
  request: string;
}