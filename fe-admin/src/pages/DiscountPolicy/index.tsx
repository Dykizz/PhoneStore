import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Space,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type {
  DiscountPolicy,
  CreateDiscountPolicy,
  UpdateDiscountPolicy,
} from "@/types/discountPolicy.type";
import {
  getDiscountPolicies,
  createDiscountPolicy,
  updateDiscountPolicy,
  deleteDiscountPolicy,
} from "@/apis/discountPolicy.api";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { QueryBuilder } from "@/utils/queryBuilder";

const { Search } = Input;

const DiscountPolicyPage: React.FC = () => {
  const [data, setData] = useState<DiscountPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscountPolicy | null>(null);
  const [form] = Form.useForm();
  const { successNotification, errorNotification } = useNotificationContext();

  const fetchData = async (
    params: {
      search?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    } = {}
  ) => {
    setLoading(true);
    try {
      const query = new QueryBuilder()
        .search(params.search || "")
        .sortBy(params.sortBy || "createdAt", params.sortOrder || "DESC")
        .page(params.page || 1)
        .limit(params.limit || 10)
        .build();
      const response = await getDiscountPolicies(query);
      if (!response.success) {
        throw new Error(response.message);
      }
      setData(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching discount policies:", error);
      errorNotification("Lỗi", "Không thể tải danh sách chính sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ page: currentPage, limit: pageSize });
  }, [currentPage, pageSize]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to page 1 on search
    fetchData({ search: value, page: 1, limit: pageSize });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: DiscountPolicy) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscountPolicy(id);
      successNotification(
        "Xóa thành công",
        "Chính sách khuyến mãi đã được xóa"
      );
      // If current page has no items after delete, go to previous page
      if (data.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchData({ search: searchText, page: currentPage, limit: pageSize });
      }
    } catch (error) {
      console.error("Error deleting discount policy:", error);
      errorNotification("Lỗi", "Không thể xóa chính sách khuyến mãi");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateDiscountPolicy | UpdateDiscountPolicy = {
        ...values,
        startDate: values.startDate.toDate(),
        endDate: values.endDate.toDate(),
      };

      if (editingItem) {
        const response = await updateDiscountPolicy(editingItem.id, data);
        if (!response.success) {
          return errorNotification("Lỗi khi cập nhật", response.message);
        }
        successNotification(
          "Cập nhật thành công",
          "Chính sách khuyến mãi đã được cập nhật"
        );
      } else {
        const response = await createDiscountPolicy(
          data as CreateDiscountPolicy
        );
        if (!response.success) {
          return errorNotification("Lỗi khi tạo", response.message);
        }
        successNotification(
          "Thêm thành công",
          "Chính sách khuyến mãi đã được thêm"
        );
      }

      setIsModalVisible(false);
      fetchData({ search: searchText, page: currentPage, limit: pageSize });
    } catch (error) {
      console.error("Error saving discount policy:", error);
      errorNotification("Lỗi", "Không thể lưu chính sách khuyến mãi");
    }
  };

  const columns: ColumnsType<DiscountPolicy> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Phần trăm giảm",
      dataIndex: "discountPercent",
      key: "discountPercent",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (value) => `${value}%`,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
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
        <h2>Quản lý chính sách khuyến mãi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm chính sách khuyến mãi
        </Button>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        onChange={(pagination, filters, sorter) => {
          const { field, order } = sorter as any;
          if (field && order) {
            const sortOrder = order === "ascend" ? "ASC" : "DESC";
            fetchData({
              search: searchText,
              sortBy: field,
              sortOrder,
              page: pagination.current,
              limit: pagination.pageSize,
            });
          } else {
            fetchData({
              search: searchText,
              page: pagination.current,
              limit: pagination.pageSize,
            });
          }
        }}
      />
      <Modal
        title={
          editingItem
            ? "Sửa chính sách khuyến mãi"
            : "Thêm chính sách khuyến mãi"
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingItem ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên chính sách"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="discountPercent"
            label="Phần trăm giảm"
            rules={[
              { required: true, message: "Vui lòng nhập phần trăm giảm" },
            ]}
          >
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountPolicyPage;
