import React, { useState, useEffect } from "react";
import { Table, Input, Select, Button, Space, Avatar } from "antd";
import {
  EditOutlined,
  EyeFilled,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { QueryBuilder } from "@/utils/queryBuilder";
import { getUsers, updateUser } from "@/apis/user.api";
import type { BaseUser } from "@/types/user.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import type { ColumnsType } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";
import { Tag } from "antd";
const { Option } = Select;

const UsersPage: React.FC = () => {
  const [data, setData] = useState<BaseUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const { errorNotification } = useNotificationContext();
  const navigate = useNavigate();
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(searchText)
        .filterIf(!!roleFilter, "role", roleFilter)
        .sortBy(sortBy, sortOrder)
        .build();

      const response = await getUsers(query);

      if (response.success) {
        setData(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      } else {
        errorNotification("Lỗi tải danh sách người dùng", response.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      errorNotification("Lỗi hệ thống", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers(pagination.current);
  }, [searchText, roleFilter]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchUsers(1);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    const order = sorter.order === "ascend" ? "ASC" : "DESC";
    const field = sorter.field || "createdAt";
    setSortBy(field);
    setSortOrder(order);
    fetchUsers(pagination.current);
  };

  const toggleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await updateUser(userId, { isBlocked: !isBlocked });
      if (response.success) {
        fetchUsers(pagination.current);
      } else {
        errorNotification(
          "Lỗi cập nhật trạng thái người dùng",
          response.message
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      errorNotification(
        "Lỗi hệ thống",
        "Không thể cập nhật trạng thái người dùng"
      );
    }
  };

  const columns: ColumnsType<BaseUser> = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => <Avatar src={avatar} icon={<UserOutlined />} />,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
      sorter: true,
      sortOrder:
        sortBy === "userName"
          ? sortOrder === "ASC"
            ? "ascend"
            : "descend"
          : null,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder:
        sortBy === "email"
          ? sortOrder === "ASC"
            ? "ascend"
            : "descend"
          : null,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const roleConfig = {
          admin: { label: "Quản trị viên", color: "red" },
          user: { label: "Người dùng", color: "blue" },
          employee: { label: "Nhân viên", color: "green" },
        };
        const config = roleConfig[role as keyof typeof roleConfig];
        return config ? (
          <Tag color={config.color}>{config.label}</Tag>
        ) : (
          <Tag>{role}</Tag>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Tình trạng khóa",
      dataIndex: "isBlocked",
      key: "isBlocked",
      render: (isBlocked) =>
        isBlocked ? (
          <Tag color="red">Đã khóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },

    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeFilled />}
            type="link"
            onClick={() => navigate(`/users/${record.id}`)}
          >
            Chi tiết
          </Button>

          <Button
            type="primary"
            onClick={() => navigate(`/user/edit/${record.id}`)}
            icon={<EditOutlined />}
            size="small"
          >
            Sửa
          </Button>

          <Button
            onClick={() => toggleBlockUser(record.id, record.isBlocked)}
            icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
            danger={!record.isBlocked}
            type={record.isBlocked ? "default" : "primary"}
            size="small"
          >
            {record.isBlocked ? "Mở khóa" : "Khóa"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Quản lý người dùng</h2>
        <Link to="/users/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm người dùng
          </Button>
        </Link>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên hoặc email, số điện thoại..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 400 }}
        />
        <Select
          placeholder="Lọc theo vai trò"
          value={roleFilter}
          onChange={setRoleFilter}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="admin">Quản trị viên</Option>
          <Option value="user">Người dùng</Option>
          <Option value="employee">Nhân viên</Option>
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} người dùng`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default UsersPage;
