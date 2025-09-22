'use client';

import { useMemo } from 'react';
import { ChartDataPoint, TimeSeriesPoint, ChartConfig, formatChartValue, getChartColor } from '@/lib/charts';

interface BaseChartProps {
  data: ChartDataPoint[] | TimeSeriesPoint[];
  config?: ChartConfig;
  className?: string;
  height?: number;
}

// Simple Line Chart Component
export function LineChart({ data, config, className = '', height = 300 }: BaseChartProps) {
  const chartData = data as TimeSeriesPoint[];
  
  const { minValue, maxValue, points } = useMemo(() => {
    if (!chartData.length) return { minValue: 0, maxValue: 0, points: [] };
    
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return { x, y, value: point.value, timestamp: point.timestamp };
    });
    
    return { minValue: min, maxValue: max, points };
  }, [chartData]);

  const pathD = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className={`surface border border-muted rounded-lg p-4 ${className}`}>
      {config?.title && (
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      )}
      {config?.subtitle && (
        <p className="text-sm text-muted mb-4">{config.subtitle}</p>
      )}
      
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Area under curve */}
          <path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#gradient)"
            opacity="0.2"
          />
          
          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgb(233, 30, 99)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="0.8"
              fill="rgb(233, 30, 99)"
              className="hover:r-1.2 transition-all cursor-pointer"
            >
              <title>{`${formatChartValue(point.value)} - ${point.timestamp?.toLocaleDateString()}`}</title>
            </circle>
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(233, 30, 99)" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="rgb(233, 30, 99)" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted -ml-12">
          <span>{formatChartValue(maxValue)}</span>
          <span>{formatChartValue((maxValue + minValue) / 2)}</span>
          <span>{formatChartValue(minValue)}</span>
        </div>
      </div>
    </div>
  );
}

// Bar Chart Component
export function BarChart({ data, config, className = '', height = 300 }: BaseChartProps) {
  const chartData = data as ChartDataPoint[];
  
  const maxValue = useMemo(() => 
    Math.max(...chartData.map(d => d.value), 1)
  , [chartData]);

  return (
    <div className={`surface border border-muted rounded-lg p-4 ${className}`}>
      {config?.title && (
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      )}
      
      <div className="space-y-3" style={{ height }}>
        {chartData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || getChartColor(index);
          
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-20 text-sm text-muted truncate" title={item.label}>
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="absolute right-2 top-0 h-6 flex items-center text-xs font-medium">
                  {formatChartValue(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Pie Chart Component
export function PieChart({ data, config, className = '', height = 300 }: BaseChartProps) {
  const chartData = data as ChartDataPoint[];
  
  const { total, segments } = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    const segments = chartData.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const color = item.color || getChartColor(index);
      
      return {
        ...item,
        percentage,
        angle,
        startAngle,
        color,
      };
    });
    
    return { total, segments };
  }, [chartData]);

  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className={`surface border border-muted rounded-lg p-4 ${className}`}>
      {config?.title && (
        <h3 className="text-lg font-semibold mb-4">{config.title}</h3>
      )}
      
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: height * 0.6, height: height * 0.6 }}>
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={segment.label}
                d={createArcPath(100, 100, 80, segment.startAngle, segment.startAngle + segment.angle)}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${segment.label}: ${formatChartValue(segment.value)} (${segment.percentage.toFixed(1)}%)`}</title>
              </path>
            ))}
            
            {/* Center circle for doughnut effect */}
            <circle cx="100" cy="100" r="40" fill="rgb(var(--background))" />
            
            {/* Center text */}
            <text x="100" y="95" textAnchor="middle" className="text-xs font-semibold fill-current">
              Total
            </text>
            <text x="100" y="110" textAnchor="middle" className="text-sm font-bold fill-current">
              {formatChartValue(total)}
            </text>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm flex-1">{segment.label}</span>
              <span className="text-sm font-medium">
                {formatChartValue(segment.value)} ({segment.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
export function MetricCard({
  title,
  value,
  change,
  changeType = 'percentage',
  icon,
  className = '',
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  icon?: React.ReactNode;
  className?: string;
}) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <div className={`surface border border-muted rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted mb-1">{title}</p>
          <p className="text-2xl font-bold">
            {typeof value === 'number' ? formatChartValue(value) : value}
          </p>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted'
            }`}>
              <span>
                {isPositive ? '↗' : isNegative ? '↘' : '→'}
              </span>
              <span>
                {changeType === 'percentage' ? `${Math.abs(change).toFixed(1)}%` : formatChartValue(Math.abs(change))}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="text-primary opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Progress Ring Component
export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'rgb(233, 30, 99)',
  className = '',
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity="0.3"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <div className="text-center">
            <div className="text-xl font-bold">{percentage.toFixed(0)}%</div>
            <div className="text-xs text-muted">{formatChartValue(value)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
