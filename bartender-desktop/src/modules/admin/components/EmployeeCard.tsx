import type { User } from "../types/user";
import { Trash2, Shield, UserCheck, UserX } from "lucide-react";

interface Props {
  user: User;
  onDeactivate: (id: string) => void;
  onActivate?: (id: string) => void;
}

export default function EmployeeCard({
  user,
  onDeactivate,
  onActivate,
}: Props) {
  const isActive = user.isActive;

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-200 ${
        isActive
          ? "bg-gray-900 border-gray-800 hover:border-gray-700"
          : "bg-gray-950 border-red-900/40 opacity-80"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            {user.name}

            {/* STATUS ICON */}
            {isActive ? (
              <UserCheck size={16} className="text-green-400" />
            ) : (
              <UserX size={16} className="text-red-400" />
            )}
          </h3>

          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {/* ROLE BADGE */}
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-800 text-amber-300">
          <Shield size={12} />
          {user.role.toUpperCase()}
        </span>
      </div>

      {/* STATUS TEXT */}
      <div className="mt-3">
        {isActive ? (
          <p className="text-xs text-green-400">
            Usuario activo
          </p>
        ) : (
          <p className="text-xs text-red-400">
            Usuario desactivado
          </p>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-4 flex gap-2">
        {isActive ? (
          <button
            onClick={() => onDeactivate(user._id)}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm py-2 rounded-xl transition"
          >
            <Trash2 size={16} />
            Desactivar
          </button>
        ) : (
          onActivate && (
            <button
              onClick={() => onActivate(user._id)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-xl transition"
            >
              <UserCheck size={16} />
              Activar
            </button>
          )
        )}
      </div>
    </div>
  );
}