"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/identity/hooks/useAuth';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

export default function OffShiftPage() {
  const router = useRouter();
  const { user, desktopAccessMessage, isAuthenticated } = useAuth();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      router.push('/cliente/cuenta');
      return;
    }

    // Si puede acceder (por ejemplo, el turno se inició), redirigir al destino correcto
    if (desktopAccessMessage?.canAccess) {
      router.push('/desktop');
      return;
    }
  }, [isAuthenticated, desktopAccessMessage, router]);

  if (!desktopAccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const { title, message, shiftStart, minutesUntilStart, breakEnd, shiftEnd } = desktopAccessMessage;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            {title}
          </h1>

          {/* Message */}
          <p className="text-gray-300 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            {shiftStart && (
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Inicio de jornada</p>
                  <p className="text-white font-semibold">{shiftStart}</p>
                </div>
              </div>
            )}

            {minutesUntilStart !== undefined && (
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Tiempo restante</p>
                  <p className="text-white font-semibold">
                    {minutesUntilStart >= 60 
                      ? `${Math.floor(minutesUntilStart / 60)}h ${minutesUntilStart % 60}min`
                      : `${minutesUntilStart} minutos`
                    }
                  </p>
                </div>
              </div>
            )}

            {breakEnd && (
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Fin del descanso</p>
                  <p className="text-white font-semibold">{breakEnd}</p>
                </div>
              </div>
            )}

            {shiftEnd && (
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Fin de jornada</p>
                  <p className="text-white font-semibold">{shiftEnd}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-200">
                Cuando inicies tu jornada podrás acceder al sistema Desktop. 
                Si tienes alguna duda, contacta a tu supervisor.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/cliente')}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              Ir al sistema Cliente
            </button>
            
            <button
              onClick={() => router.push('/cliente/cuenta')}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Volver a mi cuenta
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Nebula Bartender System
        </p>
      </div>
    </div>
  );
}
