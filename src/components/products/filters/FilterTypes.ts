export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range" | "color" | "size";
  icon: React.ReactNode;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ActiveFilters {
  [key: string]: string[] | number[] | string;
}
