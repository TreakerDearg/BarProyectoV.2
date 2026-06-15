"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Bell, Check, X, Loader2, Play, Settings } from "lucide-react";
import {
  getAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  toggleAlertRule,
  testAlertRule,
  getAlertStats,
  type AlertRule,
  type AlertStats,
} from "../services/alertService";
import AlertRuleBuilder from "../components/AlertRuleBuilder";
import AlertDashboard from "../components/AlertDashboard";
import "../../../styles/nebula-obsidian-theme.css";

export default function AlertsConfigurationPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "dashboard">("rules");

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesData, statsData] = await Promise.all([
        getAlertRules(),
        getAlertStats(),
      ]);
      setRules(rulesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching alert data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (rule: Omit<AlertRule, "_id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      if (editingRule) {
        await updateAlertRule(editingRule._id!, rule);
      } else {
        await createAlertRule(rule);
      }
      setShowModal(false);
      setEditingRule(null);
      await fetchData();
    } catch (error) {
      console.error("Error saving alert rule:", error);
      alert("Error al guardar regla de alerta");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta regla de alerta?")) return;
    
    try {
      await deleteAlertRule(id);
      await fetchData();
    } catch (error) {
      console.error("Error deleting alert rule:", error);
      alert("Error al eliminar regla de alerta");
    }
  };

  // Handle toggle
  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleAlertRule(id, enabled);
      await fetchData();
    } catch (error) {
      console.error("Error toggling alert rule:", error);
      alert("Error al cambiar estado de regla");
    }
  };

  // Handle test
  const handleTest = async (rule: AlertRule) => {
    setTesting(rule._id);
    try {
      const result = await testAlertRule(rule);
      if (result.success) {
        alert(result.triggered ? "¡Alerta se dispararía con las condiciones actuales!" : "Alerta no se dispararía con las condiciones actuales");
      } else {
        alert(`Error al probar: ${result.message}`);
      }
    } catch (error) {
      console.error("Error testing alert rule:", error);
      alert("Error al probar regla de alerta");
    } finally {
      setTesting(null);
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 border-red-500/30 text-red-400";
      case "high": return "bg-orange-500/20 border-orange-500/30 text-orange-400";
      case "medium": return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
      case "low": return "bg-green-500/20 border-green-500/30 text-green-400";
      default: return "bg-fused-bg-tertiary border-fused-glass-border text-fused-text-secondary";
    }
  };

  return (
    <div className="min-h-screen fused-bg p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="fused-aurora" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fused-animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-fused-text-primary tracking-tight" style={{ fontFamily: 'var(--fused-font-display)' }}>
              Sistema de Alertas
            </h1>
            <p className="text-sm text-fused-text-secondary font-medium mt-1">
              Configuración y monitoreo de alertas automáticas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="fused-mode-toggle">
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "rules" ? "active" : "text-fused-text-muted hover:text-fused-text-primary"
                }`}
              >
                <Settings size={14} className="inline mr-1" />
                Reglas
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "dashboard" ? "active" : "text-fused-text-muted hover:text-fused-text-primary"
                }`}
              >
                <Bell size={14} className="inline mr-1" />
                Dashboard
              </button>
            </div>
            {activeTab === "rules" && (
              <button
                onClick={() => {
                  setEditingRule(null);
                  setShowModal(true);
                }}
                className="fused-btn-primary flex items-center gap-2 h-10 px-5"
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">Nueva Regla</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        {activeTab === "rules" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fused-animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="fused-metric-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-fused-violet/10 border border-fused-violet/20">
                  <Bell size={20} className="text-fused-violet" />
                </div>
                <div>
                  <p className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                    Total Reglas
                  </p>
                  <p className="text-2xl font-bold text-fused-text-primary">{stats.totalRules}</p>
                </div>
              </div>
            </div>
            <div className="fused-metric-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Check size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                    Activas
                  </p>
                  <p className="text-2xl font-bold text-fused-text-primary">{stats.activeRules}</p>
                </div>
              </div>
            </div>
            <div className="fused-metric-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-fused-neon-blue/10 border border-fused-neon-blue/20">
                  <Bell size={20} className="text-fused-neon-blue" />
                </div>
                <div>
                  <p className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                    Disparos Hoy
                  </p>
                  <p className="text-2xl font-bold text-fused-text-primary">{stats.triggersToday}</p>
                </div>
              </div>
            </div>
            <div className="fused-metric-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-fused-gold/10 border border-fused-gold/20">
                  <Bell size={20} className="text-fused-gold" />
                </div>
                <div>
                  <p className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-1">
                    Esta Semana
                  </p>
                  <p className="text-2xl font-bold text-fused-text-primary">{stats.triggersThisWeek}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= RULES TAB ================= */}
        {activeTab === "rules" && (
          <div className="fused-animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {loading ? (
              <div className="col-span-full p-8 text-center">
                <Loader2 size={32} className="text-fused-text-muted mx-auto animate-spin" />
                <p className="text-fused-text-muted text-sm mt-2">Cargando reglas de alerta...</p>
              </div>
            ) : rules.length === 0 ? (
              <div className="fused-glass-card p-8 text-center">
                <Bell size={48} className="text-fused-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-fused-text-primary mb-2">No hay reglas configuradas</h3>
                <p className="text-fused-text-secondary text-sm mb-4">Crea tu primera regla de alerta para comenzar a monitorear el sistema</p>
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setShowModal(true);
                  }}
                  className="fused-btn-primary"
                >
                  <Plus size={18} className="inline mr-2" />
                  Crear Primera Regla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div key={rule._id} className="fused-nebula-panel p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-fused-violet/10 border border-fused-violet/20">
                          <Bell size={20} className="text-fused-violet" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-fused-text-primary">{rule.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(rule.priority)}`}>
                              {rule.priority}
                            </span>
                          </div>
                          <p className="text-xs text-fused-text-secondary">{rule.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleTest(rule)}
                          disabled={testing === rule._id}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-fused-text-muted hover:text-fused-text-primary transition-all disabled:opacity-50"
                          title="Probar regla"
                        >
                          {testing === rule._id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        </button>
                        <button
                          onClick={() => handleEdit(rule)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-fused-text-muted hover:text-fused-text-primary transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-fused-text-muted hover:text-red-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Condition */}
                    <div className="bg-fused-bg-tertiary rounded-lg p-3 border border-fused-glass-border mb-3">
                      <div className="text-[10px] text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
                        Condición
                      </div>
                      <div className="text-sm text-fused-text-primary">
                        {rule.condition.metric} {rule.condition.operator} {rule.condition.value}
                        {rule.condition.timeWindow && ` (últimos ${rule.condition.timeWindow})`}
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rule.channels.map((channel) => (
                        <span
                          key={channel}
                          className="px-2 py-1 rounded-lg bg-fused-gold/10 border border-fused-gold/20 text-[10px] font-semibold uppercase tracking-wider text-fused-gold"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-fused-glass-border">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(rule._id!, !rule.enabled)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            rule.enabled
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-white/5 text-fused-text-muted border border-fused-glass-border"
                          }`}
                        >
                          {rule.enabled ? <Check size={14} /> : <X size={14} />}
                          {rule.enabled ? "Activa" : "Inactiva"}
                        </button>
                      </div>
                      <div className="text-[10px] text-fused-text-tertiary">
                        Cooldown: {rule.cooldownMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === "dashboard" && (
          <div className="fused-animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <AlertDashboard />
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 fused-animate-fade-in">
          <div className="fused-glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-fused-glass-border flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-fused-text-primary" style={{ fontFamily: 'var(--fused-font-display)' }}>
                  {editingRule ? "Editar Regla de Alerta" : "Nueva Regla de Alerta"}
                </h2>
                <p className="text-sm text-fused-text-secondary mt-1">
                  Configura las condiciones y acciones de la alerta
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRule(null);
                }}
                className="w-10 h-10 rounded-xl bg-white/5 border border-fused-glass-border text-fused-text-muted hover:text-fused-text-primary hover:border-fused-gold/30 transition-all flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <AlertRuleBuilder
                initialRule={editingRule || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false);
                  setEditingRule(null);
                }}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
