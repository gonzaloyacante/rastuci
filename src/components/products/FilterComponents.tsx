// Re-exports from modular filter components — maintained for backward compatibility
export type { FilterOption, FilterGroup, ActiveFilters } from "./filters/FilterTypes";
export { SORT_OPTIONS, COLOR_MAP, getColorHex } from "./filters/FilterConstants";
export { useFilterHandlers } from "./filters/useFilterHandlers";
export { CheckboxOption, ColorOption, RadioOption, PriceRangeInput } from "./filters/FilterOptions";
export { FilterGroupSection } from "./filters/FilterGroupSection";
export { ActiveFiltersBadges } from "./filters/ActiveFiltersBadges";
export { MobileFiltersModal } from "./filters/MobileFiltersModal";
