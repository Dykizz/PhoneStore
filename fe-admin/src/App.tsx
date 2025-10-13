import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { lightTheme, darkTheme } from "./theme";
import { ThemeProvider, useTheme } from "./providers/ThemeContext";

function AppContent() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <RouterProvider router={router} />
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
