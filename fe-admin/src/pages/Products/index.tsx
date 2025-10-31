import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  InputNumber,
  Row,
  Col,
  Popconfirm,
  Tag,
  Badge,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { QueryBuilder } from "@/utils/queryBuilder";
import { deleteProduct, getProducts } from "@/apis/product.api";
import type { BaseProduct, VariantProduct } from "@/types/product.type";
import { useNotificationContext } from "@/providers/NotificationProvider";
import { getBrands } from "@/apis/brand.api";
import type { Brand } from "@/types/brand.type";
import { getProductTypes } from "@/apis/productType.api";
import type { ProductType } from "@/types/productType.type";
import dayjs from "dayjs";
import { Image } from "antd";

const { Option } = Select;
const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [productTypes, setproductTypes] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [brandId, setBrandId] = useState<string | undefined>();
  const [productTypeId, setProductTypeId] = useState<string | undefined>();
  const [isReleased, setIsReleased] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const mapBrands = useMemo(() => {
    const map = new Map<string, string>();
    brands.forEach((brand) => map.set(brand.id, brand.name));
    return map;
  }, [brands]);

  const mapProductTypes = useMemo(() => {
    const map = new Map<string, string>();
    productTypes.forEach((type) => map.set(type.id, type.name));
    return map;
  }, [productTypes]);

  const { successNotification, errorNotification, infoNotification } =
    useNotificationContext();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.pageSize)
        .search(searchText)
        .filterIf(!!priceMin, "price", { gte: priceMin })
        .filterIf(!!priceMax, "price", { lte: priceMax })
        .filterIf(!!brandId, "brandId", brandId)
        .filterIf(!!productTypeId, "productTypeId", productTypeId)
        .sortBy(sortBy, sortOrder)
        .build();

      const response = await getProducts(query);

      if (response.success) {
        setProducts(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.meta.total,
        });
      } else {
        errorNotification("Lỗi tải danh sách sản phẩm", response.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      errorNotification("Lỗi hệ thống", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();

    const brandsData = await getBrands(query);
    if (brandsData.success) {
      const tmp: { id: string; name: string }[] = [];
      brandsData.data.data.forEach((brand: Brand) => {
        mapBrands.set(brand.id, brand.name);
        tmp.push({ id: brand.id, name: brand.name });
      });
      setBrands(tmp);
    } else {
      errorNotification("Lỗi tải danh sách thương hiệu", brandsData.message);
    }
  };

  const fetchProductTypes = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();
    const response = await getProductTypes(query);
    if (response.success) {
      const tmp: { id: string; name: string }[] = [];
      response.data.data.forEach((type: ProductType) => {
        mapProductTypes.set(type.id, type.name);
        tmp.push({ id: type.id, name: type.name });
      });
      setproductTypes(tmp);
    } else {
      errorNotification("Lỗi tải danh sách loại sản phẩm", response.message);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchProductTypes();
  }, []);

  useEffect(() => {
    fetchProducts(pagination.current);
  }, [
    searchText,
    priceMin,
    priceMax,
    brandId,
    productTypeId,
    sortBy,
    sortOrder,
  ]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchProducts(1);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const order = sorter.order === "ascend" ? "ASC" : "DESC";
    const field = sorter.field || "createdAt";
    setSortBy(field);
    setSortOrder(order);
    fetchProducts(pagination.current);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await deleteProduct(id);
      const deletedProduct = products.find((p) => p.id === id);
      if (response.success) {
        if (deletedProduct!.quantitySold! > 0) {
          infoNotification(
            "Xóa sản phẩm",
            "Sản phẩm này đã được bán, chỉ ẩn sản phẩm khỏi cửa hàng"
          );
        } else if (deletedProduct!.quantity! > 0) {
          infoNotification(
            "Xóa sản phẩm",
            "Sản phẩm này vẫn còn trong kho, chỉ ẩn sản phẩm khỏi cửa hàng"
          );
        } else {
          successNotification("Xóa sản phẩm", "Xóa sản phẩm thành công");
        }

        fetchProducts(pagination.current);
      } else {
        errorNotification("Lỗi xóa sản phẩm", response.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      errorNotification("Lỗi hệ thống", "Không thể xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text, record) => {
        const isHot =
          record.discount?.discountPercent >= 20 || record.quantitySold >= 100;
        return (
          <Space>
            <span>{text}</span>
            {isHot && <Tag color="volcano">Hot</Tag>}
          </Space>
        );
      },
    },

    {
      title: "Hình ảnh",
      dataIndex: "variants",
      key: "variants",
      render: (variants: VariantProduct[]) =>
        variants.length > 0 ? (
          <Image
            src={variants[0].image}
            alt="Product"
            width={70}
            height={70}
            style={{ objectFit: "cover" }}
            preview
          />
        ) : (
          <span>Chưa có hình</span>
        ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      sorter: true,
      sortOrder:
        sortBy === "price" && sortOrder === "DESC"
          ? "descend"
          : sortBy === "price"
          ? "ascend"
          : undefined,
      render: (price: number) =>
        `${price} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      render: (discount: any) => {
        if (!discount) return <Tag color="default">Không có</Tag>;
        const now = dayjs();
        const start = dayjs(discount.startDate);
        const end = dayjs(discount.endDate);
        let color = "default";
        let label = "";

        if (now.isBefore(start)) {
          color = "orange";
          label = "Sắp diễn ra";
        } else if (now.isBefore(end)) {
          color = "green";
          label = "Đang diễn ra";
        } else {
          color = "red";
          label = "Đã kết thúc";
        }

        return (
          <Space>
            <Tag color={color}>{`${discount.discountPercent}%`}</Tag>
            <Tag color={color} bordered={false}>
              {label}
            </Tag>
          </Space>
        );
      },
    },

    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: true,
      render: (quantity: number) => {
        if (quantity === 0) return <Tag color="red">Hết hàng</Tag>;
        if (quantity < 10) return <Tag color="orange">{quantity}</Tag>;
        return <Tag color="green">{quantity}</Tag>;
      },
    },

    {
      title: "Thương hiệu",
      dataIndex: "brandId",
      key: "brandId",
      render: (brandId: string) => {
        const brandName = brands.find((b) => b.id === brandId)?.name || "Khác";
        return <Tag color="blue">{brandName}</Tag>;
      },
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "productTypeId",
      key: "productTypeId",
      render: (typeId: string) => {
        const typeName =
          productTypes.find((p) => p.id === typeId)?.name || "Khác";
        return <Tag color="purple">{typeName}</Tag>;
      },
    },

    {
      title: "Hiện",
      dataIndex: "isReleased",
      key: "isReleased",
      render: (isReleased: boolean) =>
        isReleased ? (
          <Badge status="success" text="Hiện" />
        ) : (
          <Badge status="error" text="Ẩn" />
        ),
    },

    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: BaseProduct) => (
        <Space>
          <Link to={`/products/edit/${record.id}`}>
            <Button type="link" icon={<EditOutlined />}>
              Sửa
            </Button>
          </Link>

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
        <h2>Quản lý sản phẩm</h2>
        <Link to="/products/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: "16px" }}>
        <Col span={6}>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            placeholder="Giá min"
            min={0}
            value={priceMin}
            onChange={(value) => setPriceMin(value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            placeholder="Giá max"
            min={0}
            value={priceMax}
            onChange={(value) => setPriceMax(value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Chọn thương hiệu"
            value={brandId}
            onChange={(value) => setBrandId(value)}
            style={{ width: "100%" }}
            allowClear
          >
            {brands.map((brand) => (
              <Option key={brand.id} value={brand.id}>
                {brand.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Chọn loại sản phẩm"
            value={productTypeId}
            onChange={(value) => setProductTypeId(value)}
            style={{ width: "100%" }}
            allowClear
          >
            {productTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Tình trạng bán ra"
            value={isReleased}
            onChange={(value) => setIsReleased(value)}
            style={{ width: "100%" }}
            allowClear
          >
            <Option key={"on-going"} value={true}>
              Đang bán
            </Option>
            <Option key={"stopped"} value={false}>
              Ngừng bán
            </Option>
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ProductsPage;
