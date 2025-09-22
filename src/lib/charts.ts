// Chart utilities and data processing for admin dashboard
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title?: string;
  subtitle?: string;
  xAxis?: {
    label?: string;
    type?: 'category' | 'time' | 'numeric';
    format?: string;
  };
  yAxis?: {
    label?: string;
    format?: string;
    min?: number;
    max?: number;
  };
  colors?: string[];
  responsive?: boolean;
  animation?: boolean;
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
}

// Chart data processors
export class ChartDataProcessor {
  static processTimeSeriesData(
    data: TimeSeriesPoint[],
    groupBy: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): ChartDataPoint[] {
    const grouped = new Map<string, number>();

    data.forEach(point => {
      const key = this.getTimeKey(point.timestamp, groupBy);
      grouped.set(key, (grouped.get(key) || 0) + point.value);
    });

    return Array.from(grouped.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  static processTopItems<T>(
    items: T[],
    getValue: (item: T) => number,
    getLabel: (item: T) => string,
    limit: number = 10
  ): ChartDataPoint[] {
    return items
      .map(item => ({
        label: getLabel(item),
        value: getValue(item),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  static processPercentageData(data: ChartDataPoint[]): ChartDataPoint[] {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      value: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }

  static processGrowthData(
    current: ChartDataPoint[],
    previous: ChartDataPoint[]
  ): ChartDataPoint[] {
    return current.map(currentItem => {
      const previousItem = previous.find(p => p.label === currentItem.label);
      const previousValue = previousItem?.value || 0;
      const growth = previousValue > 0 
        ? ((currentItem.value - previousValue) / previousValue) * 100 
        : 0;

      return {
        ...currentItem,
        value: growth,
        metadata: {
          current: currentItem.value,
          previous: previousValue,
          growth,
        },
      };
    });
  }

  private static getTimeKey(date: Date, groupBy: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    switch (groupBy) {
      case 'hour':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:00`;
      case 'day':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }
}

// Mock data generators for demo purposes
export class MockDataGenerator {
  static generateSalesData(days: number = 30): TimeSeriesPoint[] {
    const data: TimeSeriesPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic sales data with trends and seasonality
      const baseValue = 1000;
      const trend = (days - i) * 10; // Upward trend
      const seasonality = Math.sin((i / 7) * Math.PI) * 200; // Weekly pattern
      const noise = (Math.random() - 0.5) * 300; // Random variation
      
      data.push({
        timestamp: date,
        value: Math.max(0, baseValue + trend + seasonality + noise),
      });
    }

    return data;
  }

  static generateProductData(): ChartDataPoint[] {
    const products = [
      'Camiseta Premium',
      'Pantalón Casual',
      'Zapatillas Sport',
      'Chaqueta Invierno',
      'Vestido Elegante',
      'Jeans Clásicos',
      'Sudadera Comfort',
      'Falda Midi',
    ];

    return products.map(product => ({
      label: product,
      value: Math.floor(Math.random() * 500) + 50,
    }));
  }

  static generateCategoryData(): ChartDataPoint[] {
    const categories = [
      { label: 'Ropa Mujer', value: 45, color: '#e91e63' },
      { label: 'Ropa Hombre', value: 35, color: '#2196f3' },
      { label: 'Calzado', value: 15, color: '#ff9800' },
      { label: 'Accesorios', value: 5, color: '#4caf50' },
    ];

    return categories;
  }

  static generateUserActivityData(): TimeSeriesPoint[] {
    const data: TimeSeriesPoint[] = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(date.getHours() - i);
      
      // Higher activity during business hours
      const hour = date.getHours();
      let baseValue = 10;
      if (hour >= 9 && hour <= 17) {
        baseValue = 50;
      } else if (hour >= 18 && hour <= 22) {
        baseValue = 30;
      }
      
      const noise = Math.random() * 20;
      
      data.push({
        timestamp: date,
        value: baseValue + noise,
      });
    }

    return data;
  }

  static generateConversionFunnelData(): ChartDataPoint[] {
    return [
      { label: 'Visitantes', value: 10000, color: '#e3f2fd' },
      { label: 'Vieron Productos', value: 7500, color: '#bbdefb' },
      { label: 'Añadieron al Carrito', value: 2500, color: '#90caf9' },
      { label: 'Iniciaron Checkout', value: 1200, color: '#64b5f6' },
      { label: 'Completaron Compra', value: 800, color: '#2196f3' },
    ];
  }

  static generateRevenueByRegionData(): ChartDataPoint[] {
    return [
      { label: 'Madrid', value: 125000, color: '#e91e63' },
      { label: 'Barcelona', value: 98000, color: '#9c27b0' },
      { label: 'Valencia', value: 67000, color: '#673ab7' },
      { label: 'Sevilla', value: 54000, color: '#3f51b5' },
      { label: 'Bilbao', value: 43000, color: '#2196f3' },
      { label: 'Otros', value: 89000, color: '#607d8b' },
    ];
  }

  static generateInventoryStatusData(): ChartDataPoint[] {
    return [
      { label: 'En Stock', value: 1250, color: '#4caf50' },
      { label: 'Stock Bajo', value: 180, color: '#ff9800' },
      { label: 'Agotado', value: 45, color: '#f44336' },
      { label: 'Descontinuado', value: 25, color: '#9e9e9e' },
    ];
  }

  static generateCustomerSegmentData(): ChartDataPoint[] {
    return [
      { label: 'Nuevos Clientes', value: 35, color: '#4caf50' },
      { label: 'Clientes Recurrentes', value: 45, color: '#2196f3' },
      { label: 'VIP', value: 15, color: '#ff9800' },
      { label: 'Inactivos', value: 5, color: '#9e9e9e' },
    ];
  }
}

// Chart color palettes
export const ChartColors = {
  primary: [
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
    '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ],
  
  success: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50'],
  warning: ['#fff3e0', '#ffe0b2', '#ffcc02', '#ffb74d', '#ffa726', '#ff9800'],
  error: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336'],
  info: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3'],
  
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    error: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
  }
};

// Utility functions
export function formatChartValue(value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('es-ES').format(value);
  }
}

export function getChartColor(index: number, palette: string[] = ChartColors.primary): string {
  return palette[index % palette.length];
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function generateDateRange(days: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  
  return dates;
}
