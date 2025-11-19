import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Image,
  Typography,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getGoodsReceipt } from "@/apis/goodsReceipt.api";
import type { DetailGoodsReceipt } from "@/types/goodsReceipt.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { formatCurrencyVND } from "@/utils/util";

const { Title, Text } = Typography;

const DetailGoodsReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailGoodsReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const { errorNotification } = useNotificationContext();

  useEffect(() => {
    const fetchGoodsReceipt = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getGoodsReceipt(id);
        if (response.success) {
          setData(response.data);
        } else {
          errorNotification("Lỗi tải thông tin", response.message);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
        errorNotification("Lỗi hệ thống", "Không thể tải dữ liệu phiếu nhập");
      } finally {
        setLoading(false);
      }
    };

    fetchGoodsReceipt();
  }, [id]);

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 350,
      render: (_: any, record: any) => (
        <Space>
          <Image
            width={50}
            height={50}
            src={record.variants?.[0]?.image || "/no-image.png"}
            style={{ objectFit: "cover", borderRadius: 6 }}
            fallback="/no-image.png"
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.variants?.length || 0} biến thể màu
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Đơn giá nhập",
      dataIndex: "price",
      key: "price",
      align: "right" as const,
      render: (price: number) => formatCurrencyVND(price),
    },
    {
      title: "Số lượng tổng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (qty: number) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Text strong style={{ color: "#cf1322" }}>
          {formatCurrencyVND(record.price * record.quantity)}
        </Text>
      ),
    },
  ];

  const expandedRowRender = (record: any) => {
    const variantColumns = [
      {
        title: "Hình ảnh",
        dataIndex: "image",
        key: "image",
        render: (src: string) => (
          <Image
            src={src}
            width={40}
            height={40}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ),
      },
      {
        title: "Màu sắc",
        dataIndex: "color",
        key: "color",
        render: (text: string) => <Tag>{text}</Tag>,
      },
      {
        title: "Số lượng nhập",
        dataIndex: "quantity",
        key: "quantity",
      },
    ];

    return (
      <Table
        columns={variantColumns}
        dataSource={record.variants || []}
        pagination={false}
        size="small"
        rowKey={(item: any) => item.color}
        bordered
      />
    );
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!data) return <div>Không tìm thấy dữ liệu phiếu nhập</div>;

  const totalAmount =
    data.products?.reduce((acc, cur) => acc + cur.price * cur.quantity, 0) || 0;

  return (
    <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/goods-receipts")}
          >
            Quay lại
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Chi tiết phiếu nhập
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/goods-receipts/edit/${id}`)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Thông tin chung */}
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            <Descriptions
              title="Thông tin chung"
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="Nhà cung cấp">
                {/* Giả định API trả về supplierName hoặc object supplier */}
                <Space>
                  <UserOutlined />
                  <Text strong>
                    {(data as any).supplierName || data.supplierId}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                <Space>
                  <CalendarOutlined />
                  {/* Giả định API có trường createdAt */}
                  {(data as any).createdAt
                    ? dayjs((data as any).createdAt).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="green">Hoàn thành</Tag>
                {/* Logic trạng thái tùy thuộc vào data của bạn */}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={3}>
                {data.note || <Text type="secondary">Không có ghi chú</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Danh sách sản phẩm */}
        <Col span={24}>
          <Card
            title="Danh sách sản phẩm nhập kho"
            bordered={false}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={columns}
              dataSource={data.products}
              rowKey="productId" // Hoặc id
              pagination={false}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) =>
                  record.variants && record.variants.length > 0,
                expandRowByClick: true,
              }}
              summary={(pageData) => {
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: "#fafafa" }}>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>TỔNG CỘNG</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="center">
                        <Text strong>
                          {pageData.reduce((acc, cur) => acc + cur.quantity, 0)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text
                          style={{
                            fontSize: 18,
                            color: "#cf1322",
                            fontWeight: "bold",
                          }}
                        >
                          {formatCurrencyVND(totalAmount)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DetailGoodsReceiptPage;
