import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import React from "react";
import MainLayout from "../components/Layout/MainLayout";
import LoginPage from "@/pages/Login";
import SuppliersPage from "@/pages/Suppliers";
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
      {
        path: "login",
        element: <LoginPage />,
        children: [
          {
            path: "con",
          },
        ],
      },
      {
        path: "suppliers",
        element: <SuppliersPage />,
      },
    ],
  },
]);
