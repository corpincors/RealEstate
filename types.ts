
export type PropertyCategory = 'apartments' | 'cottage' | 'townhouse' | 'commercial' | 'land';

export interface Property {
  id: string;
  category: PropertyCategory;
  type: 'Secondary' | 'New Build' | 'Construction';
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
  houseType: string;
  housingClass: 'Эконом' | 'Комфорт' | 'Бизнес' | 'Элит';
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
  description: string;
  imageUrls: string[];
}

export interface FilterState {
  category: PropertyCategory;
  district: string;
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
  houseType: string;
  housingClass: string;
  hasFurniture: boolean | null;
  hasRepair: boolean | null;
  repairType: string;
  heating: string;
  isEOselya: boolean | null;
  landType: string;
  minLandArea: string;
  maxLandArea: string;
  tech: string[];
  comfort: string[];
  comm: string[];
  infra: string[];
}
