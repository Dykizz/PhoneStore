import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { QueryBuilder } from "@/utils/queryBuilder";
import {
  createProductType,
  deleteProductType,
  getProductTypes,
  updateProductType,
} from "@/apis/productType.api";
import type { ProductType } from "@/types/productType.type";
import { useNotificationContext } from "@/providers/NotificationProvider";

const ProductTypesPage: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
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
  const [editingProductType, setEditingProductType] =
    useState<ProductType | null>(null);
  const [form] = Form.useForm();

  const fetchProductTypes = async (page = 1, search = "", sort = "DESC") => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(search)
        .sortBy("createdAt", sort)
        .build();

      const response = await getProductTypes(query);

      if (response.success) {
        setProductTypes(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error("Error fetching productTypes:", err);
      errorNotification("Có lỗi xảy ra khi tải danh sách loại sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes(pagination.current, searchText, sortOrder);
  }, [pagination.current, searchText, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleSort = (order: "ASC" | "DESC") => {
    setSortOrder(order);
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (pagination: any) => {
    fetchProductTypes(pagination.current, searchText, sortOrder);
  };

  const showModal = (productType?: ProductType) => {
    setEditingProductType(productType || null);
    setIsModalVisible(true);
    if (productType) {
      form.setFieldsValue(productType);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProductType(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingProductType) {
        const filteredSpecs =
          values.defaultSpecifications?.filter(
            (spec: string) => spec && spec.trim() !== ""
          ) || [];

        const data = {
          ...values,
          defaultSpecifications: filteredSpecs,
        };
        await updateProductType(editingProductType.id, data);
        successNotification("Cập nhật loại sản phẩm thành công");
      } else {
        await createProductType(values);
        successNotification("Thêm loại sản phẩm thành công");
      }
      handleCancel();
      fetchProductTypes(pagination.current, searchText, sortOrder);
    } catch (err) {
      console.error("Error saving productType:", err);
      errorNotification("Có lỗi xảy ra khi lưu loại sản phẩm");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductType(id);
      successNotification("Xóa loại sản phẩm thành công");
      fetchProductTypes(pagination.current, searchText, sortOrder);
    } catch (err) {
      console.error("Error deleting productType:", err);
      errorNotification("Có lỗi xảy ra khi xóa loại sản phẩm");
    }
  };

  const columns = [
    {
      title: "Tên loại sản phẩm",
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
      render: (_: any, record: ProductType) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa loại sản phẩm này?"
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
        <h2>Quản lý loại sản phẩm</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm loại sản phẩm
        </Button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Tìm kiếm loại sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={() => handleSearch(searchText)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={productTypes}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} loại sản phẩm`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal Add/Edit */}
      <Modal
        title={editingProductType ? "Sửa loại sản phẩm" : "Thêm loại sản phẩm"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên loại sản phẩm"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại sản phẩm" },
            ]}
          >
            <Input placeholder="Nhập tên loại sản phẩm" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả loại sản phẩm" rows={4} />
          </Form.Item>
          <Form.Item label="Thông số kỹ thuật mặc định">
            <Form.List name="defaultSpecifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row
                      gutter={16}
                      key={key}
                      align="middle"
                      style={{ marginBottom: 8 }}
                    >
                      <Col span={20}>
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên thông số",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="VD: Màn hình, RAM, Camera..." />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          style={{ width: "100%" }}
                        >
                          Xóa
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add("")}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thông số
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingProductType ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductTypesPage;
