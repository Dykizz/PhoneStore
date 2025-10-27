import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Popconfirm, Modal, Form } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { QueryBuilder } from "@/utils/queryBuilder";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/apis/suppliers.api";
import type { Supplier } from "@/types/supplier.type";
import { useNotificationContext } from "@/providers/NotificationProvider";

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { errorNotification, successNotification } = useNotificationContext();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const fetchSuppliers = async (page = 1, search = "", sort = "DESC") => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(search)
        .sortBy("createdAt", sort)
        .build();

      const response = await getSuppliers(query);

      if (response.success) {
        setSuppliers(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      // ✅ Sửa lại: gọi đúng hàm errorNotification thay vì error()
      errorNotification("Có lỗi xảy ra khi tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(pagination.current, searchText, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, searchText, sortOrder]);

  // 🔍 Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // ↕️ Handle sort
  const handleSort = (order: "ASC" | "DESC") => {
    setSortOrder(order);
    setPagination({ ...pagination, current: 1 });
  };

  // 📄 Handle pagination
  const handleTableChange = (pagination: any) => {
    fetchSuppliers(pagination.current, searchText, sortOrder);
  };

  // 🧾 Modal handlers
  const showModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null);
    setIsModalVisible(true);
    if (supplier) {
      form.setFieldsValue(supplier);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
    form.resetFields();
  };

  // 💾 Handle submit
  const handleSubmit = async (values: any) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, values);
        successNotification("Cập nhật nhà cung cấp thành công");
      } else {
        await createSupplier(values);
        successNotification("Thêm nhà cung cấp thành công");
      }
      handleCancel();
      fetchSuppliers(pagination.current, searchText, sortOrder);
    } catch (err) {
      console.error("Error saving supplier:", err);
      errorNotification("Có lỗi xảy ra khi lưu nhà cung cấp");
    }
  };

  // 🗑️ Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier(id);
      successNotification("Xóa nhà cung cấp thành công");
      fetchSuppliers(pagination.current, searchText, sortOrder);
    } catch (err) {
      console.error("Error deleting supplier:", err);
      errorNotification("Có lỗi xảy ra khi xóa nhà cung cấp");
    }
  };

  // 📋 Table columns
  const columns = [
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: sortOrder === "DESC" ? "descend" : "ascend",
      onHeaderCell: () => ({
        onClick: () => handleSort(sortOrder === "DESC" ? "ASC" : "DESC"),
      }),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: true,
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Supplier) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Quản lý nhà cung cấp</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm nhà cung cấp
        </Button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Tìm kiếm nhà cung cấp..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={() => handleSearch(searchText)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(searchText)}
          style={{ marginLeft: 8 }}
        >
          Tìm kiếm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Add/Edit */}
      <Modal
        title={editingSupplier ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
            ]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả nhà cung cấp" rows={4} />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingSupplier ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
