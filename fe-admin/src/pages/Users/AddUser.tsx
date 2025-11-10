import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Space,
  Modal,
  Cascader,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useNavigate } from "react-router-dom";
import { createUser } from "@/apis/user.api";
import { uploadImages } from "@/apis/upload.api";
import type { CreateUser } from "@/types/user.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import axios from "axios";

const { Option } = Select;

const AddUserPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const navigate = useNavigate();
  const { successNotification, errorNotification } = useNotificationContext();

  React.useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => {
        const data = res.data.map((province: any) => ({
          value: province.code,
          label: province.name,
          children: province.districts.map((district: any) => ({
            value: district.code,
            label: district.name,
            children: district.wards.map((ward: any) => ({
              value: ward.code,
              label: ward.name,
            })),
          })),
        }));
        setCityOptions(data);
      })
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  const handleAddressChange = (value: any, selectedOptions: any) => {
    if (selectedOptions && selectedOptions.length === 3) {
      const [province, district, ward] = selectedOptions;
      form.setFieldsValue({
        city: province.label,
        district: district.label,
        ward: ward.label,
      });
    }
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    Modal.info({
      title: "Xem trước ảnh",
      content: (
        <img
          alt="preview"
          style={{ width: "100%" }}
          src={file.url || (file.preview as string)}
        />
      ),
    });
  };

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList.slice(-1));
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (fileList && fileList.length > 0) {
        const file = fileList[0].originFileObj as File;
        const [avatar] = await uploadImages([file]);
        values.avatar = avatar;
      }
      const data: CreateUser = {
        email: values.email,
        userName: values.userName,
        password: values.password,
        role: values.role,
        phoneNumber: values.phoneNumber,
        avatar: values.avatar || undefined,
        defaultAddress: `${values.street}, ${values.ward}, ${values.district}, ${values.city}`,
      };

      const response = await createUser(data);
      if (!response.success) {
        throw new Error(response.message || "Lỗi tạo người dùng");
      }
      successNotification("Tạo người dùng thành công");
      navigate("/users");
    } catch (error) {
      errorNotification("Lỗi tạo người dùng", "Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "10px 24px 24px 24px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => {
          window.history.back();
        }}
      >
        Quay lại
      </Button>
      <h2>Tạo người dùng mới</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ role: "user" }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                  message:
                    "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)",
                },
              ]}
            >
              <Input
                placeholder="Nhập số điện thoại (VD: 0912345678)"
                maxLength={11}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select>
                <Option value="admin">Quản trị viên</Option>
                <Option value="user">Người dùng</Option>
                <Option value="employee">Nhân viên</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Username, Password */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="userName"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 6, message: "Tên đăng nhập phải có ít nhất 6 kí tự" },
                { max: 50, message: "Tên đăng nhập chỉ tối đa 50 kí tự" },
              ]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 kí tự",
                },
                {
                  max: 20,
                  message: "Mật khẩu chỉ tối đã 20 kí tự",
                },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: Avatar */}
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item label="Ảnh đại diện">
              <Space>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleChange}
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {fileList.length < 1 && (
                    <div>
                      <UploadOutlined />
                      <div>Chọn ảnh</div>
                    </div>
                  )}
                </Upload>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="address"
              label="Tỉnh/Thành - Quận/Huyện - Xã/Phường"
              rules={[{ required: true, message: "Vui lòng chọn địa chỉ" }]}
            >
              <Cascader
                options={cityOptions}
                onChange={handleAddressChange}
                placeholder="Chọn Tỉnh/Thành - Quận/Huyện - Xã/Phường"
                showSearch
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="street"
              label="Số nhà, tên đường"
              rules={[
                { required: true, message: "Vui lòng nhập số nhà, tên đường" },
              ]}
            >
              <Input placeholder="Ví dụ: 123 Lê Lợi" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="city" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="district" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="ward" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.city !== currentValues.city ||
                prevValues.district !== currentValues.district ||
                prevValues.ward !== currentValues.ward ||
                prevValues.street !== currentValues.street
              }
            >
              {({ getFieldValue }) => {
                const city = getFieldValue("city");
                const district = getFieldValue("district");
                const ward = getFieldValue("ward");
                const street = getFieldValue("street");

                if (city && district && ward && street) {
                  return (
                    <div
                      style={{
                        padding: 12,
                        background: "#f0f2f5",
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <strong>Địa chỉ đầy đủ:</strong>
                      <div style={{ marginTop: 8 }}>
                        {street}, {ward}, {district}, {city}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item>
              <Space style={{ display: "flex", justifyContent: "end" }}>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Tạo người dùng
                </Button>
                <Button onClick={() => navigate("/users")}>Hủy</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddUserPage;
