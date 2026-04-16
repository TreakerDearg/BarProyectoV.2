import { useAuthStore } from "../../store/authStore";

export default function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Panel de Administración</h1>
      <div className="text-sm text-gray-300">
        {user?.name || "Usuario"}
      </div>
    </header>
  );
}