import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Space, Col, Row } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getGoodsReceipt, updateGoodsReceipt } from "@/apis/goodsReceipt.api";
import type {
  CreateGoodReceipt,
  DetailGoodsReceipt,
} from "@/types/goodsReceipt.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { QueryBuilder } from "@/utils/queryBuilder";
import { getSuppliers } from "@/apis/supplier.api";
const { Option } = Select;
const { TextArea } = Input;

const EditGoodsReceiptPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );
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
    } else {
      errorNotification("Lỗi tải phiếu nhập", response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
    fetchGoodsReceipt();
  }, [id]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const data: Partial<CreateGoodReceipt> = {
        supplierId: values.supplierId,
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
