import { useState, useEffect } from "react";
import {
  Globe,
  Star,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  GlassWater,
  ChefHat,
  Wine,
  Clock,
  MapPin,
  MessageSquare,
  ArrowRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  getHomeFeatured,
  updateHomeFeatured,
  type HomeFeaturedConfig,
} from "../../admin/services/configService";
import { getProducts } from "../../products/services/productService";

type WebTab = "featured" | "schedule" | "pillars";

export default function WebManagementPage() {
  const [activeTab, setActiveTab] = useState<WebTab>("featured");

  // Estados de Destacados Web
  const [homeFeaturedConfig, setHomeFeaturedConfig] = useState<HomeFeaturedConfig>({
    headline: "Nuestra Selección de Autor",
    subtitle: "Las creaciones y platos más aclamados de nuestra barra y cocina",
    badge: "Recomendados de la Casa",
    maxItems: 6,
    productIds: [],
  });

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "drink" | "food">("all");

  // Notificaciones
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showNotification = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMessage(msg);
      setErrorMessage(null);
    } else {
      setErrorMessage(msg);
      setSuccessMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4000);
  };

  /* ── Cargar Datos ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [feat, prods] = await Promise.all([
        getHomeFeatured(),
        getProducts(),
      ]);

      if (feat) {
        setHomeFeaturedConfig({
          headline: feat.headline || "Nuestra Selección de Autor",
          subtitle: feat.subtitle || "Las creaciones y platos más aclamados de nuestra barra y cocina",
          badge: feat.badge || "Recomendados de la Casa",
          maxItems: feat.maxItems || 6,
          productIds: Array.isArray(feat.productIds) ? feat.productIds : [],
        });
      }
      setAllProducts(Array.isArray(prods) ? prods : []);
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al cargar configuración del portal web");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ── Alternar Producto en Destacados ── */
  const handleToggleProduct = (productId: string) => {
    const current = homeFeaturedConfig.productIds || [];
    const isSelected = current.includes(productId);

    if (isSelected) {
      setHomeFeaturedConfig({
        ...homeFeaturedConfig,
        productIds: current.filter((id) => id !== productId),
      });
    } else {
      const limit = homeFeaturedConfig.maxItems || 6;
      if (current.length >= limit) {
        showNotification(
          "error",
          `Límite alcanzado: el máximo configurado es de ${limit} productos para mantener el Home ágil y limpio.`
        );
        return;
      }
      setHomeFeaturedConfig({
        ...homeFeaturedConfig,
        productIds: [...current, productId],
      });
    }
  };

  /* ── Guardar Destacados ── */
  const handleSaveFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHomeFeatured(homeFeaturedConfig);
      showNotification("success", "Destacados de la página web actualizados exitosamente");
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al actualizar destacados web");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenClientWeb = () => {
    window.open("http://localhost:3000/cliente", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-4 md:p-8 space-y-6 animate-fade-in">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#30363D] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#F0B429]/10 text-[#F0B429] border border-[#F0B429]/30">
              <Globe size={18} />
            </span>
            <h1 className="text-2xl font-black text-[#E6EDF3] tracking-tight">
              Gestión del Portal Web
            </h1>
          </div>
          <p className="text-xs text-[#8B949E]">
            Control de lo que ven los clientes en el portal web y la app móvil (destacados de portada, horarios y pilares resto-bar)
          </p>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-3">
          {successMessage && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950] text-xs font-bold animate-fade-in">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F85149]/15 border border-[#F85149]/30 text-[#F85149] text-xs font-bold animate-fade-in">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenClientWeb}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161B22] border border-[#30363D] text-xs font-bold text-[#E6EDF3] hover:text-[#F0B429] hover:border-[#F0B429]/50 transition-all shadow-sm"
            title="Abrir el sitio web en una nueva pestaña"
          >
            <ExternalLink size={14} />
            <span>Ver Sitio Web en Vivo</span>
          </button>
        </div>
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex items-center gap-2 border-b border-[#30363D] pb-3 overflow-x-auto">
        {[
          { id: "featured", label: "Destacados de Portada (Home)", icon: Star },
          { id: "schedule", label: "Estado & Horarios de Servicio", icon: Clock },
          { id: "pillars",  label: "Los 4 Pilares Resto-Bar", icon: Layers },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as WebTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === id
                ? "bg-[#161B22] text-[#F0B429] border border-[#F0B429]/30 shadow-md"
                : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ================= CONTENIDO DE CADA PESTAÑA ================= */}
      {loading ? (
        <div className="flex items-center justify-center p-24 gap-3 text-[#F0B429]">
          <Loader2 size={26} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Sincronizando portal web con el catálogo...
          </span>
        </div>
      ) : (
        <div className="space-y-6">

          {/* TAB 1: DESTACADOS DE PORTADA */}
          {activeTab === "featured" && (
            <form onSubmit={handleSaveFeatured} className="space-y-6">
              {/* Card 1: Parámetros y Textos de Sección */}
              <div className="bg-[#161B22] p-6 rounded-2xl border border-[#30363D] space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                      <Star size={16} className="text-[#F0B429]" />
                      Configuración de la Sección Destacados
                    </h2>
                    <p className="text-xs text-[#8B949E] mt-0.5">
                      Personaliza los títulos y el cupo máximo de platos y cócteles insignia en la página de inicio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8B949E]">Cupo en Portada:</span>
                    {[4, 6, 8].map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => {
                          const newIds = (homeFeaturedConfig.productIds || []).slice(0, limit);
                          setHomeFeaturedConfig({
                            ...homeFeaturedConfig,
                            maxItems: limit,
                            productIds: newIds,
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          homeFeaturedConfig.maxItems === limit
                            ? "bg-[#F0B429] text-[#0D1117] border-[#F0B429] shadow-sm"
                            : "bg-[#0D1117] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                        }`}
                      >
                        {limit} productos
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                      Etiqueta / Badge Superior
                    </label>
                    <input
                      type="text"
                      value={homeFeaturedConfig.badge}
                      onChange={(e) =>
                        setHomeFeaturedConfig({
                          ...homeFeaturedConfig,
                          badge: e.target.value,
                        })
                      }
                      placeholder="Ej: Recomendados de la Casa"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:border-[#F0B429] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                      Título Principal de la Sección
                    </label>
                    <input
                      type="text"
                      value={homeFeaturedConfig.headline}
                      onChange={(e) =>
                        setHomeFeaturedConfig({
                          ...homeFeaturedConfig,
                          headline: e.target.value,
                        })
                      }
                      placeholder="Ej: Nuestra Selección de Autor"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:border-[#F0B429] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                      Subtítulo Descriptivo
                    </label>
                    <input
                      type="text"
                      value={homeFeaturedConfig.subtitle}
                      onChange={(e) =>
                        setHomeFeaturedConfig({
                          ...homeFeaturedConfig,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Ej: Las creaciones y platos más aclamados de nuestra barra y cocina"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:border-[#F0B429] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Previsualización Header Web */}
                <div className="p-4 rounded-xl bg-[#0D1117]/90 border border-[#F0B429]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#F0B429] bg-[#F0B429]/10 px-2.5 py-0.5 rounded-full border border-[#F0B429]/30">
                      <Sparkles size={11} />
                      {homeFeaturedConfig.badge || "Recomendados de la Casa"}
                    </span>
                    <h3 className="text-base font-bold text-[#E6EDF3]">
                      {homeFeaturedConfig.headline || "Nuestra Selección de Autor"}
                    </h3>
                    <p className="text-xs text-[#8B949E]">
                      {homeFeaturedConfig.subtitle || "Las creaciones y platos más aclamados de nuestra barra y cocina"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#F0B429]">
                        {(homeFeaturedConfig.productIds || []).length} / {homeFeaturedConfig.maxItems}
                      </span>
                      <p className="text-[10px] text-[#8B949E]">Seleccionados</p>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F0B429] hover:bg-[#F0B429]/90 text-[#0D1117] text-xs font-bold transition-all shadow-md shadow-[#F0B429]/20"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Guardar en Web
                    </button>
                  </div>
                </div>
              </div>

              {/* Bandeja de productos seleccionados actualmente */}
              <div className="bg-[#161B22] p-5 rounded-2xl border border-[#30363D] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E6EDF3] flex items-center gap-2">
                    <Layers size={14} className="text-[#388BFD]" />
                    Productos Seleccionados para la Portada ({(homeFeaturedConfig.productIds || []).length} de {homeFeaturedConfig.maxItems})
                  </span>
                  {(homeFeaturedConfig.productIds || []).length === 0 && (
                    <span className="text-xs text-[#F0B429]">
                      (Si no seleccionas ninguno, se mostrarán automáticamente los más destacados de la carta)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(homeFeaturedConfig.productIds || []).map((id) => {
                    const prod = allProducts.find((p) => (p._id || p.id) === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-[#0D1117] border border-[#F0B429]/40 text-xs text-[#E6EDF3]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#F0B429]" />
                        <span className="font-medium">{prod?.name || `ID: ${id}`}</span>
                        <span className="text-[11px] text-[#F0B429] font-bold">
                          ${Number(prod?.price || 0).toLocaleString("es-AR")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleProduct(id)}
                          className="p-1 rounded hover:bg-[#F85149]/20 text-[#8B949E] hover:text-[#F85149] transition-colors ml-1"
                          title="Quitar de portada"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Catálogo de Productos para Selección */}
              <div className="bg-[#161B22] p-6 rounded-2xl border border-[#30363D] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#E6EDF3]">
                      Catálogo Disponible del Bar
                    </h3>
                    <p className="text-xs text-[#8B949E]">
                      Selecciona los cócteles y platos que deseas visibilizar con prioridad
                    </p>
                  </div>

                  {/* Buscador y Filtro por Tipo */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar producto o categoría..."
                        className="bg-[#0D1117] border border-[#30363D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#F0B429] focus:outline-none w-56"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-xl border border-[#30363D]">
                      <button
                        type="button"
                        onClick={() => setProductTypeFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          productTypeFilter === "all"
                            ? "bg-[#161B22] text-[#F0B429]"
                            : "text-[#8B949E] hover:text-[#E6EDF3]"
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductTypeFilter("drink")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          productTypeFilter === "drink"
                            ? "bg-[#161B22] text-[#F0B429]"
                            : "text-[#8B949E] hover:text-[#E6EDF3]"
                        }`}
                      >
                        Bebidas
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductTypeFilter("food")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          productTypeFilter === "food"
                            ? "bg-[#161B22] text-[#F0B429]"
                            : "text-[#8B949E] hover:text-[#E6EDF3]"
                        }`}
                      >
                        Comidas
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grilla de Productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
                  {allProducts
                    .filter((p) => {
                      const matchesSearch =
                        !productSearch ||
                        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category?.toLowerCase().includes(productSearch.toLowerCase());
                      const matchesType =
                        productTypeFilter === "all" || p.type === productTypeFilter;
                      return matchesSearch && matchesType;
                    })
                    .map((prod) => {
                      const pId = prod._id || prod.id;
                      const isSelected = (homeFeaturedConfig.productIds || []).includes(pId);
                      const isMaxReached =
                        (homeFeaturedConfig.productIds || []).length >=
                        (homeFeaturedConfig.maxItems || 6);

                      return (
                        <div
                          key={pId}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                            isSelected
                              ? "bg-[#0D1117] border-[#F0B429] shadow-md shadow-[#F0B429]/10"
                              : "bg-[#0D1117]/60 border-[#30363D] hover:border-[#8B949E]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover bg-[#161B22] shrink-0 border border-[#30363D]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#161B22] flex items-center justify-center shrink-0 border border-[#30363D] text-[#8B949E]">
                                {prod.type === "drink" ? (
                                  <GlassWater size={20} className="text-[#388BFD]" />
                                ) : (
                                  <ChefHat size={20} className="text-[#E6EDF3]" />
                                )}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
                                  {prod.category}
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] font-bold text-[#0D1117] bg-[#F0B429] px-1.5 py-0.2 rounded-md">
                                    EN HOME
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-[#E6EDF3] truncate">
                                {prod.name}
                              </h4>
                              <p className="text-xs font-extrabold text-[#F0B429] mt-0.5">
                                ${Number(prod.price || 0).toLocaleString("es-AR")}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleProduct(pId)}
                            disabled={!isSelected && isMaxReached}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? "bg-[#F85149]/15 text-[#F85149] hover:bg-[#F85149]/25 border border-[#F85149]/30"
                                : isMaxReached
                                ? "bg-[#161B22] text-[#8B949E]/50 border border-[#30363D] cursor-not-allowed"
                                : "bg-[#161B22] text-[#E6EDF3] hover:text-[#0D1117] hover:bg-[#F0B429] border border-[#30363D] hover:border-[#F0B429]"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Trash2 size={13} /> Quitar de Portada
                              </>
                            ) : (
                              <>
                                <Plus size={13} /> Destacar en Portada
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: ESTADO & HORARIOS */}
          {activeTab === "schedule" && (
            <div className="bg-[#161B22] p-6 rounded-2xl border border-[#30363D] space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                  <Clock size={16} className="text-[#F0B429]" />
                  Beacon de Estado Nocturno & Horarios del Local
                </h2>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  El portal web detecta automáticamente la hora local y muestra a los visitantes si el bar y cocina están en servicio activo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-3">
                  <span className="text-xs font-bold text-[#F0B429] uppercase tracking-wider">
                    Lógica del Beacon Automático
                  </span>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#161B22] border border-[#30363D]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3FB950] shadow-[0_0_8px_#3FB950]" />
                    <div>
                      <p className="text-xs font-bold text-[#E6EDF3]">18:00 a 04:00 AM</p>
                      <p className="text-[11px] text-[#8B949E]">
                        Muestra: "Barra & Fuegos en Servicio • Abierto hasta 04:00 AM"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#161B22] border border-[#30363D]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D29922]" />
                    <div>
                      <p className="text-xs font-bold text-[#E6EDF3]">04:00 AM a 18:00 HS</p>
                      <p className="text-[11px] text-[#8B949E]">
                        Muestra: "Abrimos hoy 18:00 HS • Reservas Online Disponibles"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-3">
                  <span className="text-xs font-bold text-[#F0B429] uppercase tracking-wider">
                    Contacto y Canales Directos en la Web
                  </span>
                  <div className="space-y-2 text-xs text-[#8B949E]">
                    <p className="flex items-center gap-2 text-[#E6EDF3]">
                      <MapPin size={14} className="text-[#F0B429]" />
                      Av. Principal 123 (Valet Parking & Barra VIP)
                    </p>
                    <p className="flex items-center gap-2 text-[#3FB950] font-bold">
                      <MessageSquare size={14} />
                      WhatsApp Directo con Barra VIP: +54 9 11 1234-5678
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOS 4 PILARES RESTO-BAR */}
          {activeTab === "pillars" && (
            <div className="bg-[#161B22] p-6 rounded-2xl border border-[#30363D] space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                  <Layers size={16} className="text-[#F0B429]" />
                  Los Cuatro Mundos de Experiencia en la Web
                </h2>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Estructura curada que guía a los clientes hacia los sectores clave del resto-bar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Cócteles de Autor",
                    desc: "Clarificados botánicos, ahumados y hielo tallado a mano",
                    tag: "Barra & Spirits",
                    icon: GlassWater,
                  },
                  {
                    title: "Cocina de Fuegos & Tapas",
                    desc: "Cortes madurados, tapas ahumadas y bocados para compartir",
                    tag: "Cocina Viva",
                    icon: ChefHat,
                  },
                  {
                    title: "Cava & Destilados Puros",
                    desc: "Etiquetas seleccionadas, whiskies de autor y aperitivos",
                    tag: "Cava Nebula",
                    icon: Wine,
                  },
                  {
                    title: "Postres & Sobremesa",
                    desc: "Chocolates amargos, pastelería fina y digestivos",
                    tag: "Cierre Dulce",
                    icon: Sparkles,
                  },
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-2"
                    >
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#F0B429] bg-[#F0B429]/10 border border-[#F0B429]/30">
                        <Icon size={11} /> {pillar.tag}
                      </span>
                      <h4 className="text-sm font-bold text-[#E6EDF3]">{pillar.title}</h4>
                      <p className="text-xs text-[#8B949E] leading-relaxed">{pillar.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
