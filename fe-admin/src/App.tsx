import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { lightTheme, darkTheme } from "./theme";
import { ThemeProvider, useTheme } from "./providers/ThemeContext";
import { App as AntdApp } from "antd";
import { NotificationProvider } from "./providers/NotificationProvider";

function AppContent() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <AntdApp>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
