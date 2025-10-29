import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Upload,
  Image,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { QueryBuilder } from "@/utils/queryBuilder";

import type { Brand, CreateBrand, UpdateBrand } from "@/types/brand.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "@/apis/brand.api";

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortField, setSortField] = useState<"name" | "createdAt">("createdAt");

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form] = Form.useForm();
  const [image, setImage] = useState<File | string | null>(null);
  const { successNotification, errorNotification } = useNotificationContext();
  const [submitting, setSubmitting] = useState(false);
  // Fetch brands
  const fetchBrands = async (
    page = 1,
    search = "",
    sortField = "createdAt",
    sortOrder: "ASC" | "DESC" = "DESC"
  ) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(search)
        .sortBy(sortField, sortOrder)
        .build();

      const response = await getBrands(query);

      if (response.success) {
        setBrands(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      } else {
        errorNotification("Lỗi tải danh sách thương hiệu", response.message);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      errorNotification("Lỗi hệ thống", "Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(pagination.current, searchText, sortField, sortOrder);
  }, [pagination.current, searchText, sortField, sortOrder]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Handle sort
  const handleSort = (field: "name" | "createdAt", order: "ASC" | "DESC") => {
    setSortField(field);
    setSortOrder(order);
    setPagination({ ...pagination, current: 1 });
  };

  // Handle pagination
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const order = sorter.order === "ascend" ? "ASC" : "DESC";
    const field = sorter.field === "name" ? "name" : "createdAt";
    handleSort(field, order);
    fetchBrands(pagination.current, searchText, field, order);
  };

  const showModal = (brand?: Brand) => {
    setEditingBrand(brand || null);
    setIsModalVisible(true);
    setImage(brand?.image || null);
    if (brand) {
      form.setFieldsValue({
        name: brand.name,
        description: brand.description,
        imageUrl: brand.image || "",
        image: [],
      });
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBrand(null);
    setImage(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const data: CreateBrand | UpdateBrand = {
        name: values.name,
        description: values.description,
        image: image || "",
      };

      if (editingBrand) {
        const response = await updateBrand(editingBrand.id, data);
        if (!response.success) {
          throw new Error(response.message);
        }
        successNotification("Cập nhật thương hiệu thành công");
      } else {
        const response = await createBrand(data as CreateBrand);
        if (!response.success) {
          throw new Error(response.message);
        }
        successNotification("Thêm thương hiệu thành công");
      }
      handleCancel();
      fetchBrands(pagination.current, searchText, sortField, sortOrder);
    } catch (error) {
      console.error("Error saving brand:", error);
      errorNotification("Lỗi lưu thương hiệu", "Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteBrand(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      successNotification("Xóa thương hiệu thành công");
      fetchBrands(pagination.current, searchText, sortField, sortOrder);
    } catch (error) {
      console.error("Error deleting brand:", error);
      errorNotification("Lỗi xóa thương hiệu", "Vui lòng thử lại");
    }
  };

  const columns = [
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        sortField === "name" && sortOrder === "DESC"
          ? "descend"
          : sortField === "name"
          ? "ascend"
          : undefined,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? <Image src={image} width={50} height={50} /> : "Không có",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: true,
      sortOrder:
        sortField === "createdAt" && sortOrder === "DESC"
          ? "descend"
          : sortField === "createdAt"
          ? "ascend"
          : undefined,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Brand) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa thương hiệu này?"
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

  const tabItems = [
    {
      key: "url",
      label: "Nhập URL",
      children: (
        <Input
          placeholder="Nhập URL ảnh thương hiệu"
          value={typeof image === "string" ? image : ""}
          onChange={(e) => setImage(e.target.value)}
        />
      ),
    },
    {
      key: "upload",
      label: "Upload ảnh",
      children: (
        <Upload
          listType="picture-card"
          maxCount={1}
          beforeUpload={(file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              errorNotification("Lỗi upload", "Ảnh phải nhỏ hơn 5MB");
              return false;
            }
            setImage(file);
            return false;
          }}
          accept="image/*"
          fileList={
            (image instanceof File
              ? [
                  {
                    uid: "1",
                    name: image.name,
                    status: "done" as const,
                    originFileObj: image,
                  },
                ]
              : []) as any
          }
        >
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload ảnh (max 5MB)</div>
          </div>
        </Upload>
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
        <h2>Quản lý thương hiệu</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm thương hiệu
        </Button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Tìm kiếm thương hiệu..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={() => handleSearch(searchText)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} thương hiệu`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal for Add/Edit */}
      <Modal
        title={editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu" },
            ]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả thương hiệu" rows={4} />
          </Form.Item>

          <Form.Item label="Ảnh thương hiệu">
            <Tabs
              defaultActiveKey="url"
              type="card"
              onChange={(key) => setImage(null)}
              items={tabItems} // ✅ Dùng items thay TabPane
            />

            {/* Preview */}
            {image && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Image
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt="Preview"
                  width={150}
                  height={150}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel} disabled={submitting}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingBrand ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandsPage;
