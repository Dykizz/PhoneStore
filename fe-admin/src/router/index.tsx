import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import React from "react";
import MainLayout from "../components/Layout/MainLayout";
export const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => {},
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
]);
