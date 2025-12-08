import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  PercentageOutlined,
  TrademarkOutlined,
  AppstoreOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../providers/ThemeContext";
import Header from "../Header";
import apiClient from "@/utils/apiClient";

const { Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      apiClient.clearToken();
      window.location.href = "/login";
    }
  };
  const {
    token: {
      colorBgContainer,
      borderRadiusLG,
      colorPrimary,
      colorBgLayout,
      colorBorder,
      colorTextBase,
    },
  } = theme.useToken();

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/suppliers", icon: <TeamOutlined />, label: "Nhà cung cấp" },
    {
      key: "/product-types",
      icon: <AppstoreOutlined />,
      label: "Loại sản phẩm",
    },
    { key: "/brands", icon: <TrademarkOutlined />, label: "Thương hiệu" },
    {
      key: "/discount-policies",
      icon: <PercentageOutlined />,
      label: "Chính sách giảm giá",
    },
    {
      key: "/products",
      icon: <ShopOutlined />,
      label: "Sản phẩm",
      children: [
        { key: "/products/list", label: "DS sản phẩm" },
        { key: "/products/add", label: "Thêm sản phẩm" },
      ],
    },
    {
      key: "/goods-receipts",
      icon: <FileTextOutlined />,
      label: "Phiếu nhập hàng",
      children: [
        { key: "/goods-receipts/list", label: "DS phiếu nhập hàng" },
        { key: "/goods-receipts/add", label: "Tạo phiếu nhập hàng" },
      ],
    },
    { key: "/orders", icon: <ShoppingCartOutlined />, label: "Đơn hàng" },
    { key: "/statistics", icon: <DashboardOutlined />, label: "Thống kê" },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Người dùng",
      children: [
        { key: "/users/list", label: "DS người dùng" },
        { key: "/users/add", label: "Tạo người dùng" },
      ],
    },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
      return;
    }
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: colorBgLayout }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDark ? "dark" : "light"}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: colorBgContainer,
        }}
      >
        <div
          style={{
            height: "64px",
            padding: "16px",
            borderBottom: `1px solid ${colorBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colorBgContainer,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: "bold",
              color: isDark ? colorTextBase : colorPrimary,
              fontSize: collapsed ? "14px" : "16px",
              transition: "font-size 0.2s",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            {collapsed ? "PS" : "Phone Store"}
          </h2>
        </div>

        <Menu
          theme={isDark ? "dark" : "light"}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            backgroundColor: colorBgContainer,
            border: "none",
          }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
          backgroundColor: colorBgLayout,
        }}
      >
        <Header
          isDark={isDark}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          toggleTheme={toggleTheme}
        />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: "calc(100vh - 112px)",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
