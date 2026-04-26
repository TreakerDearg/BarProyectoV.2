import type { DiscountReason } from "../types/discounts";

interface Props {
  reason: DiscountReason;
  setReason: (r: DiscountReason) => void;
  note: string;
  setNote: (n: string) => void;
}

export default function DiscountReasonForm({
  reason,
  setReason,
  note,
  setNote,
}: Props) {
  return (
    <div className="bg-surface-container border border-white/10 p-4 rounded-xl">
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Adjustment reason</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as DiscountReason)}
        className="w-full mb-3 bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-sm"
      >
        <option value="WAIT_TIME">Long Wait Time</option>
        <option value="QUALITY_ISSUE">Quality Issue</option>
        <option value="COMP">On The House (Comp)</option>
        <option value="EMPLOYEE">Employee Courtesy</option>
        <option value="OTHER">Other</option>
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional notes for auditing..."
        className="w-full min-h-[90px] bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
      />
    </div>
  );
}