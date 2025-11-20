import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  theme,
  Space,
  Spin,
  Tooltip,
  Button,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  getDashboardSummary,
  type DashboardSummary,
  getTodayRevenue,
  type TodayRevenueResponse,
} from "@/apis/dashboard.api";
import { formatCurrencyVND } from "@/utils/util";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const {
    token: { colorPrimary, colorSuccess, colorWarning, colorTextSecondary },
  } = theme.useToken();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenueResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, todayRes] = await Promise.all([
          getDashboardSummary(),
          getTodayRevenue(),
        ]);

        if (mounted) {
          if (summaryRes?.success && summaryRes.data) {
            setData(summaryRes.data);
          } else {
            setError("Không tải được dữ liệu bảng điều khiển");
          }

          if (todayRes?.success && todayRes.data) {
            setTodayRevenue(todayRes.data);
          } else {
            // không cần ấn lỗi nếu không có dữ liệu doanh thu
            setTodayRevenue(null);
          }
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || "Lỗi khi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Tính tổng user nếu response hợp lệ
  const totalUsers =
    data && data.userSummary
      ? (data.userSummary.admin || 0) +
        (data.userSummary.employee || 0) +
        (data.userSummary.user || 0)
      : 0;

  const haveRevenue = !!todayRevenue;

  const renderRevenueComparison = () => {
    if (!todayRevenue) return null;
    const { today, yesterday, change, isHigher, pctChange } = todayRevenue;
    return (
      <div style={{ marginTop: 8, fontSize: 13, color: colorTextSecondary }}>
        <div>
          Hôm nay: <Text strong>{formatCurrencyVND(today)}</Text>
        </div>
        <div>
          Hôm qua: <Text>{formatCurrencyVND(yesterday)}</Text>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <div
            style={{
              color: isHigher ? "#52c41a" : "#f5222d",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isHigher ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <Text strong style={{ color: isHigher ? "#52c41a" : "#f5222d" }}>
              {isHigher ? "+" : ""}
              {pctChange}% ({isHigher ? "+" : ""}
              {formatCurrencyVND(change)})
            </Text>
          </div>
          <div style={{ color: colorTextSecondary, fontSize: 12 }}>
            So với hôm qua
          </div>
        </div>
      </div>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Bảng điều khiển
        </Title>

        <div>
          <Text type="secondary" style={{ marginRight: 12 }}>
            Cập nhật: {new Date().toLocaleString()}
          </Text>
          <Button onClick={() => window.location.reload()} size="middle">
            Tải lại
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card hoverable bordered={false} style={{ borderRadius: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <Statistic
                    title="Tổng sản phẩm"
                    value={data ? data.productSummary.total : 0}
                    precision={0}
                    valueStyle={{
                      color: colorPrimary,
                      fontWeight: 700,
                      fontSize: 26,
                    }}
                    prefix={<ShoppingCartOutlined />}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      color: colorTextSecondary,
                      fontSize: 13,
                    }}
                  >
                    <Text type="secondary">Đã phát hành:</Text>{" "}
                    <Text strong>
                      {data ? data.productSummary.released : 0}
                    </Text>{" "}
                    <Text type="secondary" style={{ marginLeft: 12 }}>
                      Chưa phát hành:
                    </Text>{" "}
                    <Text strong>
                      {data ? data.productSummary.unreleased : 0}
                    </Text>
                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary">Tổng biến thể: </Text>
                      <Text>
                        {data ? data.productSummary.totalVariants : 0}
                      </Text>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, color: "#096dd9" }}>📦</div>
                  <div style={{ marginTop: 10 }}>
                    <Button type="link" href="/products" size="small">
                      Xem sản phẩm
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card hoverable bordered={false} style={{ borderRadius: 8 }}>
              <div>
                <Statistic
                  title="Tổng doanh thu (hôm nay)"
                  value={
                    haveRevenue
                      ? formatCurrencyVND(todayRevenue!.today)
                      : "Chưa có dữ liệu"
                  }
                  valueStyle={{
                    color: haveRevenue ? colorSuccess : "#595959",
                    fontWeight: 700,
                    fontSize: 26,
                  }}
                  precision={0}
                  prefix={<DollarOutlined />}
                />
                {haveRevenue ? (
                  renderRevenueComparison()
                ) : (
                  <div
                    style={{
                      marginTop: 8,
                      color: colorTextSecondary,
                      fontSize: 13,
                    }}
                  >
                    <Text type="secondary">
                      Chưa có dữ liệu doanh thu hôm nay
                    </Text>
                  </div>
                )}
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ marginLeft: "auto" }}>
                    <Button type="link" href="/orders" size="small">
                      Xem đơn hàng
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card hoverable bordered={false} style={{ borderRadius: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <Statistic
                    title="Người dùng"
                    value={totalUsers}
                    precision={0}
                    valueStyle={{
                      color: colorWarning,
                      fontWeight: 700,
                      fontSize: 26,
                    }}
                    prefix={<UserOutlined />}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      color: colorTextSecondary,
                      fontSize: 13,
                    }}
                  >
                    <Text type="secondary">Phân loại: </Text>
                    <Text strong>{data ? data.userSummary.admin : 0}</Text>{" "}
                    admin ·{" "}
                    <Text strong>{data ? data.userSummary.employee : 0}</Text>{" "}
                    nhân viên ·{" "}
                    <Text strong>{data ? data.userSummary.user : 0}</Text> khách
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, color: "#faad14" }}>👥</div>
                  <div style={{ marginTop: 10 }}>
                    <Button type="link" href="/users" size="small">
                      Quản lý người dùng
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {error ? (
          <Card style={{ marginTop: 16 }} type="inner">
            <Text type="danger">{error}</Text>
          </Card>
        ) : null}
      </Spin>
    </Space>
  );
};

export default Dashboard;
