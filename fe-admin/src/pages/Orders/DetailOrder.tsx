import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Badge,
  Button,
  Space,
  Spin,
  Row,
  Col,
  Image,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "@/apis/order.api";
import {
  OrderStatus,
  type DetailOrder,
  type PaymentMethod,
  type PaymentStatus,
} from "@/types/order.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import dayjs from "dayjs";
import { formatCurrencyVND } from "@/utils/util";
import { StatusButton } from "./StatusButton";

const { Title, Text } = Typography;

const DetailOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<DetailOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { errorNotification } = useNotificationContext();

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getOrder(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        errorNotification("Lỗi tải chi tiết đơn hàng", response.message);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      errorNotification("Lỗi hệ thống", "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      const response = await updateOrderStatus(id, status);
      if (!response.success) {
        throw new Error(response.message);
      }
      fetchOrderDetail();
    } catch (error) {
      console.error("Error updating order status:", error);
      errorNotification(
        "Lỗi cập nhật trạng thái đơn hàng",
        (error as Error).message
      );
    }
  };

  const getPaymentStatusConfig = (status: PaymentStatus) => {
    const configs = {
      pending: { color: "warning", text: "Chờ thanh toán" },
      completed: { color: "success", text: "Đã thanh toán" },
      failed: { color: "error", text: "Thanh toán thất bại" },
    };
    return configs[status] || { color: "default", text: status };
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    const methods = {
      credit_card: "Thẻ tín dụng",
      paypal: "PayPal",
      bank_transfer: "Chuyển khoản ngân hàng",
      cash_on_delivery: "Thanh toán khi nhận hàng (COD)",
    };
    return methods[method] || method;
  };

  const getOrderStatusConfig = (status: OrderStatus) => {
    const configs = {
      new: { color: "blue", text: "Mới" },
      processing: { color: "orange", text: "Đang xử lý" },
      shipped: { color: "cyan", text: "Đang giao" },
      delivered: { color: "green", text: "Đã giao" },
      cancelled: { color: "red", text: "Đã hủy" },
    };
    return configs[status] || { color: "default", text: status };
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: "40%",
      render: (_: any, record: any) => (
        <Space align="start">
          <Image
            src={record.productImage}
            alt={record.productName}
            width={80}
            height={80}
            style={{ objectFit: "cover", borderRadius: "8px" }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: "4px" }}>
              {record.productName}
            </div>
            <Tag color="blue">{record.variantColor}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right" as const,
      render: (price: number) =>
        `${price} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountPercent",
      key: "discountPercent",
      align: "center" as const,
      render: (discount: number) => (
        <Tag color={discount > 0 ? "red" : "default"}>
          {discount > 0 ? `-${discount}%` : "0%"}
        </Tag>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: number) => <Text strong>x{quantity}</Text>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right" as const,
      render: (total: number) => (
        <Text strong style={{ color: "#d4380d", fontSize: "16px" }}>
          {`${total} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "24px" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Text type="secondary">Không tìm thấy đơn hàng</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: "16px" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết đơn hàng
            </Title>
          </Space>
          <Space>
            <Tag
              color={getOrderStatusConfig(order.status).color}
              style={{ fontSize: "14px", padding: "4px 12px" }}
            >
              {getOrderStatusConfig(order.status).text}
            </Tag>
            <Badge
              status={getPaymentStatusConfig(order.paymentStatus).color as any}
              text={getPaymentStatusConfig(order.paymentStatus).text}
              style={{ fontSize: "14px" }}
            />
          </Space>
        </Space>
      </Card>

      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Thông tin đơn hàng</span>
            <StatusButton
              id={order.id}
              status={order.status}
              handleChange={handleStatusChange}
            />
          </div>
        }
        style={{ marginBottom: "16px" }}
      >
        <Descriptions column={3} bordered>
          <Descriptions.Item label="Mã đơn hàng" span={3}>
            <Text copyable code style={{ fontSize: "12px" }}>
              {order.id}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <CalendarOutlined /> Ngày tạo
              </>
            }
          >
            <div>
              <div>{dayjs(order.createdAt).format("DD/MM/YYYY")}</div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {dayjs(order.createdAt).format("HH:mm:ss")}
              </Text>
            </div>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <CalendarOutlined /> Cập nhật
              </>
            }
          >
            <div>
              <div>{dayjs(order.updatedAt).format("DD/MM/YYYY")}</div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {dayjs(order.updatedAt).format("HH:mm:ss")}
              </Text>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái đơn">
            <Tag color={getOrderStatusConfig(order.status).color}>
              {getOrderStatusConfig(order.status).text}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <CreditCardOutlined /> Phương thức
              </>
            }
          >
            <Tag color="blue">{getPaymentMethodText(order.paymentMethod)}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Thanh toán" span={2}>
            <Badge
              status={getPaymentStatusConfig(order.paymentStatus).color as any}
              text={getPaymentStatusConfig(order.paymentStatus).text}
            />
          </Descriptions.Item>

          <Descriptions.Item label="Tổng tiền" span={3}>
            <Text strong style={{ fontSize: "18px", color: "#d4380d" }}>
              {formatCurrencyVND(order.totalAmount)}
            </Text>
            <Text type="secondary" style={{ marginLeft: "16px" }}>
              ({order.items?.length || 0} sản phẩm -{" "}
              {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}{" "}
              món)
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Danh sách sản phẩm" style={{ marginBottom: "16px" }}>
        <Table
          columns={columns}
          dataSource={order.items || []}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <Text strong style={{ fontSize: "16px" }}>
                  Tổng cộng:
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ fontSize: "18px", color: "#d4380d" }}>
                  {formatCurrencyVND(order.totalAmount)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      <Card
        title={
          <>
            <EnvironmentOutlined /> Thông tin giao hàng
          </>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item
            label={
              <>
                <UserOutlined /> Người nhận
              </>
            }
          >
            <div>
              <div style={{ fontWeight: 500 }}>{order.customer.userName}</div>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {order.customer.email}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <PhoneOutlined /> Số điện thoại
              </>
            }
          >
            <Text copyable>{order.phoneNumber}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined /> Địa chỉ
              </>
            }
            span={2}
          >
            {order.addressShipping}
          </Descriptions.Item>

          {order.note && (
            <Descriptions.Item
              label={
                <>
                  <FileTextOutlined /> Ghi chú
                </>
              }
              span={2}
            >
              <Text italic>{order.note}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};

export default DetailOrderPage;
