import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/user.type";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Switch, theme } from "antd";
import { useEffect } from "react";

const roleTile = (role: UserRole) => {
  if (role === "admin") return "Quản trị viên";
  if (role === "employee") return "Nhân viên";
  return "Người dùng";
};

export default function Header({
  collapsed,
  setCollapsed,
  isDark,
  toggleTheme,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
}) {
  const { Header } = Layout;
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken();

  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading) {
      logout();
      window.location.href = "/login";
    }
  }, [user, loading, logout]);

  return (
    <Header
      style={{
        height: "64px",
        padding: "0 16px",
        background: colorBgContainer,
        borderBottom: `1px solid ${colorBorder}`,
        position: "sticky",
        top: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 40,
          height: 40,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          checkedChildren="🌙"
          unCheckedChildren="☀️"
          size="small"
        />
        Xin chào, {roleTile(user?.role || "user")}
        <span>{user?.userName}</span>
      </div>
    </Header>
  );
}
