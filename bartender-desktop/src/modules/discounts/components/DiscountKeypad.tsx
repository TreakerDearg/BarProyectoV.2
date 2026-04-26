// components/DiscountKeypad.tsx
import type { DiscountType } from "../types/discounts";

interface Props {
  type: DiscountType;
  setType: (t: DiscountType) => void;
  value: number;
  valueInput: string;
  appendNumber: (v: string) => void;
  removeLast: () => void;
}

export default function DiscountKeypad({
  type,
  setType,
  value,
  valueInput,
  appendNumber,
  removeLast,
}: Props) {
  const keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="bg-surface-container border border-white/10 p-4 rounded-xl">
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={() => setType("PERCENT")}
          className={`py-2 rounded-lg text-sm font-semibold transition ${
            type === "PERCENT"
              ? "bg-primary text-black"
              : "bg-surface-container-high text-gray-300 hover:bg-surface-container-highest"
          }`}
        >
          PERCENT (%)
        </button>
        <button
          onClick={() => setType("FLAT")}
          className={`py-2 rounded-lg text-sm font-semibold transition ${
            type === "FLAT"
              ? "bg-primary text-black"
              : "bg-surface-container-high text-gray-300 hover:bg-surface-container-highest"
          }`}
        >
          FLAT ($)
        </button>
      </div>

      <div className="text-4xl font-black text-center mb-5 text-white">
        {value} {type === "PERCENT" ? "%" : "$"}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keypadNumbers.map((key) => (
          <button
            key={key}
            onClick={() => appendNumber(key)}
            className="p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-lg font-semibold text-white transition"
          >
            {key}
          </button>
        ))}
        <button
          onClick={removeLast}
          className="p-4 bg-red-500/15 hover:bg-red-500/25 rounded-lg text-red-300 font-semibold transition"
        >
          ⌫
        </button>
        <button
          onClick={() => appendNumber("0")}
          className="p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-lg font-semibold text-white transition"
        >
          0
        </button>
        <button
          onClick={() => appendNumber(".")}
          className="p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-lg font-semibold text-white transition"
        >
          .
        </button>
      </div>
      <p className="mt-3 text-[11px] text-gray-500 text-center">Input: {valueInput}</p>
    </div>
  );
}