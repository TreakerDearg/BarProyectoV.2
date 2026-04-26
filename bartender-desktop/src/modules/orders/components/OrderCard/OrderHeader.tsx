export default function OrderHeader({ order, isBar }: any) {
  const orderId = order._id ?? "";

  return (
    <div className="flex justify-between items-start mb-6">
      <span className="text-xs text-gray-400 tracking-widest font-bold">
        ORD_{orderId.slice(-4).toUpperCase()}
      </span>

      <span className={`px-2 py-0.5 rounded text-[9px] tracking-widest font-bold border ${
        order.status === "completed"
          ? "border-bar-green/30 bg-bar-green/10 text-bar-green"
          : "border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]"
      }`}>
        {order.status === "completed" ? "COMPLETED" : isBar ? "BAR" : "KITCHEN"}
      </span>
    </div>
  );
}