/**
 * StudioTechniquesView — Vista unificada de Técnicas + Decoraciones
 * Tabs internos · Cards de técnica/decoración · CRUD modal con validación
 * SIN overflow-y-auto propio — el DashboardLayout.main scrollea
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Paintbrush2, Flower2, Plus, Pencil, Trash2,
  RefreshCcw, X, ChevronDown, Loader2, Search,
} from 'lucide-react';
import {
  getTechniques, createTechnique, updateTechnique, deleteTechnique,
  getDecorations, createDecoration, updateDecoration, deleteDecoration,
} from '../../services/techniqueService';
import type { Technique, Decoration } from '../../types/technique';

// ── Constantes ─────────────────────────────────────────────────────
const TECHNIQUE_CATEGORIES = ['build','shake','stir','blend','smoke','layer','roll','muddle','strain'] as const;
const DECORATION_TYPES      = ['garnish','glassware','presentation','aroma','ice'] as const;
const DIFFICULTIES          = ['easy','medium','hard'] as const;

const DIFF_COLOR: Record<string, string> = {
  easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400   bg-amber-500/10   border-amber-500/20',
  hard:   'text-red-400     bg-red-500/10     border-red-500/20',
};

const CAT_COLOR: Record<string, string> = {
  build:  'text-cyan-300    bg-cyan-500/10    border-cyan-500/20',
  shake:  'text-violet-300  bg-violet-500/10  border-violet-500/20',
  stir:   'text-sky-300     bg-sky-500/10     border-sky-500/20',
  blend:  'text-pink-300    bg-pink-500/10    border-pink-500/20',
  smoke:  'text-orange-300  bg-orange-500/10  border-orange-500/20',
  layer:  'text-gold        bg-gold/10        border-gold/20',
  roll:   'text-teal-300    bg-teal-500/10    border-teal-500/20',
  muddle: 'text-rose-300    bg-rose-500/10    border-rose-500/20',
  strain: 'text-indigo-300  bg-indigo-500/10  border-indigo-500/20',
};

const DEC_TYPE_COLOR: Record<string, string> = {
  garnish:      'text-emerald-300  bg-emerald-500/10  border-emerald-500/20',
  glassware:    'text-cyan-300     bg-cyan-500/10     border-cyan-500/20',
  presentation: 'text-violet-300   bg-violet-500/10   border-violet-500/20',
  aroma:        'text-amber-300    bg-amber-500/10    border-amber-500/20',
  ice:          'text-sky-300      bg-sky-500/10      border-sky-500/20',
};

// ── Skeleton ───────────────────────────────────────────────────────
const Sk = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/8 animate-pulse`} />
);

// ── Modales ────────────────────────────────────────────────────────
// Technique Modal
interface TechniqueModalProps {
  item:    Technique | null;
  onSave:  (t: Technique) => Promise<void>;
  onClose: () => void;
}
function TechniqueModal({ item, onSave, onClose }: TechniqueModalProps) {
  const isEdit = !!item?._id;
  const [form, setForm] = useState<Technique>(
    item ?? { name: '', description: '', category: 'build', difficulty: 'easy', time: 30, equipment: [] }
  );
  const [equipInput, setEquipInput] = useState('');
  const [saving, setSaving]         = useState(false);
  const [error,  setError]          = useState('');

  const handle = (k: keyof Technique, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addEquip = () => {
    const val = equipInput.trim();
    if (val && !(form.equipment ?? []).includes(val)) {
      handle('equipment', [...(form.equipment ?? []), val]);
    }
    setEquipInput('');
  };

  const removeEquip = (e: string) =>
    handle('equipment', (form.equipment ?? []).filter((x) => x !== e));

  const submit = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F0F13] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h3 className="text-base font-bold text-ivory">{isEdit ? 'Editar técnica' : 'Nueva técnica'}</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-ivory p-1"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">{error}</div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Nombre *</label>
            <input
              type="text" value={form.name}
              onChange={(e) => handle('name', e.target.value)}
              placeholder="Ej: Shake clásico"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handle('description', e.target.value)}
              placeholder="Descripción breve de la técnica…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40 resize-none"
            />
          </div>

          {/* Categoría + Dificultad + Tiempo */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Categoría</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handle('category', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory pr-6 focus:outline-none focus:border-gold/40 cursor-pointer"
                >
                  {TECHNIQUE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0F0F13]">{c}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Dificultad</label>
              <div className="relative">
                <select
                  value={form.difficulty ?? 'easy'}
                  onChange={(e) => handle('difficulty', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory pr-6 focus:outline-none focus:border-gold/40 cursor-pointer"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d} className="bg-[#0F0F13]">{d}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Tiempo (seg)</label>
              <input
                type="number" value={form.time ?? 30} min={0}
                onChange={(e) => handle('time', Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold/40"
              />
            </div>
          </div>

          {/* Instrucciones */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Instrucciones</label>
            <textarea
              value={form.instructions ?? ''}
              onChange={(e) => handle('instructions', e.target.value)}
              placeholder="Paso a paso detallado…"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40 resize-none"
            />
          </div>

          {/* Equipamiento */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Equipamiento</label>
            <div className="flex gap-2">
              <input
                type="text" value={equipInput}
                onChange={(e) => setEquipInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEquip())}
                placeholder="Ej: Coctelera, colador…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40"
              />
              <button
                type="button" onClick={addEquip}
                className="px-3 py-2 rounded-xl bg-gold/15 border border-gold/25 text-gold text-xs font-bold hover:brightness-110"
              >
                Agregar
              </button>
            </div>
            {(form.equipment ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.equipment ?? []).map((e) => (
                  <span key={e} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/6 border border-white/10 text-[11px] text-muted">
                    {e}
                    <button type="button" onClick={() => removeEquip(e)} className="hover:text-red-400 ml-0.5">
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/8 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory transition-colors">
            Cancelar
          </button>
          <button
            type="button" onClick={submit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-bg font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear técnica'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Decoration Modal
interface DecorationModalProps {
  item:    Decoration | null;
  onSave:  (d: Decoration) => Promise<void>;
  onClose: () => void;
}
function DecorationModal({ item, onSave, onClose }: DecorationModalProps) {
  const isEdit = !!item?._id;
  const [form, setForm] = useState<Decoration>(
    item ?? { name: '', type: 'garnish', description: '', category: '', cost: 0 }
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handle = (k: keyof Decoration, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e?.response?.data?.message ?? e.message ?? 'Error al guardar'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0F0F13] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h3 className="text-base font-bold text-ivory">{isEdit ? 'Editar decoración' : 'Nueva decoración'}</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-ivory p-1"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">{error}</div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Nombre *</label>
            <input type="text" value={form.name} onChange={(e) => handle('name', e.target.value)}
              placeholder="Ej: Rodaja de limón"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Tipo</label>
              <div className="relative">
                <select value={form.type} onChange={(e) => handle('type', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory pr-6 focus:outline-none focus:border-gold/40 cursor-pointer">
                  {DECORATION_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0F0F13]">{t}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Costo ($)</label>
              <input type="number" value={form.cost ?? 0} min={0} step={0.1}
                onChange={(e) => handle('cost', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold/40" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Categoría</label>
            <input type="text" value={form.category ?? ''} onChange={(e) => handle('category', e.target.value)}
              placeholder="Ej: Cítricos"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => handle('description', e.target.value)}
              placeholder="Descripción opcional…" rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/40 resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/8 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-bg font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all">
            {saving && <Loader2 size={12} className="animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear decoración'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#0F0F13] border border-white/10 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-bold text-ivory">¿Eliminar "{name}"?</p>
        <p className="text-xs text-muted">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory">Cancelar</button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-xs font-bold hover:brightness-110">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Technique Card ─────────────────────────────────────────────────
function TechniqueCard({
  item, onEdit, onDelete,
}: { item: Technique; onEdit: () => void; onDelete: () => void }) {
  const catCls  = CAT_COLOR[item.category]  ?? 'text-muted bg-white/5 border-white/8';
  const diffCls = DIFF_COLOR[item.difficulty ?? 'easy'] ?? 'text-muted bg-white/5 border-white/8';

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-4 flex flex-col gap-3 hover:border-white/14 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Paintbrush2 size={14} className="text-violet-300" />
          </div>
          <p className="text-sm font-semibold text-ivory truncate">{item.name}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button type="button" onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/8 text-muted hover:text-ivory transition-colors">
            <Pencil size={12} />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {item.description && (
        <p className="text-[11px] text-muted/70 leading-relaxed line-clamp-2">{item.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize ${catCls}`}>
          {item.category}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize ${diffCls}`}>
          {item.difficulty ?? 'easy'}
        </span>
        {(item.time ?? 0) > 0 && (
          <span className="text-[10px] text-muted bg-white/5 border border-white/8 px-2 py-0.5 rounded-lg">
            {item.time}s
          </span>
        )}
      </div>

      {(item.equipment ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/6">
          {(item.equipment ?? []).slice(0, 3).map((e) => (
            <span key={e} className="text-[10px] text-muted/60 bg-white/4 px-2 py-0.5 rounded">{e}</span>
          ))}
          {(item.equipment ?? []).length > 3 && (
            <span className="text-[10px] text-muted/40">+{(item.equipment ?? []).length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Decoration Card ────────────────────────────────────────────────
function DecorationCard({
  item, onEdit, onDelete,
}: { item: Decoration; onEdit: () => void; onDelete: () => void }) {
  const typeCls = DEC_TYPE_COLOR[item.type] ?? 'text-muted bg-white/5 border-white/8';

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-4 flex flex-col gap-3 hover:border-white/14 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Flower2 size={14} className="text-emerald-300" />
          </div>
          <p className="text-sm font-semibold text-ivory truncate">{item.name}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button type="button" onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/8 text-muted hover:text-ivory transition-colors">
            <Pencil size={12} />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {item.description && (
        <p className="text-[11px] text-muted/70 leading-relaxed line-clamp-2">{item.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize ${typeCls}`}>
          {item.type}
        </span>
        {item.category && (
          <span className="text-[10px] text-muted bg-white/5 border border-white/8 px-2 py-0.5 rounded-lg capitalize">
            {item.category}
          </span>
        )}
        {(item.cost ?? 0) > 0 && (
          <span className="text-[10px] text-gold bg-gold/8 border border-gold/15 px-2 py-0.5 rounded-lg">
            ${item.cost?.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────
type Tab = 'techniques' | 'decorations';

export function StudioTechniquesView() {
  const [tab,         setTab]         = useState<Tab>('techniques');
  const [techniques,  setTechniques]  = useState<Technique[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');

  // Modal state
  const [editTech,   setEditTech]   = useState<Technique | null | undefined>(undefined); // undefined = closed
  const [editDec,    setEditDec]    = useState<Decoration | null | undefined>(undefined);
  const [deleteTech, setDeleteTech] = useState<Technique | null>(null);
  const [deleteDec,  setDeleteDec]  = useState<Decoration | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, d] = await Promise.all([
        getTechniques().catch(() => []),
        getDecorations().catch(() => []),
      ]);
      setTechniques(t);
      setDecorations(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // CRUD técnicas
  const saveTechnique = async (t: Technique) => {
    if (t._id) { const updated = await updateTechnique(t._id, t); setTechniques((prev) => prev.map((x) => x._id === t._id ? updated : x)); }
    else        { const created = await createTechnique(t);        setTechniques((prev) => [...prev, created]); }
  };
  const confirmDeleteTech = async () => {
    if (!deleteTech?._id) return;
    await deleteTechnique(deleteTech._id);
    setTechniques((prev) => prev.filter((x) => x._id !== deleteTech._id));
    setDeleteTech(null);
  };

  // CRUD decoraciones
  const saveDecoration = async (d: Decoration) => {
    if (d._id) { const updated = await updateDecoration(d._id, d); setDecorations((prev) => prev.map((x) => x._id === d._id ? updated : x)); }
    else        { const created = await createDecoration(d);        setDecorations((prev) => [...prev, created]); }
  };
  const confirmDeleteDec = async () => {
    if (!deleteDec?._id) return;
    await deleteDecoration(deleteDec._id);
    setDecorations((prev) => prev.filter((x) => x._id !== deleteDec._id));
    setDeleteDec(null);
  };

  // Filtrado
  const filteredTech = techniques.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDec = decorations.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto w-full">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ivory">Técnicas &amp; Decoraciones</h1>
          <p className="text-xs text-muted mt-0.5">
            {loading ? 'Cargando…' : `${techniques.length} técnicas · ${decorations.length} decoraciones`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button" onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors disabled:opacity-40"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => tab === 'techniques' ? setEditTech(null) : setEditDec(null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-bg font-bold text-xs hover:brightness-110 transition-all shadow-[0_4px_12px_rgba(212,163,64,0.2)]"
          >
            <Plus size={14} />
            {tab === 'techniques' ? 'Nueva técnica' : 'Nueva decoración'}
          </button>
        </div>
      </div>

      {/* ── Tabs + Búsqueda ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/3">
          <button
            type="button" onClick={() => setTab('techniques')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'techniques' ? 'bg-gold/15 text-gold border border-gold/25' : 'text-muted hover:text-ivory'
            }`}
          >
            <Paintbrush2 size={13} />
            Técnicas
            <span className="bg-white/10 px-1.5 py-0.5 rounded-md text-[10px]">{techniques.length}</span>
          </button>
          <button
            type="button" onClick={() => setTab('decorations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'decorations' ? 'bg-gold/15 text-gold border border-gold/25' : 'text-muted hover:text-ivory'
            }`}
          >
            <Flower2 size={13} />
            Decoraciones
            <span className="bg-white/10 px-1.5 py-0.5 rounded-md text-[10px]">{decorations.length}</span>
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar ${tab === 'techniques' ? 'técnica' : 'decoración'}…`}
            className="w-48 bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-surface-3/40 p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-2"><Sk w="w-8" h="h-8" /><Sk w="w-24" h="h-3.5" /></div>
              <Sk h="h-3" /><Sk w="w-28" h="h-3" />
              <div className="flex gap-1.5"><Sk w="w-14" h="h-5" /><Sk w="w-14" h="h-5" /></div>
            </div>
          ))}
        </div>
      ) : tab === 'techniques' ? (
        filteredTech.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Paintbrush2 size={36} className="text-muted/25 mb-3" />
            <p className="text-sm font-semibold text-muted">Sin técnicas</p>
            <p className="text-xs text-muted/50 mt-1">Creá la primera técnica con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTech.map((t) => (
              <TechniqueCard
                key={t._id} item={t}
                onEdit={() => setEditTech(t)}
                onDelete={() => setDeleteTech(t)}
              />
            ))}
          </div>
        )
      ) : (
        filteredDec.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Flower2 size={36} className="text-muted/25 mb-3" />
            <p className="text-sm font-semibold text-muted">Sin decoraciones</p>
            <p className="text-xs text-muted/50 mt-1">Creá la primera decoración con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDec.map((d) => (
              <DecorationCard
                key={d._id} item={d}
                onEdit={() => setEditDec(d)}
                onDelete={() => setDeleteDec(d)}
              />
            ))}
          </div>
        )
      )}

      {/* ── Modales ───────────────────────────────────────────── */}
      {editTech !== undefined && (
        <TechniqueModal
          item={editTech}
          onSave={saveTechnique}
          onClose={() => setEditTech(undefined)}
        />
      )}
      {editDec !== undefined && (
        <DecorationModal
          item={editDec}
          onSave={saveDecoration}
          onClose={() => setEditDec(undefined)}
        />
      )}
      {deleteTech && (
        <DeleteConfirm
          name={deleteTech.name}
          onConfirm={confirmDeleteTech}
          onClose={() => setDeleteTech(null)}
        />
      )}
      {deleteDec && (
        <DeleteConfirm
          name={deleteDec.name}
          onConfirm={confirmDeleteDec}
          onClose={() => setDeleteDec(null)}
        />
      )}
    </div>
  );
}
