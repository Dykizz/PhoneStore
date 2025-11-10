import React from "react";
import { Card, Row, Col, Statistic, Typography, theme, Space } from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const {
    token: {
      colorPrimary,
      colorSuccess,
      colorError,
      colorWarning, // Thêm colorWarning nếu cần
    },
  } = theme.useToken();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={1} style={{ margin: 0 }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Products"
              value={1128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={112893}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: colorSuccess }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={892}
              prefix={<UserOutlined />}
              valueStyle={{ color: colorError }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;
