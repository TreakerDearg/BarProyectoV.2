// components/RoulettePreview/RoulettePointer.tsx
import { Triangle } from "lucide-react";

export default function RoulettePointer() {
  return (
    <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-10 text-white">
      <Triangle size={20} className="fill-white" />
    </div>
  );
}