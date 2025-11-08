import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Descriptions,
  Image,
  Tag,
  Typography,
  Button,
  Space,
  Divider,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import type { DetailProduct } from "@/types/product.type";
import { getProduct } from "@/apis/product.api";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { formatCurrencyVND } from "@/utils/util";

const { Title, Paragraph } = Typography;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { errorNotification } = useNotificationContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id!);
        if (response.success) {
          setProduct(response.data);
        } else {
          errorNotification("Lỗi tải chi tiết sản phẩm", response.message);
        }
      } catch (err) {
        console.error(err);
        errorNotification("Lỗi hệ thống", "Không thể tải chi tiết sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>Đang tải...</p>;

  const discountStatus = () => {
    if (!product.discount) return null;
    const now = new Date();
    const start = new Date(product.discount.startDate);
    const end = new Date(product.discount.endDate);
    if (now < start) return <Tag color="orange">Sắp diễn ra</Tag>;
    if (now <= end) return <Tag color="green">Đang diễn ra</Tag>;
    return <Tag color="red">Đã hết hạn</Tag>;
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Nút điều hướng */}
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Link to="/products">
          <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
        </Link>
        <Link to={`/products/edit/${product.id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Chỉnh sửa
          </Button>
        </Link>
      </Space>

      <Card loading={loading} bordered>
        <Row gutter={32}>
          {/* Ảnh sản phẩm và các biến thể */}
          <Col xs={24} md={10}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 300,
                  height: 300,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fafafa",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  src={product.variants[selectedVariantIndex]?.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  preview={true}
                />
              </div>
              <Space
                wrap
                style={{
                  marginTop: 12,
                  justifyContent: "center",
                }}
              >
                <Tag color="blue">
                  {product.variants[selectedVariantIndex]?.color} | Tồn kho:{" "}
                  {product.variants[selectedVariantIndex].quantity} | Đã bán:{" "}
                  {product.variants[selectedVariantIndex]?.quantitySold || 0}
                </Tag>
              </Space>
              {/* Biến thể */}
              <Divider />
              <Title level={5} style={{ marginBottom: 8 }}>
                Các biến thể:
              </Title>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {product.variants?.map((v, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVariantIndex(index)}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border:
                        selectedVariantIndex === index
                          ? "2px solid #1677ff"
                          : "1px solid #ddd",
                      cursor: "pointer",
                      background: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow:
                        selectedVariantIndex === index
                          ? "0 0 6px rgba(22,119,255,0.3)"
                          : undefined,
                    }}
                  >
                    <img
                      src={v.image}
                      alt={v.color}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Thông tin sản phẩm */}
          <Col xs={24} md={14}>
            <Title level={3}>{product.name}</Title>

            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Giá">
                {formatCurrencyVND(product.price)}
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                {product.discount
                  ? `${product.discount.discountPercent}%`
                  : "Không có"}{" "}
                {discountStatus()}
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">
                {product.brandName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại sản phẩm">
                {product.productTypeName}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng còn lại">
                {product.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Đã bán">
                {product.quantitySold}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng bán ra">
                {product.isReleased ? (
                  <Tag color="green">Đang bán</Tag>
                ) : (
                  <Tag color="red">Ngừng bán</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {product.createdBy?.userName || "Không rõ"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleString("vi-VN")
                  : "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật gần nhất">
                {product.updatedAt
                  ? new Date(product.updatedAt).toLocaleString("vi-VN")
                  : "Không có"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>Mô tả ngắn</Title>
            <Paragraph>{product.baseDescription || "Không có"}</Paragraph>

            <Title level={5}>Mô tả chi tiết</Title>
            <Paragraph>{product.detailDescription || "Không có"}</Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
