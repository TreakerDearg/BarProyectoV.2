// components/DiscountStats.tsx

export default function DiscountStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-surface-container rounded-xl">
        <p>Total Today</p>
        <p className="text-xl font-bold">-$142</p>
      </div>

      <div className="p-4 bg-surface-container rounded-xl">
        <p>Approvals</p>
        <p className="text-xl font-bold">∞</p>
      </div>

      <div className="p-4 bg-surface-container rounded-xl">
        <p>Avg Discount</p>
        <p className="text-xl font-bold">8.4%</p>
      </div>
    </div>
  );
}