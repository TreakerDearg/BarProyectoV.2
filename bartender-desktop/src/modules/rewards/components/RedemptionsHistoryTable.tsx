import { CheckCircle2, Clock, AlertTriangle, User, Coins, Package, ArrowUpRight } from "lucide-react";
import type { RedemptionRecord } from "../types/reward";

interface RedemptionsHistoryTableProps {
  redemptions: RedemptionRecord[];
}

export default function RedemptionsHistoryTable({ redemptions }: RedemptionsHistoryTableProps) {
  if (redemptions.length === 0) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-12 text-center text-[#8B949E] space-y-3">
        <Clock size={36} className="mx-auto opacity-30 text-[#F0B429]" />
        <h3 className="text-sm font-bold text-[#E6EDF3]">Sin Canjes Registrados</h3>
        <p className="text-xs max-w-sm mx-auto">
          Aún no se han generado canjes de recompensas por parte de los clientes desde la app.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#E6EDF3]">Historial Completo de Canjes</h3>
          <p className="text-[11px] text-[#8B949E]">
            Registro de cupones emitidos por clientes y canjeados en barra/caja
          </p>
        </div>
        <span className="text-xs font-mono text-[#8B949E] bg-[#1C2333] px-2.5 py-1 rounded-md border border-[#30363D]">
          {redemptions.length} canjes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#1C2333] text-[#8B949E] uppercase tracking-wider text-[10px] font-bold border-b border-[#30363D]">
              <th className="py-3 px-4">Código Cupón</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Recompensa Solicitada</th>
              <th className="py-3 px-4 text-center">Puntos</th>
              <th className="py-3 px-4">Fecha Solicitud</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Atendido Por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363D]/60 text-[#E6EDF3]">
            {redemptions.map((red) => (
              <tr key={red.redemptionId || red.code} className="hover:bg-[#1C2333]/50 transition-colors">
                
                {/* Código */}
                <td className="py-3.5 px-4 font-mono font-bold text-[#F0B429]">
                  #{red.code}
                </td>

                {/* Cliente */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#30363D] flex items-center justify-center text-[10px] font-bold text-[#E6EDF3]">
                      {red.user?.name?.slice(0, 2).toUpperCase() || "CL"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#E6EDF3] leading-none">{red.user?.name || "Cliente"}</p>
                      {red.user?.email && (
                        <p className="text-[10px] text-[#8B949E] mt-0.5">{red.user.email}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Recompensa */}
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-bold text-[#E6EDF3]">{red.reward?.name}</p>
                    {red.reward?.product && (
                      <p className="text-[10px] text-[#388BFD] flex items-center gap-1 mt-0.5">
                        <Package size={10} />
                        Carta: {red.reward.product.name}
                      </p>
                    )}
                  </div>
                </td>

                {/* Puntos */}
                <td className="py-3.5 px-4 text-center">
                  <span className="font-mono font-bold text-[#F0B429] bg-[#F0B429]/10 px-2 py-0.5 rounded border border-[#F0B429]/20">
                    {red.reward?.pointsCost}
                  </span>
                </td>

                {/* Fecha Solicitud */}
                <td className="py-3.5 px-4 text-[#8B949E] text-[11px]">
                  {new Date(red.redeemedAt).toLocaleDateString()}{" "}
                  <span className="text-[#8B949E]/70">
                    {new Date(red.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>

                {/* Estado */}
                <td className="py-3.5 px-4">
                  {red.status === "claimed" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30">
                      <CheckCircle2 size={11} />
                      Canjeado
                    </span>
                  ) : red.status === "pending" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30">
                      <Clock size={11} />
                      Pendiente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30">
                      <AlertTriangle size={11} />
                      Cancelado
                    </span>
                  )}
                </td>

                {/* Atendido Por */}
                <td className="py-3.5 px-4 text-[#8B949E] text-[11px]">
                  {red.claimedBy ? (
                    <span className="font-medium text-[#E6EDF3]">
                      {red.claimedBy.name || "Staff"}
                    </span>
                  ) : (
                    <span className="text-[#8B949E]/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
