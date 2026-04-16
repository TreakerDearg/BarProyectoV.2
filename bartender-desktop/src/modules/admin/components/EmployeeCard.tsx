import type { User } from "../types/user";
import { Trash2 } from "lucide-react";

interface Props {
  user: User;
  onDeactivate: (id: string) => void;
}

export default function EmployeeCard({ user, onDeactivate }: Props) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h3 className="font-bold">{user.name}</h3>

      <p className="text-sm text-gray-400">{user.email}</p>

      <p className="text-xs text-amber-400 mt-1">
        {user.role.toUpperCase()}
      </p>

      {!user.isActive && (
        <p className="text-red-400 text-xs mt-1">
          Desactivado
        </p>
      )}

      {user.isActive && (
        <button
          onClick={() => onDeactivate(user._id)}
          className="mt-3 bg-red-500 p-2 rounded w-full"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}