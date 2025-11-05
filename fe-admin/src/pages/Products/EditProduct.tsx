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
  Tooltip,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { updateProduct, getProduct } from "@/apis/product.api";
import type { UpdateProduct } from "@/types/product.type";
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

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [productTypes, setproductTypes] = useState<
    { id: string; name: string }[]
  >([]);
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

  const mapProductTypes = useMemo(() => {
    const map = new Map<string, string>();
    productTypes.forEach((type) => map.set(type.id, type.name));
    return map;
  }, [productTypes]);

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
      const tmp: { id: string; name: string }[] = [];
      response.data.data.forEach((type: ProductType) => {
        mapProductTypes.set(type.id, type.name);
        tmp.push({ id: type.id, name: type.name });
      });
      setproductTypes(tmp);
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

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const response = await getProduct(id);
      if (response.success) {
        const product = response.data;

        const colorImages =
          product.variants?.map((variant) => ({
            id: variant.id,
            color: variant.color,
            quantity: variant.quantity,
            image: [
              {
                uid: variant.id || variant.color,
                name: `${variant.color}.jpg`,
                status: "done",
                url: variant.image,
              },
            ],
          })) || [];
        form.setFieldsValue({
          ...product,
          price: Number(product.price),
          colorImages,
        });
      } else {
        errorNotification("Lỗi tải thông tin sản phẩm", response.message);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      errorNotification("Lỗi tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchProductTypes();
    fetchDiscountPolicies();
    fetchProduct();
  }, [id]);

  const handleRemoveVariant = (
    remove: (index: number) => void,
    name: number
  ) => {
    const colorImages = form.getFieldValue("colorImages");
    const variantToDelete = colorImages[name];

    if (variantToDelete?.quantity > 0) {
      message.error(
        `Không thể xóa variant có số lượng ${variantToDelete.quantity}. Vui lòng xuất hết số lượng trước khi xóa.`
      );
      return;
    }

    remove(name);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const variants =
        values.colorImages?.map((item: any) => ({
          ...(item.id && { id: item.id }),
          color: item.color,
          image: item.image[0]?.url || item.image[0]?.originFileObj,
        })) || [];

      console.log("Variants to submit:", variants);

      const data: UpdateProduct = {
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

      const response = await updateProduct(id!, data);
      if (!response.success) {
        throw new Error(response.message || "Lỗi cập nhật sản phẩm");
      }
      successNotification("Cập nhật sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      errorNotification(
        "Lỗi cập nhật sản phẩm",
        error instanceof Error ? error.message : "Vui lòng thử lại sau"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "12px", margin: "0 auto" }}>
      <h2>Chỉnh sửa sản phẩm</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isReleased: false,
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
              {fields.map(({ key, name, ...restField }) => {
                // ✅ Lấy quantity của variant hiện tại
                const currentVariant = form.getFieldValue([
                  "colorImages",
                  name,
                ]);
                const hasQuantity = currentVariant?.quantity > 0;

                return (
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
                        rules={[
                          { required: true, message: "Vui lòng chọn ảnh" },
                        ]}
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
                    </Col>

                    <Col span={7}>
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

                    {/* ✅ Hiển thị số lượng (readonly) */}
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        label="Số lượng tồn"
                      >
                        <Input
                          disabled
                          placeholder="0"
                          style={{
                            fontWeight: hasQuantity ? "bold" : "normal",
                            color: hasQuantity ? "#1890ff" : undefined,
                          }}
                        />
                      </Form.Item>
                    </Col>

                    {/* ✅ Hidden field để lưu ID */}
                    <Form.Item {...restField} name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Col span={4}>
                      <Form.Item label=" ">
                        {hasQuantity ? (
                          <Tooltip
                            title={`Không thể xóa variant có ${currentVariant.quantity} sản phẩm tồn kho`}
                          >
                            <Button type="link" danger disabled>
                              Xóa
                            </Button>
                          </Tooltip>
                        ) : (
                          <Button
                            type="link"
                            danger
                            onClick={() => handleRemoveVariant(remove, name)}
                          >
                            Xóa
                          </Button>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                );
              })}

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
            <Form.Item name="isReleased" label="Hiện" valuePropName="checked">
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
                style={{ width: "100%" }}
                min={0}
                step={1000}
                formatter={(value) => {
                  if (!value) return "";
                  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }}
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
              <Select placeholder="Chọn loại sản phẩm">
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

        <Row gutter={16}>
          <Col span={24} style={{ textAlign: "right" }}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Cập nhật sản phẩm
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

export default EditProductPage;
