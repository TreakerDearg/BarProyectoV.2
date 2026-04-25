// components/DiscountReasonForm.tsx

interface Props {
  reason: string;
  setReason: (r: string) => void;
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
    <div className="bg-surface-container p-4 rounded-xl">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full mb-3"
      >
        <option value="WAIT_TIME">Wait Time</option>
        <option value="QUALITY_ISSUE">Quality</option>
        <option value="COMP">Comp</option>
        <option value="EMPLOYEE">Employee</option>
        <option value="OTHER">Other</option>
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notes..."
        className="w-full"
      />
    </div>
  );
}