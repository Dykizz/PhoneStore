import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../providers/ThemeContext";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "../Header";

const { Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

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
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/suppliers",
      icon: <ShopOutlined />,
      label: "Nhà cung cấp",
    },
    {
      key: "/product-types",
      icon: <ShopOutlined />,
      label: "Loại sản phẩm",
    },
    {
      key: "/brands",
      icon: <ShopOutlined />,
      label: "Thương hiệu",
    },
    {
      key: "/discount-policies",
      icon: <ShopOutlined />,
      label: "Chính sách giảm giá",
    },

    {
      key: "/products",
      icon: <ShopOutlined />,
      label: "Sản phẩm",
      children: [
        {
          key: "/products",
          label: "DS sản phẩm",
        },
        {
          key: "/products/add",
          label: "Thêm sản phẩm",
        },
      ],
    },
    {
      key: "/goods-receipts",
      icon: <ShopOutlined />,
      label: "Phiếu nhập hàng",
      children: [
        {
          key: "/goods-receipts",
          label: "DS phiếu nhập hàng",
        },
        {
          key: "/goods-receipts/add",
          label: "Tạo phiếu nhập hàng",
        },
      ],
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AuthProvider>
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
              backgroundColor: colorBgContainer, // Dùng cùng màu
            }}
          >
            <h2
              style={{
                margin: 0,
                fontWeight: "bold",
                color: isDark ? colorTextBase : colorPrimary,
                fontSize: collapsed ? "14px" : "16px",
                transition: "font-size 0.2s",
              }}
            >
              {collapsed ? "PS" : "Phone Store"}
            </h2>
          </div>

          <Menu
            theme={isDark ? "dark" : "light"}
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["/products"]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              backgroundColor: colorBgContainer, // Dùng cùng màu
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
    </AuthProvider>
  );
};

export default MainLayout;
