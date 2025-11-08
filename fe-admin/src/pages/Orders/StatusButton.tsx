import { OrderStatus } from "@/types/order.type";
import { Button, Space } from "antd";

interface StatusButtonProps {
  id: string;
  status: OrderStatus;
  handleChange: (id: string, status: OrderStatus) => void;
}

export const StatusButton = ({
  id,
  status,
  handleChange,
}: StatusButtonProps) => {
  const getNextStatusConfig = (status: OrderStatus) => {
    const configs = {
      processing: {
        color: "#52c41a",
        text: "Xác nhận đơn",
      },
      shipped: {
        color: "#1890ff",
        text: "Giao hàng",
      },
      delivered: {
        color: "#722ed1",
        text: "Hoàn tất đơn",
      },
      cancelled: {
        color: "#ff4d4f",
        text: "Hủy đơn",
      },
      new: {
        color: "#1890ff",
        text: "Mới",
      },
    };
    return configs[status] || { color: "#1890ff", text: status };
  };
  if (status === "delivered" || status === "cancelled") {
    return null;
  }

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    new: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    processing: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    shipped: [OrderStatus.DELIVERED],
    delivered: [],
    cancelled: [],
  };

  const availableStatuses = validTransitions[status] || [];

  if (availableStatuses.length === 0) {
    return null;
  }

  if (availableStatuses.length === 1) {
    const nextStatus = availableStatuses[0];
    const config = getNextStatusConfig(nextStatus);

    return (
      <Button
        type="primary"
        style={{
          backgroundColor: config.color,
          borderColor: config.color,
        }}
        onClick={() => handleChange(id, nextStatus)}
      >
        {config.text}
      </Button>
    );
  }
  return (
    <Space>
      {availableStatuses.map((nextStatus) => {
        const config = getNextStatusConfig(nextStatus);
        return (
          <Button
            key={nextStatus}
            type={nextStatus === "cancelled" ? "default" : "primary"}
            danger={nextStatus === "cancelled"}
            style={
              nextStatus !== "cancelled"
                ? {
                    backgroundColor: config.color,
                    borderColor: config.color,
                  }
                : undefined
            }
            onClick={() => handleChange(id, nextStatus)}
          >
            {config.text}
          </Button>
        );
      })}
    </Space>
  );
};
