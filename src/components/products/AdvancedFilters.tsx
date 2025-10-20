"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Tag,
  Palette,
  Ruler,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Tipos para filtros
interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range" | "color" | "size";
  icon: React.ReactNode;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

interface ActiveFilters {
  [key: string]: string[] | number[] | string;
}

interface Category {
  id: string;
  name: string;
  count?: number;
}

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { id: "relevance", label: "Relevancia" },
  { id: "price-asc", label: "Precio: menor a mayor" },
  { id: "price-desc", label: "Precio: mayor a menor" },
  { id: "createdAt-desc", label: "Más recientes" },
  { id: "rating-desc", label: "Mejor calificados" },
  { id: "name-asc", label: "A-Z" },
  { id: "name-desc", label: "Z-A" },
];

interface AdvancedFiltersProps {
  onFiltersChange: (filters: ActiveFilters) => void;
  onSortChange: (sort: string) => void;
  totalResults: number;
  isLoading?: boolean;
}

export default function AdvancedFilters({
  onFiltersChange,
  onSortChange,
  totalResults,
  isLoading = false,
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['category', 'price']));
  const [sortBy, setSortBy] = useState('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Obtener categorías reales de la API
  const { data: categoriesData } = useSWR('/api/categories', async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  });

  // Obtener estadísticas de productos para filtros dinámicos
  const { data: statsData } = useSWR('/api/products/stats', async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch product stats');
    return res.json();
  });

  const categories = useMemo(() => categoriesData?.data?.data || [], [categoriesData]);
  const stats = useMemo(() => statsData?.data || {}, [statsData]);

  // Construir filtros dinámicos basados en datos reales
  const buildFilterGroups = useCallback((): FilterGroup[] => {
    const groups: FilterGroup[] = [
      {
        id: "price",
        label: "Precio",
        type: "range",
        icon: <DollarSign className="w-4 h-4" />,
        min: stats.minPrice || 0,
        max: stats.maxPrice || 100000,
        step: 1000,
      }
    ];

    // Categorías dinámicas
    if (categories.length > 0) {
      groups.push({
        id: "category",
        label: "Categoría",
        type: "checkbox",
        icon: <Tag className="w-4 h-4" />,
        options: categories.map((cat: Category) => ({
          id: cat.id,
          label: cat.name,
          count: cat.count || stats.categoryCounts?.[cat.id] || 0
        }))
      });
    }

    // Tallas dinámicas si están disponibles
    if (stats.availableSizes && stats.availableSizes.length > 0) {
      groups.push({
        id: "size",
        label: "Talla",
        type: "checkbox",
        icon: <Ruler className="w-4 h-4" />,
        options: stats.availableSizes.map((size: string) => ({
          id: size,
          label: size,
          count: stats.sizeCounts?.[size] || 0
        }))
      });
    }

    // Colores dinámicos si están disponibles
    if (stats.availableColors && stats.availableColors.length > 0) {
      groups.push({
        id: "color",
        label: "Color",
        type: "color",
        icon: <Palette className="w-4 h-4" />,
        options: stats.availableColors.map((color: string) => ({
          id: color.toLowerCase(),
          label: color,
          count: stats.colorCounts?.[color] || 0,
          color: getColorHex(color)
        }))
      });
    }

    // Calificación si está disponible
    if (stats.hasRatings) {
      groups.push({
        id: "rating",
        label: "Calificación",
        type: "radio",
        icon: <Star className="w-4 h-4" />,
        options: [
          { id: "5", label: "5 estrellas", count: stats.ratingCounts?.['5'] || 0 },
          { id: "4", label: "4+ estrellas", count: stats.ratingCounts?.['4+'] || 0 },
          { id: "3", label: "3+ estrellas", count: stats.ratingCounts?.['3+'] || 0 },
          { id: "2", label: "2+ estrellas", count: stats.ratingCounts?.['2+'] || 0 },
        ]
      });
    }

    return groups;
  }, [categories, stats]);

  // Función para obtener color hex basado en nombre
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'rosa': '#ec4899',
      'pink': '#ec4899',
      'azul': '#3b82f6',
      'blue': '#3b82f6',
      'blanco': '#ffffff',
      'white': '#ffffff',
      'negro': '#000000',
      'black': '#000000',
      'amarillo': '#eab308',
      'yellow': '#eab308',
      'verde': '#22c55e',
      'green': '#22c55e',
      'rojo': '#ef4444',
      'red': '#ef4444',
      'morado': '#a855f7',
      'purple': '#a855f7',
      'naranja': '#f97316',
      'orange': '#f97316',
      'gris': '#6b7280',
      'gray': '#6b7280',
    };
    
    return colorMap[colorName.toLowerCase()] || '#6b7280';
  };

  const FILTER_GROUPS = buildFilterGroups();

  // Inicializar filtros desde URL
  useEffect(() => {
    const filters: ActiveFilters = {};
    
    // Extraer filtros de la URL
    FILTER_GROUPS.forEach(group => {
      const param = searchParams.get(group.id);
      if (param) {
        if (group.type === 'range') {
          const [min, max] = param.split('-').map(Number);
          filters[group.id] = [min || group.min || 0, max || group.max || 100];
        } else if (group.type === 'radio') {
          filters[group.id] = param;
        } else {
          filters[group.id] = param.split(',');
        }
      }
    });

    const sort = searchParams.get('sort') || 'relevance';
    setSortBy(sort);
    setActiveFilters(filters);
  }, [searchParams, FILTER_GROUPS]);

  // Actualizar URL cuando cambian los filtros
  const updateURL = useCallback((newFilters: ActiveFilters, newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Limpiar parámetros de filtros existentes
    FILTER_GROUPS.forEach(group => {
      params.delete(group.id);
    });
    params.delete('sort');

    // Agregar nuevos filtros
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === 'number') {
          // Para rangos
          params.set(key, value.join('-'));
        } else {
          // Para checkboxes
          params.set(key, value.join(','));
        }
      } else if (typeof value === 'string' && value) {
        // Para radio buttons
        params.set(key, value);
      }
    });

    if (newSort !== 'relevance') {
      params.set('sort', newSort);
    }

    // Mantener búsqueda si existe
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }

    router.push(`/productos?${params.toString()}`);
  }, [router, searchParams, FILTER_GROUPS]);

  // Manejar cambio de filtros
  const handleFilterChange = (groupId: string, value: string | number[], checked?: boolean) => {
    const newFilters = { ...activeFilters };
    const group = FILTER_GROUPS.find(g => g.id === groupId);

    if (!group) return;

    if (group.type === 'checkbox') {
      const currentValues = (newFilters[groupId] as string[]) || [];
      if (checked) {
        newFilters[groupId] = [...currentValues, value as string];
      } else {
        newFilters[groupId] = currentValues.filter(v => v !== value);
      }
    } else if (group.type === 'radio') {
      newFilters[groupId] = value as string;
    } else if (group.type === 'range') {
      newFilters[groupId] = value as number[];
    }

    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
    updateURL(newFilters, sortBy);
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    onSortChange(newSort);
    updateURL(activeFilters, newSort);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
    updateURL({}, sortBy);
  };

  // Limpiar filtro específico
  const clearFilter = (groupId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[groupId];
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
    updateURL(newFilters, sortBy);
  };

  // Toggle grupo expandido
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Contar filtros activos
  const activeFilterCount = Object.values(activeFilters).filter(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  ).length;

  // Renderizar opción de checkbox
  const renderCheckboxOption = (groupId: string, option: FilterOption) => {
    const isChecked = ((activeFilters[groupId] as string[]) || []).includes(option.id);
    
    return (
      <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleFilterChange(groupId, option.id, e.target.checked)}
          className="w-4 h-4 text-primary border-2 border-surface-secondary rounded focus:ring-2 focus:ring-pink-500"
        />
        <span className="flex-1 text-sm text-primary group-hover:text-pink-600 transition-colors">
          {option.label}
        </span>
        {option.count && option.count > 0 && (
          <span className="text-xs muted">({option.count})</span>
        )}
      </label>
    );
  };

  // Renderizar opción de color
  const renderColorOption = (groupId: string, option: FilterOption) => {
    const isChecked = ((activeFilters[groupId] as string[]) || []).includes(option.id);
    
    return (
      <button
        key={option.id}
        onClick={() => handleFilterChange(groupId, option.id, !isChecked)}
        className={`group relative flex items-center space-x-2 p-2 rounded-lg border-2 transition-all ${
          isChecked 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-surface-secondary hover:border-surface'
        }`}
      >
        <div 
          className="w-6 h-6 rounded-full border-2 border-surface-secondary"
          style={{ backgroundColor: option.color }}
        />
        <span className="text-sm text-primary">{option.label}</span>
        {option.count && option.count > 0 && (
          <span className="text-xs muted">({option.count})</span>
        )}
        {isChecked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-pink-600 rounded-full" />
          </div>
        )}
      </button>
    );
  };

  // Renderizar rango de precio
  const renderPriceRange = (group: FilterGroup) => {
    const [min, max] = (activeFilters[group.id] as number[]) || [group.min || 0, group.max || 100];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-xs muted mb-1">Mínimo</label>
            <input
              type="number"
              value={min}
              onChange={(e) => handleFilterChange(group.id, [Number(e.target.value), max])}
              className="w-full px-3 py-2 border border-surface-secondary rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              min={group.min}
              max={group.max}
              step={group.step}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs muted mb-1">Máximo</label>
            <input
              type="number"
              value={max}
              onChange={(e) => handleFilterChange(group.id, [min, Number(e.target.value)])}
              className="w-full px-3 py-2 border border-surface-secondary rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              min={group.min}
              max={group.max}
              step={group.step}
            />
          </div>
        </div>
        <div className="text-center text-sm muted">
          ${min.toLocaleString()} - ${max.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header con resultados y ordenamiento */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-secondary">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-surface-secondary rounded-md text-sm hover:bg-surface"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          <div className="text-sm muted">
            {isLoading ? (
              <span>Buscando...</span>
            ) : (
              <span>{totalResults.toLocaleString()} productos encontrados</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm muted">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-surface-secondary rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros activos */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-primary">Filtros activos</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-pink-600 hover:text-pink-700"
            >
              Limpiar todo
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([groupId, value]) => {
              const group = FILTER_GROUPS.find(g => g.id === groupId);
              if (!group || (Array.isArray(value) && value.length === 0) || !value) return null;

              let displayValue = '';
              if (Array.isArray(value)) {
                if (typeof value[0] === 'number') {
                  displayValue = `$${value[0].toLocaleString()} - $${value[1].toLocaleString()}`;
                } else {
                  displayValue = value.join(', ');
                }
              } else {
                displayValue = value.toString();
              }

              return (
                <span
                  key={groupId}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full"
                >
                  <span>{group.label}: {displayValue}</span>
                  <button
                    onClick={() => clearFilter(groupId)}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Sidebar de filtros desktop */}
      <div className="hidden lg:block">
        <div className="space-y-6">
          {FILTER_GROUPS.map(group => (
            <div key={group.id} className="border-b border-surface-secondary pb-6">
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-2">
                  {group.icon}
                  <span className="font-medium text-primary">{group.label}</span>
                </div>
                {expandedGroups.has(group.id) ? (
                  <ChevronUp className="w-4 h-4 muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 muted" />
                )}
              </button>

              <AnimatePresence>
                {expandedGroups.has(group.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    {group.type === 'range' && renderPriceRange(group)}
                    {group.type === 'checkbox' && group.options?.map(option => 
                      renderCheckboxOption(group.id, option)
                    )}
                    {group.type === 'color' && (
                      <div className="grid grid-cols-2 gap-2">
                        {group.options?.map(option => 
                          renderColorOption(group.id, option)
                        )}
                      </div>
                    )}
                    {group.type === 'radio' && group.options?.map(option => (
                      <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={group.id}
                          value={option.id}
                          checked={activeFilters[group.id] === option.id}
                          onChange={() => handleFilterChange(group.id, option.id)}
                          className="w-4 h-4 text-primary border-2 border-surface-secondary focus:ring-2 focus:ring-pink-500"
                        />
                        <span className="flex-1 text-sm text-primary">{option.label}</span>
                        {option.count && option.count > 0 && (
                          <span className="text-xs muted">({option.count})</span>
                        )}
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de filtros mobile */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileFilters(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-primary">Filtros</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-surface rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {FILTER_GROUPS.map(group => (
                    <div key={group.id} className="border-b border-surface-secondary pb-6">
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="flex items-center justify-between w-full text-left mb-4"
                      >
                        <div className="flex items-center space-x-2">
                          {group.icon}
                          <span className="font-medium text-primary">{group.label}</span>
                        </div>
                        {expandedGroups.has(group.id) ? (
                          <ChevronUp className="w-4 h-4 muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 muted" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedGroups.has(group.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            {group.type === 'range' && renderPriceRange(group)}
                            {group.type === 'checkbox' && group.options?.map(option => 
                              renderCheckboxOption(group.id, option)
                            )}
                            {group.type === 'color' && (
                              <div className="grid grid-cols-2 gap-2">
                                {group.options?.map(option => 
                                  renderColorOption(group.id, option)
                                )}
                              </div>
                            )}
                            {group.type === 'radio' && group.options?.map(option => (
                              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={group.id}
                                  value={option.id}
                                  checked={activeFilters[group.id] === option.id}
                                  onChange={() => handleFilterChange(group.id, option.id)}
                                  className="w-4 h-4 text-primary border-2 border-surface-secondary focus:ring-2 focus:ring-pink-500"
                                />
                                <span className="flex-1 text-sm text-primary">{option.label}</span>
                                {option.count && option.count > 0 && (
                                  <span className="text-xs muted">({option.count})</span>
                                )}
                              </label>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2 border border-surface-secondary text-primary rounded-md hover:bg-surface"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}