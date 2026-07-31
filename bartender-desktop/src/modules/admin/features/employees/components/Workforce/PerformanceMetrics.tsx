/**
 * PERFORMANCE METRICS
 * Métricas de rendimiento del empleado
 */

"use client";

import { TrendingUp, Clock, Star, Target, Zap, Award } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function PerformanceMetrics({ employee }: Props) {
  const performance = employee.performance as any;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-amber-400" />
        Métricas de Rendimiento
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total de Turnos Trabajados */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-400/20 rounded-lg">
              <Clock size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Turnos Trabajados</p>
              <p className="text-2xl font-bold text-white">{performance?.totalShifts || 0}</p>
            </div>
          </div>
        </div>

        {/* Horas Acumuladas */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-400/20 rounded-lg">
              <Clock size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Horas Acumuladas</p>
              <p className="text-2xl font-bold text-white">{performance?.totalHours || 0}h</p>
            </div>
          </div>
        </div>

        {/* Calificación Promedio */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-400/20 rounded-lg">
              <Star size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Calificación Promedio</p>
              <p className="text-2xl font-bold text-white">{performance?.averageRating || 0}/5</p>
            </div>
          </div>
        </div>

        {/* Productividad */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-400/20 rounded-lg">
              <Target size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Productividad</p>
              <p className="text-2xl font-bold text-white">{performance?.totalOrders || 0}</p>
              <p className="text-[10px] text-gray-400">órdenes</p>
            </div>
          </div>
        </div>

        {/* Eficiencia */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-400/20 rounded-lg">
              <Zap size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Eficiencia</p>
              <p className="text-2xl font-bold text-white">{performance?.avgOrderTime || 0}s</p>
              <p className="text-[10px] text-gray-400">promedio/orden</p>
            </div>
          </div>
        </div>

        {/* Puntualidad */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-400/20 rounded-lg">
              <Award size={16} className="text-pink-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Puntualidad</p>
              <p className="text-2xl font-bold text-white">{performance?.onTimeRate || 0}%</p>
              <p className="text-[10px] text-gray-400">a tiempo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas por Módulo */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-white mb-4">Métricas por Módulo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performance?.modules && (
            <>
              {/* Tables */}
              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <p className="text-xs font-bold text-white mb-2">Mesas</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Servidas</span>
                    <span className="text-white">{performance.modules.tables?.totalServed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tiempo promedio</span>
                    <span className="text-white">{performance.modules.tables?.avgServiceTime || 0}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Satisfacción</span>
                    <span className="text-white">{performance.modules.tables?.customerSatisfaction || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <p className="text-xs font-bold text-white mb-2">Órdenes</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Procesadas</span>
                    <span className="text-white">{performance.modules.orders?.totalProcessed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tiempo promedio</span>
                    <span className="text-white">{performance.modules.orders?.avgPrepTime || 0}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Precisión</span>
                    <span className="text-white">{performance.modules.orders?.accuracy || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <p className="text-xs font-bold text-white mb-2">Pagos</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Procesados</span>
                    <span className="text-white">{performance.modules.payments?.totalProcessed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tiempo promedio</span>
                    <span className="text-white">{performance.modules.payments?.avgProcessingTime || 0}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Precisión</span>
                    <span className="text-white">{performance.modules.payments?.accuracy || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Reservations */}
              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <p className="text-xs font-bold text-white mb-2">Reservas</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Gestionadas</span>
                    <span className="text-white">{performance.modules.reservations?.totalManaged || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">No-show</span>
                    <span className="text-white">{performance.modules.reservations?.noShowRate || 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Confirmación</span>
                    <span className="text-white">{performance.modules.reservations?.confirmationRate || 0}%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Métricas Semanales y Mensuales */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-xs font-bold text-white mb-3">Esta Semana</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Turnos</span>
              <span className="text-white">{performance?.weekly?.shifts || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Horas</span>
              <span className="text-white">{performance?.weekly?.hours || 0}h</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Ventas</span>
              <span className="text-white">${performance?.weekly?.sales || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Calificación</span>
              <span className="text-white">{performance?.weekly?.rating || 0}/5</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-xs font-bold text-white mb-3">Este Mes</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Turnos</span>
              <span className="text-white">{performance?.monthly?.shifts || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Horas</span>
              <span className="text-white">{performance?.monthly?.hours || 0}h</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Ventas</span>
              <span className="text-white">${performance?.monthly?.sales || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Calificación</span>
              <span className="text-white">{performance?.monthly?.rating || 0}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
