interface Props {
  order: any;
  tableLabel: string | number;
}

export default function OrderTableInfo({ order, tableLabel }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-wider mb-1 text-white">
        MESA_{tableLabel}
      </h2>

      <p className="text-xs text-gray-500 tracking-widest">
        S_ID:{" "}
        {order.sessionId
          ? order.sessionId.slice(-6).toUpperCase()
          : "N/A"}
      </p>
    </div>
  );
}