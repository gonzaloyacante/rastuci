// Re-exports from modular filter components — maintained for backward compatibility
export { ActiveFiltersBadges } from "./filters/ActiveFiltersBadges";
export {
  COLOR_MAP,
  getColorHex,
  SORT_OPTIONS,
} from "./filters/FilterConstants";
export { FilterGroupSection } from "./filters/FilterGroupSection";
export {
  CheckboxOption,
  ColorOption,
  PriceRangeInput,
  RadioOption,
} from "./filters/FilterOptions";
export type {
  ActiveFilters,
  FilterGroup,
  FilterOption,
} from "./filters/FilterTypes";
export { MobileFiltersModal } from "./filters/MobileFiltersModal";
export { useFilterHandlers } from "./filters/useFilterHandlers";
