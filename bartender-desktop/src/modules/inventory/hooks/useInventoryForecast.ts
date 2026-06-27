"use client";

import { useMemo } from "react";
import type { InventoryItem, StockForecast, ConsumptionPattern } from "../types/inventory";

interface Props {
  items: InventoryItem[];
  historicalData?: Array<{
    itemId: string;
    date: string;
    stock: number;
    consumption: number;
  }>;
}

export function useInventoryForecast({ items, historicalData = [] }: Props) {
  const forecasts = useMemo(() => {
    return items.map((item) => {
      const stock = Number(item.stock ?? 0);
      const minStock = Number(item.minStock ?? 0);
      
      // Calculate consumption rate from historical data
      const itemHistory = historicalData.filter((h) => h.itemId === item._id);
      let consumptionRate = 0;
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      
      if (itemHistory.length > 1) {
        const recentConsumption = itemHistory.slice(-7).reduce((sum, h) => sum + h.consumption, 0);
        consumptionRate = recentConsumption / 7;
        
        // Determine trend
        const olderConsumption = itemHistory.slice(-14, -7).reduce((sum, h) => sum + h.consumption, 0) / 7;
        if (consumptionRate > olderConsumption * 1.2) trend = 'increasing';
        else if (consumptionRate < olderConsumption * 0.8) trend = 'decreasing';
      } else {
        // Fallback: estimate consumption based on stock and typical usage
        consumptionRate = Math.max(stock * 0.05, 1); // Assume 5% daily usage as baseline
      }

      // Calculate days until empty
      const daysUntilEmpty = consumptionRate > 0 ? Math.floor(stock / consumptionRate) : Infinity;
      
      // Calculate predicted empty date
      const predictedEmptyDate = daysUntilEmpty !== Infinity 
        ? new Date(Date.now() + daysUntilEmpty * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : '';

      // Calculate suggested restock quantity
      const suggestedRestock = Math.max(
        (item.maxStock || 100) - stock,
        minStock * 2
      );

      // Calculate confidence based on historical data availability
      const confidence = Math.min(
        (itemHistory.length / 30) * 100,
        100
      );

      const forecast: StockForecast = {
        itemId: item._id || '',
        itemName: item.name,
        currentStock: stock,
        predictedEmptyDate,
        daysUntilEmpty,
        consumptionRate,
        suggestedRestock,
        confidence,
        trend,
      };

      return forecast;
    });
  }, [items, historicalData]);

  const criticalForecasts = useMemo(() => {
    return forecasts.filter((f) => f.daysUntilEmpty <= 7).sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);
  }, [forecasts]);

  const consumptionPatterns = useMemo(() => {
    return items.map((item) => {
      const itemHistory = historicalData.filter((h) => h.itemId === item._id);
      
      const dailyAverage = itemHistory.length > 0 
        ? itemHistory.reduce((sum, h) => sum + h.consumption, 0) / itemHistory.length
        : 0;

      const weeklyAverage = dailyAverage * 7;
      const monthlyAverage = dailyAverage * 30;

      // Find peak consumption days (0 = Sunday, 6 = Saturday)
      const dayConsumption = new Array(7).fill(0);
      itemHistory.forEach((h) => {
        const day = new Date(h.date).getDay();
        dayConsumption[day] += h.consumption;
      });
      const avgDayConsumption = dayConsumption.reduce((a, b) => a + b, 0) / 7;
      const peakDays = dayConsumption
        .map((consumption, day) => ({ day, consumption }))
        .filter(({ consumption }) => consumption > avgDayConsumption * 1.5)
        .map(({ day }) => day);

      // Determine seasonality
      const variance = dayConsumption.reduce((sum, val) => sum + Math.pow(val - avgDayConsumption, 2), 0) / 7;
      const seasonality = variance > avgDayConsumption * 2 ? 'high' : variance > avgDayConsumption ? 'low' : 'none';

      const pattern: ConsumptionPattern = {
        itemId: item._id || '',
        dailyAverage,
        weeklyAverage,
        monthlyAverage,
        peakDays,
        seasonality,
      };

      return pattern;
    });
  }, [items, historicalData]);

  return {
    forecasts,
    criticalForecasts,
    consumptionPatterns,
  };
}
