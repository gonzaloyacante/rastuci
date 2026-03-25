// Re-exports from modular filter components — maintained for backward compatibility
export { ActiveFiltersBadges } from "./ActiveFiltersBadges";
export { COLOR_MAP, getColorHex, SORT_OPTIONS } from "./FilterConstants";
export { FilterGroupSection } from "./FilterGroupSection";
export {
  CheckboxOption,
  ColorOption,
  PriceRangeInput,
  RadioOption,
} from "./FilterOptions";
export type { ActiveFilters, FilterGroup, FilterOption } from "./FilterTypes";
export { MobileFiltersModal } from "./MobileFiltersModal";
export { useFilterHandlers } from "./useFilterHandlers";
