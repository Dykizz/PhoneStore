// filepath: d:\PhoneStore\fe-admin\src\pages\Statistics\index.tsx

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
import * as XLSX from "xlsx";
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
        console.error("Load stats error (api):", err);
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

  const formatDateByGranularity = (d: string) =>
    granularity === "day"
      ? dayjs(d).format("DD/MM/YYYY")
      : granularity === "month"
      ? dayjs(d).format("MM/YYYY")
      : dayjs(d).format("YYYY");

  const lineConfig = useMemo(() => {
    return {
      data: chartData,
      xField: "date",
      yField: "sold",
      smooth: true,
      color: "#2b8ef8",
      padding: "auto",
      xAxis: { tickCount: 6, label: { autoRotate: true } },
      yAxis: { label: { formatter: (v: any) => String(v) } },
      tooltip: {
        shared: true,
        showCrosshairs: true,
        customContent: (title: any, items: any[]) => {
          if (!title) return "";
          const rows = items
            .map((it) => {
              const value = it?.data?.sold ?? it?.value ?? 0;
              return `<li style="list-style:none;margin:4px 0;display:flex;justify-content:space-between">
                        <span style="display:inline-flex;align-items:center;gap:8px">
                          <span style="width:10px;height:10px;border-radius:50%;background:${
                            it.color
                          };display:inline-block"></span>
                          <span style="color:#666">Số lượng</span>
                        </span>
                        <span style="font-weight:600">${Number(value)}</span>
                      </li>`;
            })
            .join("");
          return `<div style="padding:8px">
                    <div style="margin-bottom:6px;font-weight:700">${formatDateByGranularity(
                      title
                    )}</div>
                    <ul style="padding:0;margin:0">${rows}</ul>
                  </div>`;
        },
      },
      interactions: [{ type: "marker-active" }],
      style: { lineWidth: 2 },
    } as any;
  }, [chartData, granularity]);

  const columnConfig = useMemo(() => {
    return {
      data: chartData,
      xField: "date",
      yField: "revenue",
      color: "#4caf50",
      padding: "auto",
      xAxis: { tickCount: 6, label: { autoRotate: true } },
      yAxis: {
        label: {
          formatter: (v: any) =>
            typeof v === "number" ? `${(v / 1000).toFixed(0)}k` : v,
        },
      },
      tooltip: {
        shared: true,
        showCrosshairs: true,
        customContent: (title: any, items: any[]) => {
          if (!title) return "";
          const rows = items
            .map((it) => {
              const value = it?.data?.revenue ?? it?.value ?? 0;
              return `<li style="list-style:none;margin:4px 0;display:flex;justify-content:space-between">
                        <span style="display:inline-flex;align-items:center;gap:8px">
                          <span style="width:10px;height:10px;border-radius:50%;background:${
                            it.color
                          };display:inline-block"></span>
                          <span style="color:#666">Doanh thu</span>
                        </span>
                        <span style="font-weight:600">${formatCurrencyVND(
                          Number(value)
                        )}</span>
                      </li>`;
            })
            .join("");
          return `<div style="padding:8px">
                    <div style="margin-bottom:6px;font-weight:700">${formatDateByGranularity(
                      title
                    )}</div>
                    <ul style="padding:0;margin:0">${rows}</ul>
                  </div>`;
        },
      },
      interactions: [{ type: "active-region" }],
      meta: { revenue: { alias: "Doanh thu" } },
    } as any;
  }, [chartData, granularity]);

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

  const exportStatistics = () => {
    const fromStr = range[0].startOf("day").format("YYYY-MM-DD");
    const toStr = range[1].endOf("day").format("YYYY-MM-DD");
    const fileName = `PhoneStore_Statistics_${fromStr}_to_${toStr}_${granularity}.xlsx`;

    const headerStyle = {
      fill: { fgColor: { rgb: "CCEEFF" } }, // Màu nền xanh nhạt
      font: { bold: true, color: { rgb: "000000" } }, // Chữ đậm màu đen
    };

    const currencyStyle = { numFmt: "#,##0" }; // Định dạng số không có chữ VND, chỉ có dấu phẩy ngăn cách

    const createSheetWithHeaderStyle = (data, header, title) => {
      const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

      if (header.length > 0) {
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
          if (!ws[cellRef]) continue;
          ws[cellRef].s = headerStyle;
        }
      }
      return ws;
    };

    const granularityLabel =
      granularity === "day"
        ? "Ngày"
        : granularity === "month"
        ? "Tháng"
        : "Năm";
    const summaryAoA = [
      ["Từ ngày", fromStr],
      ["Đến ngày", toStr],
      ["Phân tích theo", granularityLabel],
      ["Ngày xuất file", dayjs().format("YYYY-MM-DD HH:mm:ss")],
      ["Tổng sản phẩm đã bán", totals.totalSold],
      ["Tổng doanh thu", formatCurrencyVND(totals.totalRevenue)],
    ];

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoA);
    XLSX.utils.book_append_sheet(wb, wsSummary, "TỔNG QUAN");

    const tsHeader = ["Ngày", "Đã bán", "Doanh thu"];
    const tsRows = chartData.map((d) => [
      d.date,
      Number(d.sold || 0),
      formatCurrencyVND(Number(d.revenue || 0)),
    ]);
    const wsTS = createSheetWithHeaderStyle(
      tsRows,
      tsHeader,
      "Chuỗi thời gian"
    );

    for (let R = 1; R < tsRows.length + 1; ++R) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: 2 });
      if (wsTS[cellRef]) wsTS[cellRef].s = currencyStyle;
    }
    XLSX.utils.book_append_sheet(wb, wsTS, "Chuỗi thời gian");

    // 4. Sheet TopCustomers (Top 5 khách tạo doanh thu lớn)
    const tcHeader = [
      "STT",
      "Khách hàng",
      "Đơn hàng",
      "Doanh thu (Số)",
      "Doanh thu (VND)",
    ];
    const tcRows = (topCustomers || []).map((c, i) => [
      i + 1,
      c.name,
      c.orders,
      Number(c.revenue || 0),
      formatCurrencyVND(c.revenue || 0),
    ]);
    const wsTC = createSheetWithHeaderStyle(
      tcRows,
      tcHeader,
      "Top 5 khách hàng"
    );

    // Áp dụng định dạng tiền tệ cho cột Doanh thu (Số) (Cột D, index 3)
    for (let R = 1; R < tcRows.length + 1; ++R) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: 3 });
      if (wsTC[cellRef]) wsTC[cellRef].s = currencyStyle;
    }
    XLSX.utils.book_append_sheet(wb, wsTC, "Top 5 khách hàng");

    // 5. Sheet TopProducts (5 sản phẩm mua nhiều nhất)
    const tpHeader = [
      "STT",
      "Sản phẩm",
      "Đã bán",
      "Doanh thu (Số)",
      "Doanh thu (VND)",
    ];
    const tpRows = (topProducts || []).map((p, i) => [
      i + 1,
      p.name,
      p.sold,
      Number(p.revenue || 0),
      formatCurrencyVND(p.revenue || 0),
    ]);
    const wsTP = createSheetWithHeaderStyle(tpRows, tpHeader, "Top 5 sản phẩm");

    // Áp dụng định dạng tiền tệ cho cột Doanh thu (Số) (Cột D, index 3)
    for (let R = 1; R < tpRows.length + 1; ++R) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: 3 });
      if (wsTP[cellRef]) wsTP[cellRef].s = currencyStyle;
    }
    XLSX.utils.book_append_sheet(wb, wsTP, "Top 5 sản phẩm");

    // 6. Ghi và tải file Excel
    XLSX.writeFile(wb, fileName);
  };
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

        <Col>
          <Button onClick={exportStatistics} type="primary" disabled={loading}>
            Xuất Excel
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Số lượng mua" bordered={false}>
              <div style={{ height: 300 }}>
                <Line {...lineConfig} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Doanh thu" bordered={false}>
              <div style={{ height: 300 }}>
                <Column {...columnConfig} />
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24}>
            <Card title="Top 5 khách tạo doanh thu lớn" bordered={false}>
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
            <Card title="5 sản phẩm mua nhiều nhất" bordered={false}>
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
