export interface Station {
  id: string;
  name: string;
  city: string;
  type: string;
}

export interface PraesidiumWithDetails extends Station {
  reviere: Station[];
  isExpanded: boolean;
  selectedCount: number;
}

export interface CustomAddress {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
}

export interface TabConfig {
  id: 'stations' | 'custom';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

export interface FormData {
  name: string;
  street: string;
  zipCode: string;
  city: string;
}

export type ViewType = 'grid' | 'list' | 'map'; 