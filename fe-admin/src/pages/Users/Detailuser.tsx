import React, { useState, useEffect } from "react";
import { Descriptions, Avatar, Spin, Button, Space, Tag, Card } from "antd";
import {
  UserOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "@/apis/user.api";
import { useNotificationContext } from "@/providers/NotificationProvider";
import dayjs from "dayjs";
import type { DetailUser } from "@/types/user.type";

const DetailUserPage: React.FC = () => {
  const [user, setUser] = useState<DetailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { errorNotification } = useNotificationContext();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getUser(id);
        if (response.success) {
          setUser(response.data);
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
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleConfig = (role: string) => {
    const config = {
      admin: { label: "Quản trị viên", color: "red" },
      user: { label: "Người dùng", color: "blue" },
      employee: { label: "Nhân viên", color: "green" },
    };
    return (
      config[role as keyof typeof config] || { label: role, color: "default" }
    );
  };

  const roleConfig = getRoleConfig(user.role);

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/users")}>
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/users/edit/${id}`)}
        >
          Chỉnh sửa
        </Button>
      </Space>

      <Card>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
        >
          <Avatar
            size={100}
            src={user.avatar}
            icon={<UserOutlined />}
            style={{ marginRight: 24 }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{user.userName}</h2>
            <Tag color={roleConfig.color} style={{ marginTop: 8 }}>
              {roleConfig.label}
            </Tag>
          </div>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Tên đăng nhập">
            {user.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Tình trạng khóa">
            {user.isBlocked ? (
              <Tag color="red">Đã khóa</Tag>
            ) : (
              <Tag color="green">Hoạt động</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {user.phoneNumber || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color={roleConfig.color}>{roleConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {user?.createdBy?.userName || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ mặc định" span={2}>
            {user.defaultAddress || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {dayjs(user.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default DetailUserPage;
