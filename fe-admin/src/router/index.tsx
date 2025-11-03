import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import React from "react";
import MainLayout from "../components/Layout/MainLayout";
import LoginPage from "@/pages/Login";
import SuppliersPage from "@/pages/Suppliers";
import BrandsPage from "@/pages/Brands";
import ProductTypesPage from "@/pages/ProductType";
import ProductsPage from "@/pages/Products";
import AddProductPage from "@/pages/Products/AddProduct";
import DiscountPolicyPage from "@/pages/DiscountPolicy";
import EditProductPage from "@/pages/Products/EditProduct";
import GoodsReceiptsPage from "@/pages/GoodsReceipts";
import CreateGoodsReceiptPage from "@/pages/GoodsReceipts/AddGoodsReceipt";
import EditGoodsReceiptPage from "@/pages/GoodsReceipts/EditGoodsReceipt";
import ProductDetailPage from "@/pages/Products/DetailProduct";
import UsersPage from "@/pages/Users";
import AddUserPage from "@/pages/Users/AddUser";
import EditUserPage from "@/pages/Users/EditUser";
import DetailUserPage from "@/pages/Users/Detailuser";
import UnAuthLayout from "@/components/Layout/UnAuthLayout";
export const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => {},
});

export const router = createBrowserRouter([
  {
    element: <UnAuthLayout />,

    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "suppliers",
        element: <SuppliersPage />,
      },
      {
        path: "product-types",
        element: <ProductTypesPage />,
      },
      {
        path: "brands",
        element: <BrandsPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "products/add",
        element: <AddProductPage />,
      },
      {
        path: "products/edit/:id",
        element: <EditProductPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "discount-policies",
        element: <DiscountPolicyPage />,
      },
      {
        path: "goods-receipts",
        element: <GoodsReceiptsPage />,
      },
      {
        path: "goods-receipts/add",
        element: <CreateGoodsReceiptPage />,
      },
      {
        path: "goods-receipts/edit/:id",
        element: <EditGoodsReceiptPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "users/add",
        element: <AddUserPage />,
      },
      {
        path: "users/edit/:id",
        element: <EditUserPage />,
      },
      {
        path: "users/:id",
        element: <DetailUserPage />,
      },
    ],
  },
]);
