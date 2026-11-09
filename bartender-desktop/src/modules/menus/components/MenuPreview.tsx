"use client";

import { useState } from "react";
import { Eye, Smartphone, Monitor, Share2, QrCode, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import type { Menu } from "../../../types/menu";
import { getProductDisplayName } from "../utils/menuUtils";

interface Props {
  menu: Menu;
}

export default function MenuPreview({ menu }: Props) {
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [showQR, setShowQR] = useState(false);

  const totalProducts = menu.categories?.reduce((sum, cat) => sum + cat.products.length, 0) || 0;
  const availableProducts = menu.categories?.reduce(
    (sum, cat) => sum + cat.products.filter(p => p.available).length,
    0
  ) || 0;

  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#F0B429]" />
          <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
            Vista Previa en Vivo
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDeviceMode("mobile")}
            title="Vista Móvil"
            className={`p-1.5 rounded-lg border transition-all ${
              deviceMode === "mobile"
                ? "bg-[#21283A] border-[#F0B429] text-[#F0B429]"
                : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            <Smartphone size={14} />
          </button>
          <button
            onClick={() => setDeviceMode("desktop")}
            title="Vista Escritorio"
            className={`p-1.5 rounded-lg border transition-all ${
              deviceMode === "desktop"
                ? "bg-[#21283A] border-[#F0B429] text-[#F0B429]"
                : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            title="Ver código QR"
            className={`p-1.5 rounded-lg border transition-all ${
              showQR
                ? "bg-[#21283A] border-[#F0B429] text-[#F0B429]"
                : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            <QrCode size={14} />
          </button>
        </div>
      </div>

      {/* QR Code Popover */}
      {showQR && (
        <div className="p-3 bg-[#0D1117] rounded-xl border border-[#30363D] text-center space-y-2 animate-in fade-in duration-200">
          <div className="w-28 h-28 mx-auto bg-white p-2 rounded-lg flex items-center justify-center">
            {/* Simple QR placeholder */}
            <div className="w-full h-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-700">
              <QrCode size={40} className="text-[#0D1117]" />
              <span className="text-[10px] font-bold mt-1 text-[#0D1117]">QR Carta</span>
            </div>
          </div>
          <p className="text-xs text-[#8B949E]">
            Escanea para abrir la carta digital en el teléfono
          </p>
        </div>
      )}

      {/* Device Frame */}
      <div className={`mx-auto transition-all ${deviceMode === "mobile" ? "max-w-[280px]" : "w-full"}`}>
        <div className="rounded-2xl border-2 border-[#30363D] bg-[#0D1117] overflow-hidden shadow-lg">
          {/* Mockup Status Bar */}
          <div className="px-3 py-1.5 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between text-[11px] text-[#8B949E]">
            <span className="font-semibold text-xs text-[#E6EDF3]">9:41</span>
            <div className="w-12 h-3 bg-[#0D1117] rounded-full mx-auto" />
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
              <span className="text-xs text-[#8B949E]">WiFi</span>
            </div>
          </div>

          {/* Menu Header Card inside Device */}
          <div className="relative p-4 bg-gradient-to-b from-[#1C2333] to-[#0D1117] border-b border-[#30363D]">
            {menu.image && (
              <div className="absolute inset-0">
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-full object-cover opacity-25"
                />
              </div>
            )}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                {menu.active && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(63,185,80,0.15)] border border-[rgba(63,185,80,0.30)] text-[#3FB950] text-xs font-bold uppercase tracking-wider">
                    <CheckCircle size={10} /> Activo
                  </span>
                )}
                {menu.isPublic && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(240,180,41,0.15)] border border-[rgba(240,180,41,0.30)] text-[#F0B429] text-xs font-bold uppercase tracking-wider">
                    <Share2 size={10} /> Público
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-[#E6EDF3] tracking-tight uppercase">
                {menu.name || "Sin Nombre"}
              </h4>
              {menu.description && (
                <p className="text-xs text-[#8B949E] line-clamp-2 mt-1">
                  {menu.description}
                </p>
              )}
            </div>
          </div>

          {/* Categories Preview Content */}
          <div className="p-3 space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar">
            {menu.categories && menu.categories.length > 0 ? (
              menu.categories.map((category, idx) => {
                const catAvailable = category.products.filter(p => p.available).length;
                const catTotal = category.products.length;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-[#30363D]">
                      <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
                        {category.name}
                      </span>
                      <span className="text-xs text-[#8B949E] flex items-center gap-1">
                        {catAvailable === catTotal ? (
                          <CheckCircle size={10} className="text-[#3FB950]" />
                        ) : (
                          <AlertTriangle size={10} className="text-[#F0B429]" />
                        )}
                        {catAvailable}/{catTotal}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {category.products.slice(0, 3).map((product, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D]"
                        >
                          <span className="text-xs text-[#E6EDF3] truncate pr-2">
                            {getProductDisplayName(product.product)}
                          </span>
                          <span className="text-xs font-bold text-[#F0B429] shrink-0">
                            ${(product.price ?? 0).toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                      {category.products.length > 3 && (
                        <p className="text-xs text-[#8B949E] text-center py-0.5">
                          +{category.products.length - 3} ítems más
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-[#8B949E]">
                Sin categorías agregadas
              </div>
            )}
          </div>

          {/* Footer Metrics */}
          <div className="p-2.5 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between text-xs">
            <span className="text-[#8B949E]">
              {menu.categories?.length || 0} cat · {totalProducts} prod
            </span>
            <span className="font-semibold text-[#3FB950]">
              {availableProducts} disp
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        <a
          href={menu.slug ? `/menu/${menu.slug}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-[#21283A] hover:bg-[#30363D] border border-[#30363D] text-[#E6EDF3] text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all"
        >
          <ExternalLink size={13} className="text-[#F0B429]" />
          Ver en Vivo
        </a>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#0D1117] hover:bg-[#21283A] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all"
        >
          <QrCode size={13} />
          {showQR ? "Cerrar QR" : "Generar QR"}
        </button>
      </div>
    </div>
  );
}
