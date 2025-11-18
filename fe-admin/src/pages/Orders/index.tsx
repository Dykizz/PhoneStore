import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Row,
  Col,
  Tag,
  Badge,
} from "antd";
import { SearchOutlined, EyeFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { QueryBuilder } from "@/utils/queryBuilder";
import { getOrders, updateOrderStatus } from "@/apis/order.api";
import {
  OrderStatus,
  type BaseOrder,
  type PaymentMethod,
  type PaymentStatus,
} from "@/types/order.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import dayjs from "dayjs";
import { formatCurrencyVND } from "@/utils/util";
import { StatusButton } from "./StatusButton";

const { Option } = Select;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<BaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethod | undefined
  >();
  const [paymentStatus, setPaymentStatus] = useState<
    PaymentStatus | undefined
  >();
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const { errorNotification } = useNotificationContext();

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(searchText)
        .filterIf(!!status, "status", status)
        .filterIf(!!paymentMethod, "paymentMethod", paymentMethod)
        .filterIf(!!paymentStatus, "paymentStatus", paymentStatus)
        .sortBy(sortBy, sortOrder)
        .build();

      const response = await getOrders(query);

      if (response.success) {
        setOrders(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      } else {
        errorNotification("Lỗi tải danh sách đơn hàng", response.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      errorNotification("Lỗi hệ thống", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.current);
  }, [searchText, status, paymentMethod, paymentStatus, sortBy, sortOrder]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchOrders(1);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const order = sorter.order === "ascend" ? "ASC" : "DESC";
    const field = sorter.field || "createdAt";
    setSortBy(field);
    setSortOrder(order);
    fetchOrders(pagination.current);
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

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      const response = await updateOrderStatus(id, status);
      if (!response.success) {
        throw new Error(response.message);
      }
      fetchOrders(pagination.current);
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
      bank_transfer: "Chuyển khoản",
      cash_on_delivery: "COD",
    };
    return methods[method] || method;
  };

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: BaseOrder["customer"]) => (
        <div>
          <div style={{ fontWeight: 500 }}>{customer.userName}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {customer.email}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: true,
      render: formatCurrencyVND,
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus) => {
        const config = getOrderStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thanh toán",
      key: "payment",
      render: (_: any, record: BaseOrder) => (
        <Space direction="vertical" size={4}>
          <Tag color="blue">{getPaymentMethodText(record.paymentMethod)}</Tag>
          <Badge
            status={getPaymentStatusConfig(record.paymentStatus).color as any}
            text={getPaymentStatusConfig(record.paymentStatus).text}
          />
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: Date) => (
        <div>
          <div>{dayjs(date).format("DD/MM/YYYY")}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {dayjs(date).format("HH:mm:ss")}
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: BaseOrder) => (
        <Space>
          <StatusButton
            id={record.id}
            status={record.status}
            handleChange={handleStatusChange}
          />
          <Link to={`/orders/${record.id}`}>
            <Button type="link" icon={<EyeFilled />}>
              Chi tiết
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Quản lý đơn hàng</h2>
      </div>

      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: "16px" }}>
        <Col span={8}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={5}>
          <Select
            placeholder="Trạng thái đơn hàng"
            value={status}
            onChange={(value) => setStatus(value)}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="new">Mới</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="shipped">Đang giao</Option>
            <Option value="delivered">Đã giao</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Col>
        <Col span={5}>
          <Select
            placeholder="Phương thức thanh toán"
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value)}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="bank_transfer">Chuyển khoản</Option>
            <Option value="cash_on_delivery">COD</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Trạng thái thanh toán"
            value={paymentStatus}
            onChange={(value) => setPaymentStatus(value)}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="pending">Chờ thanh toán</Option>
            <Option value="completed">Đã thanh toán</Option>
            <Option value="failed">Thanh toán thất bại</Option>
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} đơn hàng`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default OrdersPage;
