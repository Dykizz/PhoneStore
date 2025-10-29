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
import { useNavigate } from "react-router-dom";
import { createGoodsReceipt } from "@/apis/goodsReceipt.api";
import type { CreateGoodReceipt } from "@/types/goodsReceipt.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { QueryBuilder } from "@/utils/queryBuilder";
import { getSuppliers } from "@/apis/supplier.api";
import { getProducts } from "@/apis/product.api";
import type { BaseProduct } from "@/types/product.type";
import { useDebounce } from "@/hooks/useDebounce";

const { Option } = Select;
const { TextArea } = Input;

const CreateGoodsReceiptPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);
  const navigate = useNavigate();
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
  }, []);

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
      const response = await createGoodsReceipt(data);
      if (!response.success) {
        throw new Error(response.message || "Lỗi tạo phiếu nhập");
      }
      successNotification("Tạo phiếu nhập thành công");
      navigate("/goods-receipts");
    } catch (error) {
      console.error("Error creating goods receipt:", error);
      errorNotification("Lỗi tạo phiếu nhập", "Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "12px", margin: "0 auto" }}>
      <h2>Tạo phiếu nhập</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          products: [{}],
        }}
      >
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
                <Row gutter={16} key={key} align="middle">
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
                            (p) => p.id === value
                          );
                          if (!selectedProduct) return;

                          // ✅ Chặn trùng sản phẩm
                          const currentProducts =
                            form.getFieldValue("products") || [];
                          const isDuplicate = currentProducts.some(
                            (p: any, i: number) =>
                              i !== name && p.productId === selectedProduct.id
                          );

                          if (isDuplicate) {
                            warningNotification(
                              "Sản phẩm đã được thêm",
                              "Vui lòng chọn sản phẩm khác"
                            );
                            // ✅ Xoá giá trị trùng
                            form.setFieldsValue({
                              products: currentProducts.map(
                                (p: any, i: number) =>
                                  i === name
                                    ? { ...p, productName: "", productId: null }
                                    : p
                              ),
                            });
                            return;
                          }

                          // ✅ Gán giá trị cho sản phẩm
                          form.setFieldsValue({
                            products: currentProducts.map((p: any, i: number) =>
                              i === name
                                ? {
                                    ...p,
                                    productId: selectedProduct.id,
                                    productName: selectedProduct.name,
                                    price: selectedProduct.price || 0,
                                  }
                                : p
                            ),
                          });
                        }}
                        options={products.map((product) => ({
                          value: product.id,
                          label: (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <img
                                src={product.image || "/no-image.png"}
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
                                  ₫{product.price?.toLocaleString() || 0}
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
                      rules={[{ required: true, message: "Vui lòng nhập giá" }]}
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
                  Tạo phiếu nhập
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

export default CreateGoodsReceiptPage;
