import { PropertyCategory } from './types'; // Импортируем PropertyCategory

export const ROOMS_OPTIONS = ['Студия', '1', '2', '3', '4', '5+'];

export const LAND_TYPES: string[] = []; // Теперь пустой массив для настраиваемых типов

export const REPAIR_TYPES: string[] = []; // Теперь пустой массив

export const HOUSING_CLASSES: string[] = []; // Теперь пустой массив

export const HEATING_OPTIONS: string[] = []; // Теперь пустой массив

export const TECH_OPTIONS: string[] = []; // Теперь пустой массив

export const COMFORT_OPTIONS: string[] = []; // Теперь пустой массив

export const COMM_OPTIONS: string[] = []; // Теперь пустой массив

export const INFRA_OPTIONS: string[] = []; // Теперь пустой массив

// Новые константы для земельных участков
export const LAND_COMMUNICATIONS_OPTIONS: string[] = []; // Пустой массив для настраиваемых коммуникаций
export const LAND_STRUCTURES_OPTIONS: string[] = []; // Пустой массив для настраиваемых сооружений
export const LAND_INFRASTRUCTURE_OPTIONS: string[] = []; // Пустой массив для настраиваемой инфраструктуры
export const LAND_LANDSCAPE_OPTIONS: string[] = []; // Пустой массив для настраиваемого ландшафта

export const HOUSE_TYPES_EXTENDED = [
  'Клубный дом', 'Коттедж', 'Дача', 'Дуплекс', 'Дом', 'Часть дома', 'Модульные дома', 'Таунхаус'
] as const;

// Новые константы для квартир - будут заполняться вручную через плюсик
export const DEAL_TYPE_OPTIONS: string[] = [];
export const PLANNING_STATUS_OPTIONS: string[] = [];
export const YEAR_BUILT_OPTIONS: string[] = [];

export const LOCATION_TYPES = ['В городе', 'За городом'] as const;

export const CATEGORIES: Array<{ id: PropertyCategory; label: string }> = [
  { id: 'apartments', label: 'Квартиры' },
  { id: 'houses', label: 'Дома' },
  { id: 'commercial', label: 'Коммерция' },
  { id: 'land', label: 'Земельные участки' },
];

export const INITIAL_DISTRICTS = [
  'Приморский', 'Малиновский', 'Суворовский', 'Киевский'
];

export const WALL_TYPE_OPTIONS: string[] = []; // Теперь пустой массив

export const BATHROOM_OPTIONS: string[] = []; // Теперь пустой массив