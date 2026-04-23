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
      className={`
        rounded-2xl p-4 border transition-all duration-200
        backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.4)]

        ${
          isActive
            ? "bg-[#0E131B]/70 border-[rgba(255,255,255,0.06)] hover:border-[#A78BFA]/20"
            : "bg-[#0B0F14] border-[#F87171]/20 opacity-80"
        }
      `}
    >

      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">

        {/* NAME + EMAIL */}
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {user.name}

            {/* STATUS ICON */}
            {isActive ? (
              <UserCheck size={16} className="text-[#34D399]" />
            ) : (
              <UserX size={16} className="text-[#F87171]" />
            )}
          </h3>

          <p className="text-sm text-[#71717A]">
            {user.email}
          </p>
        </div>

        {/* ROLE BADGE */}
        <span className="
          flex items-center gap-1 text-[11px] px-2 py-1 rounded-full
          bg-[#111827]/60 border border-[rgba(255,255,255,0.06)]
          text-[#A78BFA]
        ">
          <Shield size={12} />
          {user.role.toUpperCase()}
        </span>
      </div>

      {/* ================= STATUS ================= */}
      <div className="mt-3">
        {isActive ? (
          <p className="text-xs text-[#34D399] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            Usuario activo en el sistema
          </p>
        ) : (
          <p className="text-xs text-[#F87171] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
            Usuario desactivado
          </p>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="mt-4 flex gap-2">

        {isActive ? (
          <button
            onClick={() => onDeactivate(user._id)}
            className="
              w-full flex items-center justify-center gap-2
              bg-[#F87171]/10 hover:bg-[#F87171]/20
              text-[#F87171]
              text-sm py-2 rounded-xl
              border border-[#F87171]/20
              transition
            "
          >
            <Trash2 size={16} />
            Desactivar
          </button>
        ) : (
          onActivate && (
            <button
              onClick={() => onActivate(user._id)}
              className="
                w-full flex items-center justify-center gap-2
                bg-[#34D399]/10 hover:bg-[#34D399]/20
                text-[#34D399]
                text-sm py-2 rounded-xl
                border border-[#34D399]/20
                transition
              "
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