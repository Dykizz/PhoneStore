import { MainLayout } from "@/components/layout/MainLayout";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import { Home } from "@/pages/Home";
import LoginPage from "@/pages/Login";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/Orders/OrderDetail";
import PaymentResult from "@/pages/PaymentResult";
import ProductDetail from "@/pages/ProductDetail";
import ProductsPage from "@/pages/Products";
import RegisterPage from "@/pages/Register";
import { createBrowserRouter } from "react-router-dom";
import CustomerProfilePage from "../pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
      {
        path: "payment/result",
        element: <PaymentResult />,
      },
      {
        path: "orders/:id",
        element: <OrderDetailPage />,
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/profile",
        element: <CustomerProfilePage />,
      },
    ],
  },
]);
