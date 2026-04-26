import type { Order } from "../../types/order";
import OrderHeader from "./OrderHeader";
import OrderTableInfo from "./OrderTableInfo";
import OrderTimer from "./OrderTimer";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import { getTableLabel, isBarOrder } from "./orderCard.utils";

interface Props {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

export default function OrderCard(props: Props) {
  const { order } = props;

  const orderId = order._id ?? "";
  const tableLabel = getTableLabel(order.table);
  const isBar = isBarOrder(order.items);

  return (
    <div className="bg-void border border-obsidian/60 rounded-xl p-5 shadow-glass flex flex-col relative overflow-hidden group">

      {/* Accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        order.status === "completed"
          ? "bg-bar-green"
          : "bg-[#8B5CF6] group-hover:shadow-[0_0_15px_#8B5CF6]"
      }`} />

      <OrderHeader order={order} isBar={isBar} />

      <div className="flex justify-between items-end mb-6">
        <OrderTableInfo order={order} tableLabel={tableLabel} />
        <OrderTimer order={order} />
      </div>

      <OrderItems
        items={order.items}
        status={order.status}
        onSelectItem={props.onSelectItem}
        selectedItemId={props.selectedItemId}
      />

      <OrderActions
        orderId={orderId}
        status={order.status}
        onDelete={props.onDelete}
        onStatusChange={props.onStatusChange}
      />
    </div>
  );
}