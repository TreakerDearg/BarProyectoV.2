import React from 'react';

export const metadata = {
  title: 'Recipes | Obsidian Admin',
};

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Recipes</h1>
          <p className="text-zinc-400 mt-1">Gestión del módulo de recipes.</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors">
          Nuevo Registro
        </button>
      </div>
      
      <div className="p-8 rounded-xl border border-white/5 bg-zinc-950/50 backdrop-blur-sm min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-amber-500">⚡</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Módulo en Construcción</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">
            El módulo de recipes está siendo implementado con la API del backend.
          </p>
        </div>
      </div>
    </div>
  );
}
