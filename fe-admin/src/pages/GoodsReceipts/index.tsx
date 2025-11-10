import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  DatePicker,
  Col,
  Row,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { BaseGoodsReceipt } from "@/types/goodsReceipt.type";
import { getGoodReceipts } from "@/apis/goodsReceipt.api";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { QueryBuilder } from "@/utils/queryBuilder";
import { useNavigate } from "react-router-dom";
import { getSuppliers } from "@/apis/supplier.api";
import type { Supplier } from "@/types/supplier.type";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrencyVND } from "@/utils/util";

export default function GoodsReceiptsPage() {
  const [data, setData] = useState<BaseGoodsReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const debouncedSearch = useDebounce(searchText, 500);
  const mapSuppliers = useMemo(() => {
    const map = new Map<string, string>();
    suppliers.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [suppliers]);

  const navigate = useNavigate();
  const { successNotification, errorNotification } = useNotificationContext();

  const fetchGoodsReceipts = async (page = 1) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(debouncedSearch)
        .sortBy(sortBy, sortOrder);
      if (startDate) {
        query.filterGte("createdAt", startDate);
      }
      if (endDate) {
        query.filterLte("createdAt", endDate);
      }
      const builtQuery = query.build();

      const response = await getGoodReceipts(builtQuery);

      if (response.success) {
        setData(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      } else {
        errorNotification("Lỗi tải danh sách phiếu nhập", response.message);
      }
    } catch (error) {
      console.error("Error fetching goods receipts:", error);
      errorNotification("Lỗi hệ thống", "Không thể tải danh sách phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();

    const suppliersData = await getSuppliers(query);
    if (suppliersData.success) {
      const tmp: { id: string; name: string }[] = [];
      suppliersData.data.data.forEach((brand: Supplier) => {
        mapSuppliers.set(brand.id, brand.name);
        tmp.push({ id: brand.id, name: brand.name });
      });
      setSuppliers(tmp);
    } else {
      errorNotification("Lỗi tải danh sách thương hiệu", suppliersData.message);
    }
  };

  useEffect(() => {
    fetchGoodsReceipts(pagination.current);
  }, [
    pagination.current,
    pagination.pageSize,
    debouncedSearch,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchGoodsReceipts(1);
  };

  const handleCreate = () => {
    navigate("/goods-receipts/add");
  };

  const handleDelete = async (id: string) => {
    // await deleteGoodsReceipt(id);
    successNotification("Xóa thành công", "Phiếu nhập đã được xóa");
    if (data.length === 1 && pagination.current > 1) {
      setPagination({ ...pagination, current: pagination.current - 1 });
    } else {
      fetchGoodsReceipts(pagination.current);
    }
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const order = sorter.order === "ascend" ? "ASC" : "DESC";
    const field = sorter.field || "createdAt";
    setSortBy(field);
    setSortOrder(order);
    fetchGoodsReceipts(pagination.current);
  };

  const columns: ColumnsType<BaseGoodsReceipt> = [
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierId",
      key: "supplierId",
      render: (supplierId) => mapSuppliers.get(supplierId) || supplierId,
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Số loại sản phẩm",
      dataIndex: "totalUniqueProducts",
      key: "totalUniqueProducts",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Tổng giá tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (value) => formatCurrencyVND(value),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
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
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
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
            onClick={() => navigate(`/goods-receipts/edit/${record.id}`)}
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
        <h2>Quản lý phiếu nhập</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo phiếu nhập
        </Button>
      </div>
      <Row gutter={16} style={{ marginBottom: "16px" }}>
        <Col span={7}>
          <Input
            placeholder="Tìm kiếm theo tên NCC hoặc ghi chú..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Ngày bắt đầu"
            value={startDate ? dayjs(startDate) : null}
            onChange={(date) =>
              setStartDate(date ? date.format("YYYY-MM-DD") : null)
            }
          />
        </Col>
        <Col span={4}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Ngày kết thúc"
            value={endDate ? dayjs(endDate) : null}
            onChange={(date) =>
              setEndDate(date ? date.format("YYYY-MM-DD") : null)
            }
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setPagination({ ...pagination, current: page, pageSize: size });
          },
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
