// components/DiscountKeypad.tsx
import type { DiscountType } from "../types/discounts";

interface Props {
  type: DiscountType;
  setType: (t: DiscountType) => void;
  value: number;
  setValue: (v: number) => void;
}

export default function DiscountKeypad({
  type,
  setType,
  value,
  setValue,
}: Props) {
  const handleClick = (num: string) => {
    setValue(Number(`${value}${num}`));
  };

  return (
    <div className="bg-surface-container p-4 rounded-xl">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setType("PERCENT")}>%</button>
        <button onClick={() => setType("FLAT")}>$</button>
      </div>

      <div className="text-3xl font-bold text-center mb-4">
        {value} {type === "PERCENT" ? "%" : "$"}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6,7,8,9,0].map((n) => (
          <button
            key={n}
            onClick={() => handleClick(n.toString())}
            className="p-4 bg-gray-800 rounded"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}