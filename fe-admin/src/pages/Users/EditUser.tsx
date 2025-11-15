import React, { useState, useEffect } from "react";
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
  Spin,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, updateUser } from "@/apis/user.api";
import { uploadImages } from "@/apis/upload.api";
import { useNotificationContext } from "@/providers/NotificationProvider";
import axios from "axios";

const { Option } = Select;

const EditUserPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const { successNotification, errorNotification } = useNotificationContext();

  useEffect(() => {
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

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getUser(id);
        if (response.success) {
          const user = response.data;

          let addressParts = { city: "", district: "", ward: "", street: "" };
          let cascaderValue: any[] = [];

          if (user.defaultAddress) {
            const parts = user.defaultAddress.split(", ");
            if (parts.length >= 4) {
              addressParts = {
                street: parts[0],
                ward: parts[1],
                district: parts[2],
                city: parts[3],
              };

              const province = cityOptions.find((p) => p.label === parts[3]);
              if (province) {
                const district = province.children?.find(
                  (d: any) => d.label === parts[2]
                );
                if (district) {
                  const ward = district.children?.find(
                    (w: any) => w.label === parts[1]
                  );
                  if (ward) {
                    cascaderValue = [
                      province.value,
                      district.value,
                      ward.value,
                    ];
                  }
                }
              }
            }
          }

          form.setFieldsValue({
            email: user.email,
            userName: user.userName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            ...addressParts,
            address: cascaderValue.length > 0 ? cascaderValue : undefined,
          });

          if (user.avatar) {
            setFileList([
              {
                uid: "-1",
                name: "avatar.png",
                status: "done",
                url: user.avatar,
              },
            ]);
          }
        } else {
          errorNotification("Lỗi", "Không thể tải thông tin người dùng");
          navigate("/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        errorNotification("Lỗi", "Không thể tải thông tin người dùng");
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };

    if (cityOptions.length > 0) {
      fetchUser();
    }
  }, [id, cityOptions]);

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
    if (!id) return;
    setSubmitting(true);
    try {
      let avatar = fileList[0]?.url;

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj as File;
        const [uploadedUrl] = await uploadImages([file]);
        avatar = uploadedUrl;
      }

      const data = {
        userName: values.userName,
        phoneNumber: values.phoneNumber,
        role: values.role,
        avatar: avatar || undefined,
        defaultAddress:
          values.street && values.city
            ? `${values.street}, ${values.ward}, ${values.district}, ${values.city}`
            : undefined,
      };

      const response = await updateUser(id, data);
      if (!response.success) {
        throw new Error(response.message || "Lỗi cập nhật người dùng");
      }
      successNotification("Cập nhật người dùng thành công");
      navigate("/users");
    } catch (error) {
      console.error("Error updating user:", error);
      errorNotification("Lỗi cập nhật người dùng", "Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 24px 24px 24px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => {
          navigate(-1);
        }}
      >
        Quay lại
      </Button>
      <h2 style={{ marginTop: 5 }}>Chỉnh sửa thông tin người dùng</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="email" label="Email">
              <Input placeholder="Email" disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                  message: "Số điện thoại không hợp lệ (VD: 0912345678)",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" maxLength={11} />
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
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item label="Ảnh đại diện">
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
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="address"
              label="Tỉnh/Thành - Quận/Huyện - Xã/Phường"
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
            <Form.Item name="street" label="Số nhà, tên đường">
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
                  Cập nhật
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

export default EditUserPage;
