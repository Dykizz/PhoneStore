import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Switch,
  Upload,
  Space,
  message,
  Col,
  Row,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createProduct } from "@/apis/product.api";
import type { CreateProduct } from "@/types/product.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { QueryBuilder } from "@/utils/queryBuilder";
import { getBrands } from "@/apis/brand.api";
import { getProductTypes } from "@/apis/productType.api";
import type { ProductType } from "@/types/productType.type";
import type { Brand } from "@/types/brand.type";
import type { DiscountPolicy } from "@/types/discountPolicy.type";
import { getDiscountPolicies } from "@/apis/discountPolicy.api";

const { Option } = Select;
const { TextArea } = Input;

const AddProductPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [productTypes, setproductTypes] = useState<ProductType[]>([]);
  const [discountPolicies, setDiscountPolicies] = useState<
    { id: string; name: string }[]
  >([]);
  const navigate = useNavigate();
  const { successNotification, errorNotification } = useNotificationContext();
  const mapBrands = useMemo(() => {
    const map = new Map<string, string>();
    brands.forEach((brand) => map.set(brand.id, brand.name));
    return map;
  }, [brands]);

  const handleProductTypeChange = async (productTypeId: string) => {
    form.setFieldsValue({ productTypeId });
    if (productTypeId) {
      try {
        const specsLabels =
          productTypes.find((type) => type.id === productTypeId)
            ?.defaultSpecifications || [];
        const specsFields = specsLabels.map((label: string) => ({
          label,
          value: "",
        }));

        form.setFieldsValue({
          specifications: specsFields,
        });
      } catch (error) {
        console.error("Error fetching default specs:", error);
        form.setFieldsValue({
          specifications: [],
        });
      }
    } else {
      form.setFieldsValue({
        specifications: [],
      });
    }
  };

  const mapDiscountPolicies = useMemo(() => {
    const map = new Map<string, string>();
    discountPolicies.forEach((policy) => map.set(policy.id, policy.name));
    return map;
  }, [discountPolicies]);

  const fetchBrands = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();

    const brandsData = await getBrands(query);
    if (brandsData.success) {
      const tmp: { id: string; name: string }[] = [];
      brandsData.data.data.forEach((brand: Brand) => {
        mapBrands.set(brand.id, brand.name);
        tmp.push({ id: brand.id, name: brand.name });
      });
      setBrands(tmp);
    } else {
      errorNotification("Lỗi tải danh sách thương hiệu", brandsData.message);
    }
  };

  const fetchProductTypes = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();
    const response = await getProductTypes(query);
    if (response.success) {
      setproductTypes(response.data.data);
    } else {
      errorNotification("Lỗi tải danh sách loại sản phẩm", response.message);
    }
  };

  const fetchDiscountPolicies = async () => {
    const query = QueryBuilder.create()
      .filterGte("endDate", new Date().toISOString())
      .page(1)
      .limit(100)
      .build();
    const response = await getDiscountPolicies(query);
    if (response.success) {
      const tmp: { id: string; name: string }[] = [];
      response.data.data.forEach((policy: DiscountPolicy) => {
        mapDiscountPolicies.set(policy.id, policy.name);
        tmp.push({ id: policy.id, name: policy.name });
      });
      setDiscountPolicies(tmp);
    } else {
      errorNotification(
        "Lỗi tải danh sách chính sách giảm giá",
        response.message
      );
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchProductTypes();
    fetchDiscountPolicies();
  }, []);
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const variants =
        values.colorImages?.map((item: any) => ({
          color: item.color,
          quantity: Number(item.quantity),
          image: item.image[0].originFileObj ?? item.image[0].url,
        })) || [];

      const data: CreateProduct = {
        baseDescription: values.baseDescription,
        detailDescription: values.detailDescription,
        name: values.name,
        isReleased: values.isReleased,
        price: Number(values.price),
        brandId: values.brandId,
        productTypeId: values.productTypeId,
        variants: variants,
        discountPolicyId: values.discountPolicyId,
      };

      const response = await createProduct(data);
      if (!response.success) {
        throw new Error(response.message || "Lỗi thêm sản phẩm");
      }
      successNotification("Thêm sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      errorNotification(
        "Lỗi thêm sản phẩm",
        error instanceof Error ? error.message : "Vui lòng thử lại sau"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "12px", margin: "0 auto" }}>
      <h2>Thêm sản phẩm</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isReleased: false,
          price: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm" },
              ]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="baseDescription" label="Mô tả cơ bản">
              <TextArea placeholder="Nhập mô tả cơ bản" rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="detailDescription" label="Mô tả chi tiết">
              <TextArea placeholder="Nhập mô tả chi tiết" rows={5} />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="colorImages">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row gutter={16} key={key} align="middle">
                  <Col span={8}>
                    <Form.Item
                      {...restField}
                      name={[name, "image"]}
                      label="Ảnh sản phẩm"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => {
                        const fileList = Array.isArray(e) ? e : e?.fileList;
                        return fileList?.slice(-1);
                      }}
                      rules={[{ required: true, message: "Vui lòng chọn ảnh" }]}
                    >
                      <Upload
                        listType="picture-card"
                        accept="image/*"
                        maxCount={1}
                        beforeUpload={(file) => {
                          const isLt5M = file.size / 1024 / 1024 < 5;
                          if (!isLt5M) {
                            message.error("Ảnh phải nhỏ hơn 5MB");
                            return Upload.LIST_IGNORE;
                          }
                          return false;
                        }}
                        showUploadList={{
                          showPreviewIcon: false,
                          showRemoveIcon: true,
                          showDownloadIcon: false,
                        }}
                        className="single-upload"
                      >
                        <div className="upload-btn">
                          <UploadOutlined style={{ fontSize: 16 }} />
                          <div style={{ fontSize: 12 }}>Chọn ảnh</div>
                        </div>
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "imageUrl"]}
                      label="Hoặc nhập URL ảnh"
                      rules={[
                        {
                          validator: (_, value) => {
                            // Nếu có file upload rồi thì không cần URL
                            const imageFiles = form.getFieldValue([
                              "colorImages",
                              name,
                              "image",
                            ]);
                            if (imageFiles && imageFiles.length > 0)
                              return Promise.resolve();

                            // Nếu không có file, phải có URL hợp lệ
                            if (!value)
                              return Promise.reject("Vui lòng nhập URL ảnh");

                            try {
                              new URL(value);
                              return Promise.resolve();
                            } catch {
                              return Promise.reject("URL không hợp lệ");
                            }
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder="Dán link ảnh (VD: https://example.com/image.jpg)"
                        onChange={(e) => {
                          const url = e.target.value;
                          if (url) {
                            try {
                              new URL(url);
                              // ✅ Tạo file object từ URL để preview
                              const fileList = [
                                {
                                  uid: `url-${Date.now()}`,
                                  name: "image-from-url",
                                  status: "done" as const,
                                  url: url,
                                  thumbUrl: url,
                                },
                              ];
                              form.setFieldsValue({
                                colorImages: {
                                  [name]: {
                                    image: fileList,
                                  },
                                },
                              });
                            } catch {
                              // Invalid URL, không làm gì
                            }
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      {...restField}
                      name={[name, "color"]}
                      label="Màu sắc"
                      rules={[
                        { required: true, message: "Vui lòng nhập màu sắc" },
                      ]}
                    >
                      <Input placeholder="Nhập màu sắc" />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Button type="link" danger onClick={() => remove(name)}>
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
                      Thêm màu sắc và ảnh
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form.List>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isReleased" label="Bán ra" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Giá sản phẩm"
              rules={[
                { required: true, message: "Vui lòng nhập giá sản phẩm" },
                {
                  type: "number",
                  min: 0,
                  message: "Giá phải lớn hơn hoặc bằng 0",
                },
              ]}
            >
              <InputNumber
                min={0}
                step={1000}
                parser={(value) => {
                  if (!value) return 0;
                  return Number(value.replace(/,/g, ""));
                }}
                placeholder="Nhập giá sản phẩm"
                addonAfter="VND"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="brandId"
              label="Thương hiệu"
              rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
            >
              <Select placeholder="Chọn thương hiệu">
                {brands.map((brand) => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="productTypeId"
              label="Loại sản phẩm"
              rules={[
                { required: true, message: "Vui lòng chọn loại sản phẩm" },
              ]}
            >
              <Select
                placeholder="Chọn loại sản phẩm"
                onChange={handleProductTypeChange}
              >
                {productTypes.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="discountPolicyId" label="Chính sách giảm giá">
              <Select placeholder="Chọn chính sách giảm giá" allowClear>
                {discountPolicies.map((policy) => (
                  <Option key={policy.id} value={policy.id}>
                    {policy.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Thông số kỹ thuật</h3>
          <Form.List name="specifications">
            {(fields, { add, remove }) => (
              <>
                <Row
                  gutter={16}
                  style={{
                    marginBottom: 8,
                    fontWeight: "bold",
                    borderBottom: "1px solid #d9d9d9",
                    paddingBottom: 8,
                  }}
                >
                  <Col span={10}>Tên thông số</Col>
                  <Col span={10}>Giá trị</Col>
                  <Col span={4}>Thao tác</Col>
                </Row>

                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    gutter={16}
                    key={key}
                    align="middle"
                    style={{ marginBottom: 8 }}
                  >
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, "label"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên thông số",
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="VD: Màn hình" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, "value"]}
                        rules={[
                          { required: true, message: "Vui lòng nhập giá trị" },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <TextArea placeholder="VD: OLED, 6.1 inch" rows={2} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button type="link" danger onClick={() => remove(name)}>
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
                        onClick={() => add({ label: "", value: "" })}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm thông số
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Form.List>
        </div>

        <Row gutter={16}>
          <Col span={24} style={{ textAlign: "right" }}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Thêm sản phẩm
                </Button>
                <Button onClick={() => navigate("/products")}>Hủy</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddProductPage;
