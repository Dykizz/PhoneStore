import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Spin,
  DatePicker,
  Button,
  Select,
  Space,
  Statistic,
} from "antd";
import { Column, Line } from "@ant-design/charts";
import dayjs from "dayjs";
import { getStatistics } from "@/apis/statistics.api";
import type {
  StatisticsResponse,
  TimeSeriesStatistics,
  TopCustomerStatistics,
  TopProductStatistics,
} from "@/types/statistics.type";
import { formatCurrencyVND } from "@/utils/util";
import { Link } from "react-router-dom";

export default function StatisticsPage() {
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => [
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<StatisticsResponse>({
    soldAndRevenue: { labels: [], sold: [], revenue: [] },
    top5User: [],
    top5Product: [],
  });
  const [granularity, setGranularity] = useState<"day" | "month" | "year">(
    "day"
  );

  const fetchStats = useCallback(
    async (from: string, to: string) => {
      setLoading(true);
      try {
        const res = await getStatistics(from, to, granularity);
        if (res.success && res.data) {
          setRawData(res.data);
        }
      } catch (err) {
        console.error("Load stats error (api), fallback to mock:", err);
      } finally {
        setLoading(false);
      }
    },
    [granularity]
  );
  useEffect(() => {
    const from = range[0].startOf("day").toISOString();
    const to = range[1].endOf("day").toISOString();
    fetchStats(from, to);
  }, [range, fetchStats]);

  const timeSeries = useMemo(() => {
    const s: TimeSeriesStatistics = rawData.soldAndRevenue ?? {
      labels: [],
      sold: [],
      revenue: [],
    };
    return s.labels.map((label, idx) => ({
      date: label,
      sold: s.sold[idx] ?? 0,
      revenue: s.revenue[idx] ?? 0,
    }));
  }, [rawData.soldAndRevenue]);

  const totals = useMemo(() => {
    const s = rawData.soldAndRevenue ?? { labels: [], sold: [], revenue: [] };
    const totalSold = (s.sold || []).reduce(
      (acc, v) => acc + (Number(v) || 0),
      0
    );
    const totalRevenue = (s.revenue || []).reduce(
      (acc, v) => acc + (Number(v) || 0),
      0
    );
    return { totalSold, totalRevenue };
  }, [rawData.soldAndRevenue]);

  const topProducts: TopProductStatistics[] = rawData.top5Product ?? [];
  const topCustomers: TopCustomerStatistics[] = rawData.top5User ?? [];

  const chartData = useMemo(() => {
    return timeSeries.map((d) => ({
      date: d.date,
      sold: d.sold,
      revenue: d.revenue,
    }));
  }, [timeSeries]);

  const lineConfig = useMemo(() => {
    return {
      data: chartData,
      xField: "date",
      yField: "sold",

      interaction: {
        tooltip: {
          marker: false,
        },
      },
      style: {
        lineWidth: 2,
      },
    };
  }, [chartData]);

  const columnConfig = useMemo(() => {
    return {
      data: chartData,
      xField: "date",
      yField: "revenue",

      autoFit: true,
      maxColumnWidth: 40,
    };
  }, [chartData]);

  const customersColumns = [
    {
      title: "STT",
      key: "stt",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Khách hàng",
      render: (_: any, record: TopCustomerStatistics) => (
        <Link to={`/users/${record.customerId}`} rel="noopener noreferrer">
          {record.name}
        </Link>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "orders",
      key: "orders",
      align: "right" as const,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (v: number) => formatCurrencyVND(v),
    },
  ];

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} align="middle" className="mb-4">
        <Col flex="auto">
          <h2 className="font-semibold">Báo cáo thống kê</h2>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} md={12}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="Tổng sản phẩm đã bán"
                value={totals.totalSold}
                valueStyle={{ fontSize: 28, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 22 }}>📦</span>}
              />
              <div style={{ color: "#8b8b8b", fontSize: 12 }}>
                Tổng số sản phẩm đã bán trong khoảng thời gian đã chọn
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                title="Tổng doanh thu"
                value={formatCurrencyVND(totals.totalRevenue)}
                valueStyle={{ fontSize: 28, fontWeight: 700, color: "#389e0d" }}
              />
              <div style={{ color: "#8b8b8b", fontSize: 12 }}>
                Tổng doanh thu (bao gồm tất cả đơn hàng hợp lệ)
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" className="mb-4">
        <Col>
          <RangePicker
            value={range}
            onChange={(vals) => {
              if (!vals) return;
              setRange([vals[0]!, vals[1]!]);
            }}
            allowClear={false}
            disabled={loading}
          />
        </Col>

        <Col>
          <Select
            value={granularity}
            onChange={(v) => setGranularity(v)}
            style={{ width: 140 }}
          >
            <Option value="day">Theo ngày</Option>
            <Option value="month">Theo tháng</Option>
            <Option value="year">Theo năm</Option>
          </Select>
        </Col>

        <Col>
          <Button
            onClick={() => {
              const from = range[0].startOf("day").toISOString();
              const to = range[1].endOf("day").toISOString();
              fetchStats(from, to);
            }}
            loading={loading}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Số lượng mua" variant="borderless">
              <div style={{ height: 300 }}>
                <Line {...lineConfig} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Doanh thu" variant="borderless" className="mt-6">
              <div style={{ height: 300 }}>
                <Column {...columnConfig} />
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24}>
            <Card title="Top 5 khách tạo doanh thu lớn" variant="borderless">
              <Table
                dataSource={topCustomers}
                columns={customersColumns}
                pagination={false}
                rowKey={(r: TopCustomerStatistics) => r.customerId}
                size="small"
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24}>
            <Card
              title="5 sản phẩm mua nhiều nhất"
              variant="borderless"
              className="mt-6"
            >
              <Table
                dataSource={topProducts}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "STT",
                    key: "stt",
                    render: (_: any, __: any, index: number) => index + 1,
                  },

                  {
                    title: "Sản phẩm",
                    key: "name",
                    render: (_: any, record: TopProductStatistics) => (
                      <Link
                        to={`/products/${record.productId}`}
                        rel="noopener noreferrer"
                      >
                        {record.name}
                      </Link>
                    ),
                  },
                  {
                    title: "Đã bán",
                    dataIndex: "sold",
                    key: "sold",
                    align: "right" as const,
                  },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    key: "revenue",
                    align: "right" as const,
                    render: (v: number) => formatCurrencyVND(v),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
