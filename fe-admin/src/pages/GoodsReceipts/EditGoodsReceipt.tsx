import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  Col,
  Row,
  AutoComplete,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getGoodsReceipt, updateGoodsReceipt } from "@/apis/goodsReceipt.api";
import type {
  CreateGoodReceipt,
  DetailGoodsReceipt,
} from "@/types/goodsReceipt.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { QueryBuilder } from "@/utils/queryBuilder";
import { getSuppliers } from "@/apis/supplier.api";
import { getProducts } from "@/apis/product.api";
import type { BaseProduct, VariantProduct } from "@/types/product.type";
import { useDebounce } from "@/hooks/useDebounce";
import { da } from "zod/locales";

const { Option } = Select;
const { TextArea } = Input;

const EditGoodsReceiptPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { successNotification, errorNotification, warningNotification } =
    useNotificationContext();

  const fetchSuppliers = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();
    const response = await getSuppliers(query);
    if (response.success) {
      setSuppliers(response.data.data);
    } else {
      errorNotification("Lỗi tải danh sách nhà cung cấp", response.message);
    }
  };

  const fetchGoodsReceipt = async () => {
    if (!id) return;
    const response = await getGoodsReceipt(id);
    if (response.success) {
      const data: DetailGoodsReceipt = response.data;

      form.resetFields();

      form.setFieldsValue({
        supplierId: data.supplierId,
        note: data.note,
      });
      console.log("products", data.products);

      const productsList = data.products.map((p) => ({
        productId: p.productId,
        productName: p.name,
        quantity: p.quantity,
        price: p.price,
        variants: p.variants,
      }));

      // Đảm bảo Form.List hiển thị đủ field
      form.setFieldsValue({ products: productsList });
    } else {
      errorNotification("Lỗi tải phiếu nhập", response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetch = async () => {
      if (!debouncedSearch) return;
      const query = QueryBuilder.create()
        .search(debouncedSearch)
        .page(1)
        .limit(5)
        .build();

      const response = await getProducts(query);
      if (response.success) {
        setProducts(response.data.data);
      }
    };
    fetch();
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSuppliers();
    fetchGoodsReceipt();
  }, [id]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const data: CreateGoodReceipt = {
        supplierId: values.supplierId,
        products: values.products.map((p: any) => ({
          productId: p.productId,
          quantity: p.quantity,
          price: p.price,
        })),
        note: values.note,
      };
      const response = await updateGoodsReceipt(id!, data);
      if (!response.success) {
        throw new Error(response.message || "Lỗi cập nhật phiếu nhập");
      }
      successNotification("Cập nhật phiếu nhập thành công");
      navigate("/goods-receipts");
    } catch (error) {
      console.error("Error updating goods receipt:", error);
      errorNotification("Lỗi cập nhật phiếu nhập", "Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "12px", margin: "0 auto" }}>
      <h2>Chỉnh sửa phiếu nhập</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="supplierId"
              label="Nhà cung cấp"
              rules={[
                { required: true, message: "Vui lòng chọn nhà cung cấp" },
              ]}
            >
              <Select placeholder="Chọn nhà cung cấp">
                {suppliers.map((supplier) => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="products">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key}>
                  {" "}
                  <Row gutter={16} align="middle">
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "productName"]}
                        label="Tên sản phẩm"
                        rules={[
                          { required: true, message: "Vui lòng chọn sản phẩm" },
                        ]}
                      >
                        <AutoComplete
                          placeholder="Nhập tên sản phẩm"
                          onSearch={setSearchText}
                          onSelect={(value) => {
                            const selectedProduct = products.find(
                              (p) => p.name === value
                            );
                            if (!selectedProduct) return;

                            const currentProducts =
                              form.getFieldValue("products") || [];

                            const isDuplicate = currentProducts.some(
                              (p: BaseProduct, i: number) =>
                                i !== name && p.id === selectedProduct.id
                            );

                            if (isDuplicate) {
                              warningNotification(
                                "Sản phẩm đã được thêm",
                                "Vui lòng chọn sản phẩm khác"
                              );
                              return;
                            }

                            form.setFieldsValue({
                              products: currentProducts.map(
                                (p: BaseProduct, i: number) =>
                                  i === name
                                    ? {
                                        ...p,
                                        id: selectedProduct.id,
                                        productName: selectedProduct.name,
                                        price: selectedProduct.price || 0,
                                        variants: selectedProduct.variants.map(
                                          (v) => ({
                                            color: v.color,
                                            image: v.image,
                                            quantity: 0,
                                          })
                                        ),
                                      }
                                    : p
                              ),
                            });
                          }}
                          options={products.map((product) => ({
                            value: product.name,
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <img
                                  src={
                                    product.variants[0]?.image ||
                                    "/no-image.png"
                                  }
                                  alt={product.name}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    border: "1px solid #f0f0f0",
                                  }}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span style={{ fontWeight: 500 }}>
                                    {product.name}
                                  </span>
                                  <span style={{ fontSize: 12, color: "#888" }}>
                                    Có {product.variants.length} màu
                                  </span>
                                </div>
                              </div>
                            ),
                          }))}
                          popupRender={(menu) => (
                            <div
                              style={{
                                maxHeight: 250,
                                overflowY: "auto",
                                borderRadius: 8,
                              }}
                            >
                              {menu}
                            </div>
                          )}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        label="Số lượng"
                        rules={[
                          { required: true, message: "Vui lòng nhập số lượng" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          placeholder="Số lượng"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        label="Giá"
                        rules={[
                          { required: true, message: "Vui lòng nhập giá" },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          formatter={(value) =>
                            `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value!.replace(/₫\s?|(,*)/g, "")}
                          style={{ width: "100%" }}
                          placeholder="Giá"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Button danger onClick={() => remove(name)}>
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                  <Form.Item
                    shouldUpdate={(prev, cur) =>
                      prev.products?.[name]?.variants !==
                      cur.products?.[name]?.variants
                    }
                  >
                    {() => {
                      const variants =
                        form.getFieldValue(["products", name, "variants"]) ||
                        [];
                      return variants.length > 0 ? (
                        <div
                          style={{
                            marginLeft: 16,
                            marginBottom: 12,
                            background: "#fafafa",
                            padding: 12,
                            borderRadius: 8,
                          }}
                        >
                          <strong>Các màu:</strong>
                          {variants.map((v: VariantProduct, index: number) => (
                            <Row
                              key={index}
                              align="middle"
                              gutter={12}
                              style={{ marginTop: 8 }}
                            >
                              <Col span={10}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <img
                                    src={v.image}
                                    alt={v.color}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 6,
                                      objectFit: "cover",
                                      border: "1px solid #ddd",
                                    }}
                                  />
                                  <span>{v.color}</span>
                                </div>
                              </Col>
                              <Col span={8}>
                                <Form.Item
                                  name={[name, "variants", index, "quantity"]}
                                  label="Số lượng"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Nhập số lượng cho màu này",
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      ) : null;
                    }}
                  </Form.Item>
                </div>
              ))}

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm sản phẩm
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form.List>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="note" label="Ghi chú">
              <TextArea placeholder="Nhập ghi chú" rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24} style={{ textAlign: "right" }}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Cập nhật phiếu nhập
                </Button>
                <Button onClick={() => navigate("/goods-receipts")}>Hủy</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditGoodsReceiptPage;
